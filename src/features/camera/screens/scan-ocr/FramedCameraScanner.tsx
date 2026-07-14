// FramedCameraScanner.tsx
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  Platform,
  LayoutChangeEvent,
  PanResponder,
} from 'react-native';
import { Button, Spinner, styled, Text, View } from 'tamagui';
import {
  Camera,
  useCameraDevices,
} from 'react-native-vision-camera';
import { LottieAnimLoading } from '@shared/components/Feedback';
import { useThemeMode } from '@shared/components/Actions/ThemeToggle';
import { useFeedbackModal } from '@shared/components/Display/Modal';
import { buttonPressStyle } from '@shared/styles/pressFeedback';
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
  const { showFeedback } = useFeedbackModal();
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
    setRatios,
    handleScannerCapture,
    handleScannerCancel,
    formatTextDataWithRegex,
    resetScanner,
  } = useFrame();

  const { mode, orientation, pollIntervalMs, stableReadsRequired } = scanner;
  const isPhotoMode = mode === 'photo';
  const isLandscape = orientation === 'LandScape';
  const nativeOrientation = isLandscape ? 'landscape' : 'portrait';
  const [frameRatios, setFrameRatios] = useState(ratios);
  const [isResizing, setIsResizing] = useState(false);
  const frameRatiosRef = useRef(ratios);
  const frameRevisionRef = useRef(0);
  const isResizingRef = useRef(false);
  const resizeStartRatiosRef = useRef(ratios);
  
  const {
    screenWidth: SCREEN_W, screenHeight: SCREEN_H,
  } = geometry;

  const PREVIEW_W = cameraLayout.width || SCREEN_W;
  const PREVIEW_H = cameraLayout.height || SCREEN_H;
  const FRAME_W = PREVIEW_W * frameRatios.widthRatio;
  const FRAME_H = PREVIEW_H * frameRatios.heightRatio;
  const FRAME_X = (PREVIEW_W - FRAME_W) / 2;
  const FRAME_Y = (PREVIEW_H - FRAME_H) / 2;

  const handleCameraLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setCameraLayout(current => {
      if (current.width === width && current.height === height) return current;
      return { width, height };
    });
  }, []);

  const beginFrameResize = useCallback(() => {
    resizeStartRatiosRef.current = frameRatiosRef.current;
    frameRevisionRef.current += 1;
    isResizingRef.current = true;
    setIsResizing(true);
    setLiveResult(null);
    consecutiveSameReads.current = 0;
    lastTextRef.current = '';
  }, []);

  const updateFrameResize = useCallback((
    horizontalDirection: number,
    verticalDirection: number,
    translationX: number,
    translationY: number,
  ) => {
    const start = resizeStartRatiosRef.current;
    const next = {
      widthRatio: clamp(
        start.widthRatio + horizontalDirection * ((translationX * 2) / PREVIEW_W),
        MIN_FRAME_WIDTH_RATIO,
        MAX_FRAME_WIDTH_RATIO,
      ),
      heightRatio: clamp(
        start.heightRatio + verticalDirection * ((translationY * 2) / PREVIEW_H),
        MIN_FRAME_HEIGHT_RATIO,
        MAX_FRAME_HEIGHT_RATIO,
      ),
    };

    if (
      next.widthRatio === frameRatiosRef.current.widthRatio &&
      next.heightRatio === frameRatiosRef.current.heightRatio
    ) {
      return;
    }

    frameRatiosRef.current = next;
    frameRevisionRef.current += 1;
    setFrameRatios(next);
  }, [PREVIEW_H, PREVIEW_W]);

  const finishFrameResize = useCallback(() => {
    if (!isResizingRef.current) return;

    isResizingRef.current = false;
    setIsResizing(false);
    setRatios(frameRatiosRef.current);
  }, [setRatios]);

  const resizeResponders = useMemo(() => {
    const createResponder = (horizontalDirection: number, verticalDirection: number) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: beginFrameResize,
        onPanResponderMove: (_event, gestureState) => {
          updateFrameResize(
            horizontalDirection,
            verticalDirection,
            gestureState.dx,
            gestureState.dy,
          );
        },
        onPanResponderRelease: finishFrameResize,
        onPanResponderTerminate: finishFrameResize,
        onPanResponderTerminationRequest: () => false,
      });

    return {
      bottomLeft: createResponder(-1, 1),
      bottomRight: createResponder(1, 1),
      topLeft: createResponder(-1, -1),
      topRight: createResponder(1, -1),
    };
  }, [beginFrameResize, finishFrameResize, updateFrameResize]);

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
    frameRatiosRef.current = ratios;
    frameRevisionRef.current += 1;
    isResizingRef.current = false;
    setFrameRatios(ratios);
    setIsResizing(false);
    consecutiveSameReads.current = 0;
    lastTextRef.current = '';
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
    if (isProcessingRef.current || isResizingRef.current || !cameraRef.current) return;
    isProcessingRef.current = true;
    const frameRevision = frameRevisionRef.current;

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

      if (isResizingRef.current || frameRevision !== frameRevisionRef.current) return;

      // Stability check — same read N times in a row = stable
      if (text === lastTextRef.current && text.length > 0) {
        consecutiveSameReads.current++;
      } else {
        consecutiveSameReads.current = 1;
        lastTextRef.current = text;
      }

      const isStable = consecutiveSameReads.current >= stableReadsRequired;

      const result: LiveOCRResult = { text, fields, matchedFields, isStable };
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
  // Final capture — keeps the confirmed live text and captures its cropped photo
  // -------------------------------------------------------------------------
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing || isResizingRef.current) return;

    const stableLiveResult = liveResult?.isStable && liveResult.text.trim()
      ? liveResult
      : null;

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

      let text = stableLiveResult?.text.trim() || '';
      let fields = stableLiveResult?.fields || {};
      let matchedFields = stableLiveResult?.matchedFields || 0;

      if (!text) {
        const ocrResult = await recognizeTextFromImage(result.path);
        const rawText = ocrResult?.text?.trim() || '';
        text = formatTextDataWithRegex.current
          ? formatTextDataWithRegex.current(rawText)
          : rawText;
        fields = ocrResult?.fields || {};
        matchedFields = ocrResult?.matchedFields || 0;
      }

      if (!text) {
        throw new Error('Não foi possível ler o código na foto capturada. Tente novamente.');
      }

      await setOcrScreenOrientation('portrait').catch(() => undefined);
      handleScannerCapture({
        imageUri: result.path,
        text,
        fields,
        matchedFields,
        isStable: true,
      });
    } catch (error) {
      console.error('Capture error:', error);
      showFeedback({
        title: 'Erro',
        message: getCameraErrorMessage(error),
      });
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isPhotoMode, liveResult, handleScannerCapture, computePhotoCropRect, showFeedback]);

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
  const helpTop = Math.max(24, FRAME_Y - (isLandscape ? 120 : 220));
  const scannerActionsTop = Math.min(FRAME_Y + FRAME_H + 40, PREVIEW_H - 72);
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
          <OverlayBlock pointerEvents="none" top={0} left={0} width={PREVIEW_W} height={FRAME_Y} backgroundColor={dim} />
          <OverlayBlock
            pointerEvents="none"
            top={FRAME_Y + FRAME_H}
            left={0}
            width={PREVIEW_W}
            height={PREVIEW_H - (FRAME_Y + FRAME_H)}
            backgroundColor={dim}
          />
          <OverlayBlock pointerEvents="none" top={FRAME_Y} left={0} width={FRAME_X} height={FRAME_H} backgroundColor={dim} />
          <OverlayBlock
            pointerEvents="none"
            top={FRAME_Y}
            left={FRAME_X + FRAME_W}
            width={PREVIEW_W - (FRAME_X + FRAME_W)}
            height={FRAME_H}
            backgroundColor={dim}
          />

          {/* Frame border — color changes based on detection state */}
          <FrameBorder
            pointerEvents="none"
            top={FRAME_Y}
            left={FRAME_X}
            width={FRAME_W}
            height={FRAME_H}
            borderColor={frameBorderColor}
          />

          <ResizeHandle
            {...resizeResponders.topLeft.panHandlers}
            accessible
            accessibilityLabel="Ajustar canto superior esquerdo da área de leitura"
            top={FRAME_Y - RESIZE_HANDLE_SIZE / 2}
            left={FRAME_X - RESIZE_HANDLE_SIZE / 2}
          >
            <ResizeHandleKnob borderColor={frameBorderColor} />
          </ResizeHandle>
          <ResizeHandle
            {...resizeResponders.topRight.panHandlers}
            accessible
            accessibilityLabel="Ajustar canto superior direito da área de leitura"
            top={FRAME_Y - RESIZE_HANDLE_SIZE / 2}
            left={FRAME_X + FRAME_W - RESIZE_HANDLE_SIZE / 2}
          >
            <ResizeHandleKnob borderColor={frameBorderColor} />
          </ResizeHandle>
          <ResizeHandle
            {...resizeResponders.bottomLeft.panHandlers}
            accessible
            accessibilityLabel="Ajustar canto inferior esquerdo da área de leitura"
            top={FRAME_Y + FRAME_H - RESIZE_HANDLE_SIZE / 2}
            left={FRAME_X - RESIZE_HANDLE_SIZE / 2}
          >
            <ResizeHandleKnob borderColor={frameBorderColor} />
          </ResizeHandle>
          <ResizeHandle
            {...resizeResponders.bottomRight.panHandlers}
            accessible
            accessibilityLabel="Ajustar canto inferior direito da área de leitura"
            top={FRAME_Y + FRAME_H - RESIZE_HANDLE_SIZE / 2}
            left={FRAME_X + FRAME_W - RESIZE_HANDLE_SIZE / 2}
          >
            <ResizeHandleKnob borderColor={frameBorderColor} />
          </ResizeHandle>

          {/* Live OCR preview above the frame */}
          <HelpBox pointerEvents="none" top={helpTop} width={PREVIEW_W}>
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
              <HelpText>
                {isResizing ? 'Ajustando área de leitura...' : 'Alinhe a etiqueta ou arraste os cantos'}
              </HelpText>
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
        {...(isPhotoMode ? { bottom: 32 } : { top: scannerActionsTop })}
      >
        <ActionButton
          actionVariant="cancel"
          onPress={handleCancel}
          disabled={isCapturing || isResizing}
        >
          <ActionButtonText>Cancelar</ActionButtonText>
        </ActionButton>

        <ActionButton
          actionVariant={!isPhotoMode && liveResult?.isStable ? "stable" : "capture"}
          onPress={handleCapture}
          disabled={isCapturing || isResizing}
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

function getCameraErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.trim() : '';
  const normalizedMessage = message.toLowerCase();

  if (
    message.startsWith('Não ') ||
    message.startsWith('Nenhum ') ||
    message.startsWith('Ocorreu ') ||
    message.startsWith('A câmera ')
  ) {
    return message;
  }

  if (normalizedMessage.includes('not enough storage')) {
    return 'Não há espaço de armazenamento suficiente.';
  }

  if (normalizedMessage.includes('not ready')) {
    return 'A câmera ainda não está pronta. Aguarde e tente novamente.';
  }

  if (normalizedMessage.includes('permission')) {
    return 'Não foi possível acessar a câmera. Verifique a permissão do aplicativo.';
  }

  if (normalizedMessage.includes('no text found')) {
    return 'Nenhum texto foi encontrado na imagem.';
  }

  return 'Não foi possível capturar a imagem. Tente novamente.';
}

const absoluteFillStyle = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const MIN_FRAME_WIDTH_RATIO = 0.1;
const MAX_FRAME_WIDTH_RATIO = 0.96;
const MIN_FRAME_HEIGHT_RATIO = 0.05;
const MAX_FRAME_HEIGHT_RATIO = 0.9;
const RESIZE_HANDLE_SIZE = 44;

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

const ResizeHandle = styled(View, {
  alignItems: 'center',
  height: RESIZE_HANDLE_SIZE,
  justifyContent: 'center',
  position: 'absolute',
  width: RESIZE_HANDLE_SIZE,
  zIndex: 20,
});

const ResizeHandleKnob = styled(View, {
  backgroundColor: '$white',
  borderRadius: 999,
  borderWidth: 3,
  height: 20,
  width: 20,
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
  pressStyle: buttonPressStyle,
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}
