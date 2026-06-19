import { NativeModules } from "react-native";

type NativeOcrResult = {
  fields?: Record<string, string>;
  matchedFields?: number;
  success?: boolean;
  text?: string;
  rawText?: string;
};

type NativeCropResult = {
  path: string;
};

type OCRModuleType = {
  cropImage?: (
    imagePath: string,
    cropX: number,
    cropY: number,
    cropW: number,
    cropH: number,
  ) => Promise<NativeCropResult>;
  recognizeText?: (imagePath: string, options?: Record<string, unknown>) => Promise<NativeOcrResult>;
  setScreenOrientation?: (orientation: "landscape" | "portrait") => Promise<void> | void;
};

const nativeOCR = NativeModules.OCRModule as OCRModuleType | undefined;

export async function recognizeTextFromImage(imageUri: string, options?: Record<string, unknown>) {
  if (!nativeOCR?.recognizeText) {
    return null;
  }

  return nativeOCR.recognizeText(imageUri, {
    enhance: true,
    multipleAttempts: true,
    ...options,
  });
}

export async function cropImageForOcr(
  imageUri: string,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number,
) {
  if (!nativeOCR?.cropImage) {
    throw new Error("Modulo nativo de OCR indisponivel.");
  }

  return nativeOCR.cropImage(imageUri, cropX, cropY, cropW, cropH);
}

export async function setOcrScreenOrientation(orientation: "landscape" | "portrait") {
  await nativeOCR?.setScreenOrientation?.(orientation);
}
