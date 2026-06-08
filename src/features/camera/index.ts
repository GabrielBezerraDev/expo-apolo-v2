export { FramedCameraScanner } from "./screens/scan-ocr/FramedCameraScanner";
export { FrameProvider, FRAME_PRESETS, useFrame } from "./providers/FrameProvider";
export { OCR_FRAME_PRESETS, OcrFrameProvider, useOcrFrame } from "./providers/OcrFrameProvider";
export type {
  FrameGeometry,
  FramePresetName,
  FrameRatios,
  ScannerCaptureResult,
  ScannerMode,
  ScannerOrientation,
} from "./providers/FrameProvider";
export type {
  OcrFrameGeometry,
  OcrFramePresetName,
  OcrFrameRatios,
} from "./providers/OcrFrameProvider";
