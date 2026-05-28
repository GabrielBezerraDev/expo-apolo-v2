// FramedCameraScanner.tsx
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  NativeModules,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import { useFrame } from '@hooks/useFrame';

const { OCRModule } = NativeModules;

interface Props {
  onCapture: (croppedImagePath: string, liveData?: LiveOCRResult) => void;
  onCancel: () => void;
  /** How often to re-run OCR on the preview (ms). Default 600ms. */
  pollIntervalMs?: number;
  /** Require this many consecutive identical reads before showing "stable". Default 2. */
  stableReadsRequired?: number;
}

export interface LiveOCRResult {
  text: string;
  fields: Record<string, string>;
  matchedFields: number;
  isStable: boolean;
}

export const FramedCameraScanner: React.FC<Props> = ({
  onCapture,
  onCancel,
  pollIntervalMs = 600,
  stableReadsRequired = 2,
}) => {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = useMemo(() => {
    if (!devices) return undefined;
    if (Array.isArray(devices)) {
      return devices.find((d: any) => d.position === 'back');
    }
    return devices.back;
  }, [devices]);

  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>('not-determined');
  const [isCapturing, setIsCapturing] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveOCRResult | null>(null);

  // Refs avoid re-creating the poll loop on every render
  const isPollingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const consecutiveSameReads = useRef(0);
  const lastTextRef = useRef<string>('');
  const latestResultRef = useRef<LiveOCRResult | null>(null);

  const requestPermission = useCallback(async () => {
    Alert.alert('TESTE');
    const status = await Camera.requestCameraPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  useEffect(() => {
    (async () => {
      const current = await Camera.getCameraPermissionStatus();
      setPermissionStatus(current);
      if (current !== 'authorized') await requestPermission();
    })();
  }, [requestPermission]);

  const hasPermission = permissionStatus === 'authorized';

  const { geometry } = useFrame();
  const {
    width: FRAME_W, height: FRAME_H,
    x: FRAME_X, y: FRAME_Y,
    screenWidth: SCREEN_W, screenHeight: SCREEN_H,
  } = geometry;

  // -------------------------------------------------------------------------
  // Map screen frame → photo pixel coords
  // -------------------------------------------------------------------------
  const computeCropRect = useCallback((rawW: number, rawH: number) => {
    // Normalize photo dims to match screen orientation. vision-camera returns
    // sensor-native dims (landscape on most Android phones), but the native
    // cropImage rotates the bitmap via EXIF before cropping. Swap so our math
    // targets the post-rotation bitmap — this is why it worked on Tab A9 but
    // broke on other devices with different sensor/EXIF alignment.
    const screenIsPortrait = SCREEN_H > SCREEN_W;
    const photoIsPortrait = rawH > rawW;
    const photoW = screenIsPortrait === photoIsPortrait ? rawW : rawH;
    const photoH = screenIsPortrait === photoIsPortrait ? rawH : rawW;

    const screenAspect = SCREEN_W / SCREEN_H;
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
    const scaleX = visibleW / SCREEN_W;
    const scaleY = visibleH / SCREEN_H;
    return {
      cropX: Math.round(offsetX + FRAME_X * scaleX),
      cropY: Math.round(offsetY + FRAME_Y * scaleY),
      cropW: Math.round(FRAME_W * scaleX),
      cropH: Math.round(FRAME_H * scaleY),
    };
  }, [SCREEN_W, SCREEN_H, FRAME_X, FRAME_Y, FRAME_W, FRAME_H]);

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
        skipMetadata: true,
      });

      const snapPath = Platform.OS === 'android'
        ? `file://${snapshot.path}`
        : snapshot.path;

      // Crop to frame before OCR — faster and filters out noise outside the frame
      const { cropX, cropY, cropW, cropH } = computeCropRect(
        snapshot.width, snapshot.height,
      );

      const cropped = await OCRModule.cropImage(
        snapPath, cropX, cropY, cropW, cropH,
      );

      // Single pass OCR, no rotation retries — speed matters here
      const ocrResult = await OCRModule.recognizeText(cropped.path, {
        multipleAttempts: false,
      });

      const text = ocrResult.text?.trim() || '';
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

    } catch (err) {
      // Failed OCR on a snapshot isn't fatal — just skip this tick
      // console.log('Live OCR tick failed:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [computeCropRect, stableReadsRequired]);

  // Start/stop the polling loop based on camera readiness
  useEffect(() => {
    if (!hasPermission || !device || isCapturing) {
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
  }, [hasPermission, device, isCapturing, pollIntervalMs, runOCRTick]);

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
        qualityPrioritization: 'quality',
        enableAutoStabilization: true,
      });

      const photoPath = Platform.OS === 'android'
        ? `file://${photo.path}`
        : photo.path;

      const { cropX, cropY, cropW, cropH } = computeCropRect(
        photo.width, photo.height,
      );

      const result = await OCRModule.cropImage(
        photoPath, cropX, cropY, cropW, cropH,
      );

      // Pass both the cropped image path AND the last live read
      // so the parent can use whichever is more reliable
      onCapture(result.path, latestResultRef.current || undefined);
    } catch (err: any) {
      console.error('Capture error:', err);
      Alert.alert('Erro', err?.message || 'Não foi possível capturar a imagem');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, onCapture, computeCropRect]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (permissionStatus === 'not-determined') {
    return <View style={styles.center}><ActivityIndicator color="#fff" size="large" /></View>;
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Permissão de câmera necessária</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Solicitar permissão</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { marginTop: 12 }]}
          onPress={onCancel}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={[styles.permissionText, { marginTop: 12 }]}>Carregando câmera...</Text>
      </View>
    );
  }

  const dim = 'rgba(0, 0, 0, 0.6)';
  const hasLive = liveResult && liveResult.text.length > 0;
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Dimmed overlay */}
      <View style={{
        position: 'absolute', top: 0, left: 0,
        width: SCREEN_W, height: FRAME_Y, backgroundColor: dim,
      }} />
      <View style={{
        position: 'absolute', top: FRAME_Y + FRAME_H, left: 0,
        width: SCREEN_W, height: SCREEN_H - (FRAME_Y + FRAME_H), backgroundColor: dim,
      }} />
      <View style={{
        position: 'absolute', top: FRAME_Y, left: 0,
        width: FRAME_X, height: FRAME_H, backgroundColor: dim,
      }} />
      <View style={{
        position: 'absolute', top: FRAME_Y, left: FRAME_X + FRAME_W,
        width: SCREEN_W - (FRAME_X + FRAME_W), height: FRAME_H, backgroundColor: dim,
      }} />

      {/* Frame border — color changes based on detection state */}
      <View style={{
        position: 'absolute',
        top: FRAME_Y, left: FRAME_X,
        width: FRAME_W, height: FRAME_H,
        borderWidth: 3,
        borderColor: liveResult?.isStable ? '#00ff00' : hasLive ? '#ffcc00' : '#fff',
        borderRadius: 8,
      }} />

      {/* Live OCR preview above the frame */}
      <View style={[styles.helpBox, { top: FRAME_Y - 220, width: SCREEN_W }]}>
        {hasLive ? (
          <View style={styles.livePreview}>
            <Text style={styles.liveLabel}>
              {liveResult!.isStable ? '✓ Estável' : 'Lendo...'}
            </Text>
            <Text style={styles.liveText} numberOfLines={2}>
              {liveResult!.text}
            </Text>
            {liveResult!.matchedFields > 0 && (
              <Text style={styles.liveFields}>
                {liveResult!.matchedFields} campo(s) detectado(s)
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.helpText}>Alinhe a etiqueta dentro da área</Text>
        )}
      </View>

      {/* Action buttons */}
      <View style={[styles.actions, { top: FRAME_Y + FRAME_H + 40, width: SCREEN_W }]}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isCapturing}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.captureButton,
            liveResult?.isStable && styles.captureButtonStable,
          ]}
          onPress={handleCapture}
          disabled={isCapturing}>
          {isCapturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {liveResult?.isStable ? 'Confirmar' : 'Capturar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionText: { color: '#fff', fontSize: 16, marginBottom: 20 },
  helpBox: { position: 'absolute', alignItems: 'center', paddingHorizontal: 20 },
  helpText: {
    color: '#fff', fontSize: 16, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4,
  },
  livePreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 8, alignItems: 'center',
    maxWidth: '90%',
    borderColor: '#ff6200ff', 
    borderWidth: 1.5
  },
  liveLabel: {
    color: '#ffcc00', fontSize: 12, fontWeight: '700',
    marginBottom: 4, letterSpacing: 1,
  },
  liveText: {
    color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center',
  },
  liveFields: {
    color: '#00ff00', fontSize: 12, marginTop: 4, fontWeight: '600',
  },
  actions: {
    position: 'absolute',
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  button: {
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 30, minWidth: 120, alignItems: 'center',
  },
  captureButton: { backgroundColor: '#ff6200' },
  captureButtonStable: { backgroundColor: '#00a844' }, 
  cancelButton: { backgroundColor: '#555' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});