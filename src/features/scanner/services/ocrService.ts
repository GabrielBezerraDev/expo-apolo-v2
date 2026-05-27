import { NativeModules } from "react-native";

type NativeOcrResult = {
  success?: boolean;
  text?: string;
  rawText?: string;
  fields?: Record<string, string>;
};

type OCRModuleType = {
  recognizeText?: (imagePath: string, options?: Record<string, unknown>) => Promise<NativeOcrResult>;
};

const nativeOCR = NativeModules.OCRModule as OCRModuleType | undefined;

export async function recognizeTextFromImage(imageUri: string) {
  if (!nativeOCR?.recognizeText) {
    return null;
  }

  return nativeOCR.recognizeText(imageUri, {
    enhance: true,
    multipleAttempts: true,
  });
}
