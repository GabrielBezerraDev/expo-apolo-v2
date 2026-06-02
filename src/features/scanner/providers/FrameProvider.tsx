import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
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
  barcodeLandScape: { widthRatio: 0.5, heightRatio: 0.12 },
  barcodePortrait: { widthRatio: 0.72, heightRatio: 0.1 },
  shortCode: { widthRatio: 0.68, heightRatio: 0.12 },
  shortCodeLandScape: { widthRatio: 0.45, heightRatio: 0.14 },
  shortCodePortrait: { widthRatio: 0.68, heightRatio: 0.12 },
  tinyData: { widthRatio: 0.5, heightRatio: 0.07 },
  tinyDataLandScape: { widthRatio: 0.2, heightRatio: 0.1 },
  tinyDataPortrait: { widthRatio: 0.5, heightRatio: 0.07 },
  singleField: { widthRatio: 0.78, heightRatio: 0.16 },
  singleFieldLandScape: { widthRatio: 0.45, heightRatio: 0.18 },
  singleFieldPortrait: { widthRatio: 0.78, heightRatio: 0.16 },
  fullLabel: { widthRatio: 0.86, heightRatio: 0.46 },
  fullLabelLandScape: { widthRatio: 0.55, heightRatio: 0.7 },
  fullLabelPortrait: { widthRatio: 0.86, heightRatio: 0.46 },
  qrCode: { widthRatio: 0.68, heightRatio: 0.34 },
  qrCodeLandScape: { widthRatio: 0.32, heightRatio: 0.5 },
  qrCodePortrait: { widthRatio: 0.68, heightRatio: 0.34 },
  fullScreen: { widthRatio: 1, heightRatio: 1 },
} as const;

export type FramePresetName = keyof typeof FRAME_PRESETS;
export type ScannerMode = "scanner" | "photo";
export type ScannerOrientation = "LandScape" | "Portrait";

export type ScannerCaptureResult = {
  imageUri: string;
  text: string;
  fields: Record<string, string>;
  matchedFields: number;
  isStable: boolean;
};

type ScannerConfig = {
  mode: ScannerMode;
  preset: FramePresetName;
  orientation: ScannerOrientation;
  pollIntervalMs: number;
  stableReadsRequired: number;
};

type ScannerOptions = Partial<ScannerConfig> & {
  onCapture?: (result: ScannerCaptureResult) => void;
  onCancel?: () => void;
};

type FrameContextValue = {
  ratios: FrameRatios;
  geometry: FrameGeometry;
  scanner: ScannerConfig;
  setRatios: (ratios: FrameRatios) => void;
  setPreset: (preset: FramePresetName) => void;
  configureScanner: (options: ScannerOptions) => void;
  handleScannerCapture: (result: ScannerCaptureResult) => void;
  handleScannerCancel: () => void;
  resetScanner: () => void;
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
  const [scanner, setScanner] = useState<ScannerConfig>({
    mode: "scanner",
    preset: typeof initial === "string" ? initial : "singleField",
    orientation: "LandScape",
    pollIntervalMs: 600,
    stableReadsRequired: 2,
  });
  const onCaptureRef = useRef<((result: ScannerCaptureResult) => void) | undefined>(undefined);
  const onCancelRef = useRef<(() => void) | undefined>(undefined);

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

  const setRatios = useCallback((next: FrameRatios) => {
    setRatiosState({
      widthRatio: clamp(next.widthRatio, 0.1, 0.96),
      heightRatio: clamp(next.heightRatio, 0.05, 0.9),
    });
  }, []);


  const setPreset = useCallback((preset: FramePresetName) => {
    setRatiosState(FRAME_PRESETS[preset]);
  }, []);

  const configureScanner = useCallback((options: ScannerOptions) => {
    setScanner(current => {
      const next = { ...current, ...options };
      const resolvedPreset = resolveScannerPreset(next.preset, next.orientation);
      setRatiosState(FRAME_PRESETS[resolvedPreset]);

      return {
        mode: next.mode,
        preset: next.preset,
        orientation: next.orientation,
        pollIntervalMs: next.pollIntervalMs,
        stableReadsRequired: next.stableReadsRequired,
      };
    });

    if ("onCapture" in options) onCaptureRef.current = (data) => { if(options.onCapture) options.onCapture(data); };
    if ("onCancel" in options) onCancelRef.current = () => { if(options.onCancel) options.onCancel(); };
  }, []);

  const handleScannerCapture = useCallback((result: ScannerCaptureResult) => {
    onCaptureRef.current?.(result);
  }, []);

  const handleScannerCancel = useCallback(() => {
    onCancelRef.current?.();
  }, []);

  const reset = useCallback(() => {
    setRatiosState(initialRatios);
  }, [initialRatios]);

  const resetScanner = useCallback(() => {
    onCaptureRef.current = undefined;
    onCancelRef.current = undefined;
    setScanner({
      mode: "scanner",
      preset: typeof initial === "string" ? initial : "singleField",
      orientation: "LandScape",
      pollIntervalMs: 600,
      stableReadsRequired: 2,
    });
    reset();
  }, [initial, reset]);

  const value = useMemo<FrameContextValue>(
    () => ({
      ratios,
      geometry,
      scanner,
      setRatios,
      setPreset,
      configureScanner,
      handleScannerCapture,
      handleScannerCancel,
      resetScanner,
      reset,
    }),
    [
      ratios,
      geometry,
      scanner,
      setRatios,
      setPreset,
      configureScanner,
      handleScannerCapture,
      handleScannerCancel,
      resetScanner,
      reset,
    ]
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

function resolveScannerPreset(preset: FramePresetName, orientation: ScannerOrientation): FramePresetName {
  if (preset.endsWith("LandScape") || preset.endsWith("Portrait")) return preset;

  const orientedPreset = `${preset}${orientation}` as FramePresetName;
  return orientedPreset in FRAME_PRESETS ? orientedPreset : preset;
}
