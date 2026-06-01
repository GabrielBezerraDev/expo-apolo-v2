import React, { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";

export type FrameRatios = {
  widthRatio: number;
  heightRatio: number;
};

export type FrameGeometry = {
  width: number;
  height: number;
  x: number;
  y: number;
  screenWidth: number;
  screenHeight: number;
};

export const FRAME_PRESETS = {
  barcode: { widthRatio: 0.72, heightRatio: 0.1 },
  shortCode: { widthRatio: 0.68, heightRatio: 0.12 },
  singleField: { widthRatio: 0.78, heightRatio: 0.16 },
  tinyData: { widthRatio: 0.5, heightRatio: 0.07 },
  fullLabel: { widthRatio: 0.86, heightRatio: 0.46 },
  qrCode: { widthRatio: 0.68, heightRatio: 0.34 },
} as const;

export type FramePresetName = keyof typeof FRAME_PRESETS;

type FrameContextValue = {
  ratios: FrameRatios;
  geometry: FrameGeometry;
  setRatios: (ratios: FrameRatios) => void;
  setPreset: (preset: FramePresetName) => void;
  reset: () => void;
};

const FrameContext = createContext<FrameContextValue | undefined>(undefined);

type Props = PropsWithChildren<{
  initial?: FrameRatios | FramePresetName;
}>;

export function FrameProvider({ children, initial = "singleField" }: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const initialRatios = useMemo<FrameRatios>(() => {
    if (typeof initial === "string") return FRAME_PRESETS[initial];
    return initial;
  }, [initial]);

  const [ratios, setRatiosState] = useState<FrameRatios>(initialRatios);

  const geometry = useMemo<FrameGeometry>(() => {
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

  const value = useMemo<FrameContextValue>(
    () => ({
      ratios,
      geometry,
      setRatios: next => {
        setRatiosState({
          widthRatio: clamp(next.widthRatio, 0.1, 0.96),
          heightRatio: clamp(next.heightRatio, 0.05, 0.9),
        });
      },
      setPreset: preset => setRatiosState(FRAME_PRESETS[preset]),
      reset: () => setRatiosState(initialRatios),
    }),
    [geometry, initialRatios, ratios]
  );

  return <FrameContext.Provider value={value}>{children}</FrameContext.Provider>;
}

export function useFrame() {
  const context = useContext(FrameContext);

  if (!context) {
    throw new Error("useFrame must be used within a FrameProvider");
  }

  return context;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}
