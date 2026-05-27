import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { X } from "lucide-react-native";
import { useThemeMode } from "@hooks/useThemeMode";
import { FramePresetName, FrameProvider, useFrame } from "../providers/FrameProvider";
import { recognizeTextFromImage } from "../services/ocrService";
import {
  CaptureButtonInner,
  CaptureButtonOuter,
  FrameBox,
  FrameCorner,
  PermissionButton,
  PermissionButtonText,
  PermissionPanel,
  PermissionText,
  ScannerDescription,
  ScannerIconButton,
  ScannerOverlay,
  ScannerRoot,
  ScannerTitle,
  ScannerTopBar,
} from "./styled";

export type ScannerCaptureResult = {
  imageUri: string;
  text?: string;
  fields?: Record<string, string>;
};

type Props = {
  preset?: FramePresetName;
  title?: string;
  description?: string;
  onCancel: () => void;
  onCapture: (result: ScannerCaptureResult) => void;
};

export function FramedCameraScanner({ preset = "singleField", title, description, onCancel, onCapture }: Props) {
  return (
    <FrameProvider initial={preset}>
      <FramedCameraScannerContent title={title} description={description} onCancel={onCancel} onCapture={onCapture} />
    </FrameProvider>
  );
}

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
