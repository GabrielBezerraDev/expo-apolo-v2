import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useWindowDimensions } from "tamagui";

export type OcrFrameRatios = {
  widthRatio: number;
  heightRatio: number;
};

export type OcrFrameGeometry = {
  width: number;
  height: number;
  x: number;
  y: number;
  screenWidth: number;
  screenHeight: number;
};

export const OCR_FRAME_PRESETS = {
  barcode: { widthRatio: 0.5, heightRatio: 0.08 },
  shortCode: { widthRatio: 0.6, heightRatio: 0.1 },
  tinyData: { widthRatio: 0.3, heightRatio: 0.09 },
  tinyDataLandScape: { widthRatio: 0.2, heightRatio: 0.1 },
  singleField: { widthRatio: 0.75, heightRatio: 0.15 },
  fullLabel: { widthRatio: 0.85, heightRatio: 0.45 },
  qrCode: { widthRatio: 0.7, heightRatio: 0.4 },
} as const;

export type OcrFramePresetName = keyof typeof OCR_FRAME_PRESETS;

type OcrFrameContextValue = {
  ratios: OcrFrameRatios;
  geometry: OcrFrameGeometry;
  setRatios: (ratios: OcrFrameRatios) => void;
  setPreset: (preset: OcrFramePresetName) => void;
  reset: () => void;
};

const OcrFrameContext = createContext<OcrFrameContextValue | undefined>(undefined);

type OcrFrameProviderProps = PropsWithChildren<{
  initial?: OcrFrameRatios | OcrFramePresetName;
}>;

export function OcrFrameProvider({ children, initial = "barcode" }: OcrFrameProviderProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const initialRatios = useMemo<OcrFrameRatios>(() => {
    if (typeof initial === "string") return OCR_FRAME_PRESETS[initial];
    return initial;
  }, [initial]);

  const [ratios, setRatiosState] = useState<OcrFrameRatios>(initialRatios);

  const setRatios = useCallback((next: OcrFrameRatios) => {
    setRatiosState({
      widthRatio: clamp(next.widthRatio, 0.1, 1),
      heightRatio: clamp(next.heightRatio, 0.05, 1),
    });
  }, []);

  const setPreset = useCallback((preset: OcrFramePresetName) => {
    setRatiosState(OCR_FRAME_PRESETS[preset]);
  }, []);

  const reset = useCallback(() => {
    setRatiosState(initialRatios);
  }, [initialRatios]);

  const geometry = useMemo<OcrFrameGeometry>(() => {
    const width = screenWidth * ratios.widthRatio;
    const height = screenHeight * ratios.heightRatio;

    return {
      width,
      height,
      x: (screenWidth - width) / 2,
      y: (screenHeight - height) / 2,
      screenWidth,
      screenHeight,
    };
  }, [ratios, screenHeight, screenWidth]);

  const value = useMemo<OcrFrameContextValue>(
    () => ({ ratios, geometry, setRatios, setPreset, reset }),
    [geometry, ratios, reset, setPreset, setRatios],
  );

  return <OcrFrameContext.Provider value={value}>{children}</OcrFrameContext.Provider>;
}

export function useOcrFrame() {
  const context = useContext(OcrFrameContext);

  if (!context) {
    throw new Error("useOcrFrame must be used within an OcrFrameProvider");
  }

  return context;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}
