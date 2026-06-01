import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { X } from "lucide-react-native";
import { useThemeMode } from "@hooks/useThemeMode";
import { FramePresetName, FrameProvider, useFrame } from "../providers/FrameProvider";
import { recognizeTextFromImage } from "../services/ocrService";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  NativeModules,
  LayoutChangeEvent,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  CameraPermissionStatus,
  CameraDevice,
} from 'react-native-vision-camera';
import { FRAME_PRESETS, FramePresetName, useFrame } from '@hooks/useFrame';

const { OCRModule } = NativeModules;

type ScannerOrientation = 'landscape' | 'portrait' | 'LandScape' | 'Portrait';

type Props = {
  preset?: FramePresetName;
  title?: string;
  description?: string;
  onCancel: () => void;
  onCapture: (result: ScannerCaptureResult) => void;
};

export const FramedCameraScanner: React.FC<Props> = ({
  onCapture,
  onCancel,
  preset,
  orientation = 'landscape',
  pollIntervalMs = 600,
  stableReadsRequired = 2,
}) => {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = useMemo(() => {
    if (!devices) return undefined;
    if (Array.isArray(devices)) {
      return devices.find((d: CameraDevice) => d.position === 'back');
    }
    return devices;
  }, [devices]);

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

  const { geometry, ratios, setPreset } = useFrame();
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

  const nativeOrientation = orientation === 'Portrait' || orientation === 'portrait'
    ? 'portrait'
    : 'landscape';

  useEffect(() => {
    if (!preset) return;

    const orientedPreset = `${preset}${nativeOrientation === 'landscape' ? 'LandScape' : 'Portrait'}` as FramePresetName;
    setPreset(orientedPreset in FRAME_PRESETS ? orientedPreset : preset);
  }, [nativeOrientation, preset, setPreset]);

  useEffect(() => {
    Promise.resolve(OCRModule?.setScreenOrientation?.(nativeOrientation)).catch(() => undefined);

    return () => {
      Promise.resolve(OCRModule?.setScreenOrientation?.('portrait')).catch(() => undefined);
    };
  }, [nativeOrientation]);

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

function FramedCameraScannerContent({ title = "Escanear etiqueta", description = "Alinhe o campo da etiqueta dentro da moldura.", onCancel, onCapture }: Omit<Props, "preset">) {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const { theme } = useThemeMode();
  const { geometry } = useFrame();

  const takePicture = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 1, skipProcessing: false });

      if (!photo?.uri || !photo.width || !photo.height) {
        throw new Error("Não foi possível capturar a imagem.");
      }

      const crop = getCropRegion({
        photoWidth: photo.width,
        photoHeight: photo.height,
        frame: geometry,
      });

      const cropped = await manipulateAsync(photo.uri, [{ crop }], {
        compress: 1,
        format: SaveFormat.JPEG,
      });

      const ocrResult = await recognizeTextFromImage(cropped.uri);

      onCapture({
        imageUri: cropped.uri,
        text: ocrResult?.text,
        fields: ocrResult?.fields,
      });
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível escanear a etiqueta.");
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <PermissionPanel />;
  }

  if (!permission.granted) {
    return (
      <PermissionPanel>
        <PermissionText>Precisamos da permissão da câmera para escanear etiquetas.</PermissionText>
        <PermissionButton onPress={requestPermission}>
          <PermissionButtonText>Permitir câmera</PermissionButtonText>
        </PermissionButton>
        <PermissionButton onPress={onCancel}>
          <PermissionButtonText>Voltar</PermissionButtonText>
        </PermissionButton>
      </PermissionPanel>
    );
  }

  return (
    <ScannerRoot>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <ScannerOverlay pointerEvents="box-none">
        <View style={[styles.mask, { top: 0, height: geometry.y }]} />
        <View style={[styles.mask, { top: geometry.y + geometry.height, bottom: 0 }]} />
        <View style={[styles.mask, { top: geometry.y, left: 0, width: geometry.x, height: geometry.height }]} />
        <View style={[styles.mask, { top: geometry.y, left: geometry.x + geometry.width, right: 0, height: geometry.height }]} />

        <ScannerTopBar>
          <ScannerIconButton onPress={onCancel} hitSlop={8}>
            <X size={24} color={theme.white} />
          </ScannerIconButton>
          <View style={{ alignItems: "center", gap: 4 }}>
            <ScannerTitle>{title}</ScannerTitle>
            <ScannerDescription>{description}</ScannerDescription>
          </View>
          <View style={{ width: 46 }} />
        </ScannerTopBar>

        <FrameBox style={{ width: geometry.width, height: geometry.height, left: geometry.x, top: geometry.y }}>
          <FrameCorner corner="topLeft" />
          <FrameCorner corner="topRight" />
          <FrameCorner corner="bottomLeft" />
          <FrameCorner corner="bottomRight" />
        </FrameBox>

        <CaptureButtonOuter onPress={takePicture} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.white} /> : <CaptureButtonInner />}
        </CaptureButtonOuter>
      </ScannerOverlay>
    </ScannerRoot>
  );
}

function getCropRegion({
  photoWidth,
  photoHeight,
  frame,
}: {
  photoWidth: number;
  photoHeight: number;
  frame: ReturnType<typeof useFrame>["geometry"];
}) {
  const scaleX = photoWidth / frame.screenWidth;
  const scaleY = photoHeight / frame.screenHeight;
  const originX = Math.max(0, Math.round(frame.x * scaleX));
  const originY = Math.max(0, Math.round(frame.y * scaleY));
  const width = Math.min(photoWidth - originX, Math.round(frame.width * scaleX));
  const height = Math.min(photoHeight - originY, Math.round(frame.height * scaleY));

  return { originX, originY, width, height };
}

const styles = StyleSheet.create({
  mask: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
});
