// FramedCameraScanner.tsx
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  Alert,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Button, Spinner, styled, Text, View } from 'tamagui';
import {
  Camera,
  useCameraDevices,
} from 'react-native-vision-camera';
import { LottieAnimLoading } from '@shared/components/Feedback';
import { useThemeMode } from '@shared/components/Actions/ThemeToggle';
import type {
  CameraPermissionStatus,
  CameraDevice,
  CameraDeviceFormat,
} from 'react-native-vision-camera';
import { cropImageForOcr, recognizeTextFromImage, setOcrScreenOrientation } from '../../services';
import { useFrame } from '../../providers';

export type { ScannerCaptureResult } from '../../providers';

export interface LiveOCRResult {
  text: string;
  fields: Record<string, string>;
  matchedFields: number;
  isStable: boolean;
}

export const FramedCameraScanner: React.FC = () => {
  const cameraRef = useRef<Camera>(null);
  const { theme } = useThemeMode();
  const devices = useCameraDevices();
  const device = useMemo(() => {
    if (!devices) return undefined;
    if (Array.isArray(devices)) {
      return devices.find((d: CameraDevice) => d.position === 'back');
    }
    return devices;
  }, [devices]);
  const bestPhotoFormat = useMemo<CameraDeviceFormat | undefined>(() => {
    const firstFormat = device?.formats?.[0];
    if (!firstFormat) return undefined;

    return device.formats.reduce((best, format) => {
      const bestPixels = best.photoWidth * best.photoHeight;
      const formatPixels = format.photoWidth * format.photoHeight;

      return formatPixels > bestPixels ? format : best;
    }, firstFormat);
  }, [device]);

  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>('not-determined');
  const [isCapturing, setIsCapturing] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveOCRResult | null>(null);
  const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });

  // Refs avoid re-creating the poll loop on every render
  const isPollingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const consecutiveSameReads = useRef(0);
  const lastTextRef = useRef<string>('');
  const latestResultRef = useRef<LiveOCRResult | null>(null);

  const requestPermission = useCallback(async () => {
    const status = await Camera.requestCameraPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  useEffect(() => {
    (async () => {
      const current = await Camera.getCameraPermissionStatus();
      setPermissionStatus(current);
      if (current !== 'denied') await requestPermission();
    })();
  }, [requestPermission]);

  const hasPermission = permissionStatus === 'granted';

  const {
    geometry,
    ratios,
    scanner,
    handleScannerCapture,
    handleScannerCancel,
    formatTextDataWithRegex,
    resetScanner,
  } = useFrame();

  const { mode, orientation, pollIntervalMs, stableReadsRequired } = scanner;
  const isPhotoMode = mode === 'photo';
  const isLandscape = orientation === 'LandScape';
  const nativeOrientation = isLandscape ? 'landscape' : 'portrait';
  
  const {
    screenWidth: SCREEN_W, screenHeight: SCREEN_H,
  } = geometry;

  const PREVIEW_W = cameraLayout.width || SCREEN_W;
  const PREVIEW_H = cameraLayout.height || SCREEN_H;
  const FRAME_W = PREVIEW_W * ratios.widthRatio;
  const FRAME_H = PREVIEW_H * ratios.heightRatio;
  const FRAME_X = (PREVIEW_W - FRAME_W) / 2;
  const FRAME_Y = (PREVIEW_H - FRAME_H) / 2;

  const handleCameraLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setCameraLayout(current => {
      if (current.width === width && current.height === height) return current;
      return { width, height };
    });
  }, []);

  useEffect(() => {
    setOcrScreenOrientation(nativeOrientation).catch(() => undefined);

    return () => {
      setOcrScreenOrientation('portrait').catch(() => undefined);
    };
  }, [nativeOrientation]);

  useEffect(() => () => {
    setOcrScreenOrientation('portrait').catch(() => undefined);
    resetScanner();
  }, [resetScanner]);

  useEffect(() => {
    isPollingRef.current = false;
    consecutiveSameReads.current = 0;
    lastTextRef.current = '';
    latestResultRef.current = null;
    setLiveResult(null);
  }, [mode, orientation, ratios]);

  // -------------------------------------------------------------------------
  // Map screen frame → photo pixel coords
  // -------------------------------------------------------------------------
  const computePhotoCropRect = useCallback((rawW: number, rawH: number) => {
    // Normalize photo dims to match screen orientation. vision-camera returns
    // sensor-native dims (landscape on most Android phones), but the native
    // cropImage rotates the bitmap via EXIF before cropping. Swap so our math
    // targets the post-rotation bitmap — this is why it worked on Tab A9 but
    // broke on other devices with different sensor/EXIF alignment.
    const screenIsPortrait = PREVIEW_H > PREVIEW_W;
    const photoIsPortrait = rawH > rawW;
    const photoW = screenIsPortrait === photoIsPortrait ? rawW : rawH;
    const photoH = screenIsPortrait === photoIsPortrait ? rawH : rawW;

    const screenAspect = PREVIEW_W / PREVIEW_H;
    const photoAspect = photoW / photoH;


    let visibleW: number, visibleH: number, offsetX: number, offsetY: number;
    if (photoAspect > screenAspect) {
      visibleH = photoH;
      visibleW = photoH * screenAspect;
    
      offsetX = (photoW - visibleW) / 2;
      offsetY = 0;
    } else {
      visibleW = photoW;
      visibleH = photoW / screenAspect;
      offsetX = 0;
      offsetY = (photoH - visibleH) / 2;
    }
    const scaleX = visibleW / PREVIEW_W;
    const scaleY = visibleH / PREVIEW_H;
    return {
      cropX: Math.round(offsetX + FRAME_X * scaleX),
      cropY: Math.round(offsetY + FRAME_Y * scaleY),
      cropW: Math.round(FRAME_W * scaleX),
      cropH: Math.round(FRAME_H * scaleY),
    };
  }, [PREVIEW_W, PREVIEW_H, FRAME_X, FRAME_Y, FRAME_W, FRAME_H]);

  const computeSnapshotCropRect = useCallback((rawW: number, rawH: number) => {
    if (Platform.OS !== 'android') {
      return computePhotoCropRect(rawW, rawH);
    }

    // Android snapshots are screenshots of the preview view, not sensor photos.
    // Therefore the overlay maps directly to the snapshot bitmap dimensions.
    const scaleX = rawW / PREVIEW_W;
    const scaleY = rawH / PREVIEW_H;

    return {
      cropX: Math.round(FRAME_X * scaleX),
      cropY: Math.round(FRAME_Y * scaleY),
      cropW: Math.round(FRAME_W * scaleX),
      cropH: Math.round(FRAME_H * scaleY),
    };
  }, [PREVIEW_W, PREVIEW_H, FRAME_X, FRAME_Y, FRAME_W, FRAME_H, computePhotoCropRect]);

  // -------------------------------------------------------------------------
  // Live OCR loop — takes snapshots and runs OCR in the background
  // -------------------------------------------------------------------------
  const runOCRTick = useCallback(async () => {
    if (isProcessingRef.current || !cameraRef.current) return;
    isProcessingRef.current = true;

    try {
      // takeSnapshot is much faster than takePhoto — ~100ms vs ~800ms.
      // Perfect for live feedback, though lower quality.
      const snapshot = await cameraRef.current.takeSnapshot({
        quality: 80,
      });

      const snapPath = Platform.OS === 'android'
        ? `file://${snapshot.path}`
        : snapshot.path;

      // Crop to frame before OCR — faster and filters out noise outside the frame
      const { cropX, cropY, cropW, cropH } = computeSnapshotCropRect(
        snapshot.width, snapshot.height,
      );

      const cropped = await cropImageForOcr(
        snapPath, cropX, cropY, cropW, cropH,
      );

      // Single pass OCR, no rotation retries — speed matters here
      const ocrResult = await recognizeTextFromImage(cropped.path, {
        multipleAttempts: false,
      });
      if (!ocrResult) return;

      const rawText = ocrResult.text?.trim() || '';
      const text = formatTextDataWithRegex.current
        ? formatTextDataWithRegex.current(rawText)
        : rawText;
      const fields = ocrResult.fields || {};
      const matchedFields = ocrResult.matchedFields || 0;

      // Stability check — same read N times in a row = stable
      if (text === lastTextRef.current && text.length > 0) {
        consecutiveSameReads.current++;
      } else {
        consecutiveSameReads.current = 1;
        lastTextRef.current = text;
      }

      const isStable = consecutiveSameReads.current >= stableReadsRequired;

      const result: LiveOCRResult = { text, fields, matchedFields, isStable };
      latestResultRef.current = result;
      setLiveResult(result);

    } catch {
      // Failed OCR on a snapshot isn't fatal — just skip this tick
    } finally {
      isProcessingRef.current = false;
    }
  }, [computeSnapshotCropRect, formatTextDataWithRegex, stableReadsRequired]);

  const handleCancel = useCallback(async () => {
    await setOcrScreenOrientation('portrait').catch(() => undefined);
    handleScannerCancel();
  }, [handleScannerCancel]);

  // Start/stop the polling loop based on camera readiness
  useEffect(() => {
    if (isPhotoMode || !hasPermission || !device || isCapturing) {
      isPollingRef.current = false;
      return;
    }

    isPollingRef.current = true;
    const interval = setInterval(() => {
      if (isPollingRef.current) runOCRTick();
    }, pollIntervalMs);

    return () => {
      isPollingRef.current = false;
      clearInterval(interval);
    };
  }, [isPhotoMode, hasPermission, device, isCapturing, pollIntervalMs, runOCRTick]);

  // -------------------------------------------------------------------------
  // Final capture — uses the most recent live result + a high-quality photo
  // -------------------------------------------------------------------------
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      isPollingRef.current = false; // stop live loop during capture

      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const photoPath = Platform.OS === 'android'
        ? `file://${photo.path}`
        : photo.path;

      if (isPhotoMode) {
        await setOcrScreenOrientation('portrait').catch(() => undefined);
        handleScannerCapture({
          imageUri: photoPath,
          text: '',
          fields: {},
          matchedFields: 0,
          isStable: true,
        });
        return;
      }

      const { cropX, cropY, cropW, cropH } = computePhotoCropRect(
        photo.width, photo.height,
      );

      const result = await cropImageForOcr(
        photoPath, cropX, cropY, cropW, cropH,
      );

      const liveData = latestResultRef.current;

      await setOcrScreenOrientation('portrait').catch(() => undefined);
      handleScannerCapture({
        imageUri: result.path,
        text: liveData?.text?.trim() || '',
        fields: liveData?.fields || {},
        matchedFields: liveData?.matchedFields || 0,
        isStable: liveData?.isStable || false,
      });
    } catch (err: any) {
      console.error('Capture error:', err);
      Alert.alert('Erro', err?.message || 'Não foi possível capturar a imagem');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isPhotoMode, handleScannerCapture, computePhotoCropRect]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (permissionStatus === 'not-determined') {
    return <Center><LottieAnimLoading label="Carregando câmera" size={150} /></Center>;
  }

  if (!hasPermission) {
    return (
      <Center>
        <PermissionText>Permissão de câmera necessária</PermissionText>
        <ActionButton actionVariant="capture" onPress={requestPermission}>
          <ActionButtonText>Solicitar permissão</ActionButtonText>
        </ActionButton>
        <ActionButton actionVariant="cancel" marginTop={12} onPress={handleCancel}>
          <ActionButtonText>Voltar</ActionButtonText>
        </ActionButton>
      </Center>
    );
  }

  if (!device) {
    return (
      <Center>
        <LottieAnimLoading label="Carregando câmera" size={150} />
      </Center>
    );
  }

  const dim = 'rgba(0, 0, 0, 0.6)';
  const hasLive = liveResult && liveResult.text.length > 0;
  const frameBorderColor = liveResult?.isStable ? theme.success : hasLive ? theme.warning : theme.white;
  return (
    <ScannerRoot>
      <Camera
        ref={cameraRef}
        style={absoluteFillStyle}
        onLayout={handleCameraLayout}
        device={device}
        isActive={true}
        photo={true}
        format={isPhotoMode ? bestPhotoFormat : undefined}
        photoQualityBalance={isPhotoMode ? 'quality' : 'balanced'}
        outputOrientation="preview"
        resizeMode="cover"
      />

      {!isPhotoMode && (
        <>
          {/* Dimmed overlay */}
          <OverlayBlock top={0} left={0} width={PREVIEW_W} height={FRAME_Y} backgroundColor={dim} />
          <OverlayBlock
            top={FRAME_Y + FRAME_H}
            left={0}
            width={PREVIEW_W}
            height={PREVIEW_H - (FRAME_Y + FRAME_H)}
            backgroundColor={dim}
          />
          <OverlayBlock top={FRAME_Y} left={0} width={FRAME_X} height={FRAME_H} backgroundColor={dim} />
          <OverlayBlock
            top={FRAME_Y}
            left={FRAME_X + FRAME_W}
            width={PREVIEW_W - (FRAME_X + FRAME_W)}
            height={FRAME_H}
            backgroundColor={dim}
          />

          {/* Frame border — color changes based on detection state */}
          <FrameBorder
            top={FRAME_Y}
            left={FRAME_X}
            width={FRAME_W}
            height={FRAME_H}
            borderColor={frameBorderColor}
          />

          {/* Live OCR preview above the frame */}
          <HelpBox top={FRAME_Y - (isLandscape ? 120 : 220)} width={PREVIEW_W}>
            {hasLive ? (
              <LivePreview>
                <LiveLabel>
                  {liveResult!.isStable ? '✓ Estável' : 'Lendo...'}
                </LiveLabel>
                <LiveText numberOfLines={2}>
                  {liveResult!.text}
                </LiveText>
                {liveResult!.matchedFields > 0 && (
                  <LiveFields>
                    {liveResult!.matchedFields} campo(s) detectado(s)
                  </LiveFields>
                )}
              </LivePreview>
            ) : (
              <HelpText>Alinhe a etiqueta dentro da área</HelpText>
            )}
          </HelpBox>
        </>
      )}

      {isPhotoMode && (
        <PhotoHelpBox width={PREVIEW_W}>
          <HelpText>Enquadre a foto do Palete</HelpText>
        </PhotoHelpBox>
      )}

      {/* Action buttons */}
      <Actions
        width={PREVIEW_W}
        {...(isPhotoMode ? { bottom: 32 } : { top: FRAME_Y + FRAME_H + 40 })}
      >
        <ActionButton
          actionVariant="cancel"
          onPress={handleCancel}
          disabled={isCapturing}
        >
          <ActionButtonText>Cancelar</ActionButtonText>
        </ActionButton>

        <ActionButton
          actionVariant={!isPhotoMode && liveResult?.isStable ? "stable" : "capture"}
          onPress={handleCapture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <Spinner color={theme.white} />
          ) : (
            <ActionButtonText>
              {isPhotoMode ? 'Tirar foto' : liveResult?.isStable ? 'Confirmar' : 'Capturar'}
            </ActionButtonText>
          )}
        </ActionButton>
      </Actions>
    </ScannerRoot>
  );
};

const absoluteFillStyle = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const ScannerRoot = styled(View, {
  backgroundColor: '$black',
  flex: 1,
});

const Center = styled(View, {
  alignItems: 'center',
  backgroundColor: '$black',
  flex: 1,
  justifyContent: 'center',
});

const PermissionText = styled(Text, {
  color: '$white',
  fontSize: 16,
  marginBottom: 20,
});

const OverlayBlock = styled(View, {
  position: 'absolute',
});

const FrameBorder = styled(View, {
  borderRadius: 8,
  borderWidth: 3,
  position: 'absolute',
});

const HelpBox = styled(View, {
  alignItems: 'center',
  paddingHorizontal: 20,
  position: 'absolute',
});

const PhotoHelpBox = styled(View, {
  alignItems: 'center',
  paddingHorizontal: 20,
  position: 'absolute',
  top: 28,
});

const HelpText = styled(Text, {
  color: '$white',
  fontSize: 16,
  fontWeight: '600',
  textShadowColor: 'rgba(0,0,0,0.8)',
  textShadowRadius: 4,
});

const LivePreview = styled(View, {
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  borderColor: '$primary',
  borderRadius: 8,
  borderWidth: 1.5,
  maxWidth: '90%',
  paddingHorizontal: 16,
  paddingVertical: 10,
});

const LiveLabel = styled(Text, {
  color: '$warning',
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 1,
  marginBottom: 4,
});

const LiveText = styled(Text, {
  color: '$white',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
});

const LiveFields = styled(Text, {
  color: '$success',
  fontSize: 12,
  fontWeight: '600',
  marginTop: 4,
});

const Actions = styled(View, {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingHorizontal: 40,
  position: 'absolute',
});

const ActionButton = styled(Button, {
  unstyled: true,
  alignItems: 'center',
  borderRadius: 30,
  minWidth: 120,
  paddingHorizontal: 24,
  paddingVertical: 14,
  variants: {
    actionVariant: {
      cancel: { backgroundColor: '$mutedText' },
      capture: { backgroundColor: '$primary' },
      stable: { backgroundColor: '$success' },
    },
  } as const,
});

const ActionButtonText = styled(Text, {
  color: '$white',
  fontSize: 16,
  fontWeight: '600',
});
