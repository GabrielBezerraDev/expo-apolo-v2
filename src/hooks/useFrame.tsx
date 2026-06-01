// FrameProvider.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Dimensions } from 'react-native';

// =============================================================================
// Types
// =============================================================================

/**
 * Frame ratios relative to screen dimensions.
 * widthRatio/heightRatio are 0–1 (e.g. 0.85 = 85% of screen).
 */
export interface FrameRatios {
  widthRatio: number;
  heightRatio: number;
}

/**
 * Computed absolute frame geometry in pixels.
 * Consumers use these values directly without doing their own math.
 */
export interface FrameGeometry {
  width: number;
  height: number;
  x: number;
  y: number;
  screenWidth: number;
  screenHeight: number;
}

/**
 * Presets for common scan scenarios.
 * Add new ones here as your app needs them.
 */
export const FRAME_PRESETS = {
  // Wide horizontal strip — best for barcode lines
  barcode: { widthRatio: 0.5, heightRatio: 0.08 },
  // Thinner horizontal strip — product codes, short IDs
  shortCode: { widthRatio: 0.6, heightRatio: 0.1 },
  tinyData: { widthRatio: 0.3, heightRatio: 0.09 },
  tinyDataLandScape: { widthRatio: 0.2, heightRatio: 0.10 },
  // Medium rectangle — single label field (PO N, BATCH, etc.)
  singleField: { widthRatio: 0.75, heightRatio: 0.15 },
  // Large rectangle — full Salcomp shipping label
  fullLabel: { widthRatio: 0.85, heightRatio: 0.45 },
  // Square — QR codes, data matrices
  qrCode: { widthRatio: 0.7, heightRatio: 0.4 },
} as const;

export type FramePresetName = keyof typeof FRAME_PRESETS;

// =============================================================================
// Context
// =============================================================================

interface FrameContextValue {
  /** Current ratios (source of truth) */
  ratios: FrameRatios;
  /** Computed pixel geometry based on current screen + ratios */
  geometry: FrameGeometry;
  /** Set ratios directly */
  setRatios: (ratios: FrameRatios) => void;
  /** Apply a named preset */
  setPreset: (preset: FramePresetName) => void;
  /** Reset to the initial ratios the provider was created with */
  reset: () => void;
}

const FrameContext = createContext<FrameContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface FrameProviderProps {
  children: ReactNode;
  initial?: FrameRatios | FramePresetName;
}

export const FrameProvider: React.FC<FrameProviderProps> = ({
  children,
  initial = 'barcode',
}) => {
  const initialRatios = useMemo<FrameRatios>(() => {
    if (typeof initial === 'string') return FRAME_PRESETS[initial];
    return initial;
  }, [initial]);

  const [ratios, setRatiosState] = useState<FrameRatios>(initialRatios);

  const setRatios = useCallback((next: FrameRatios) => {
    setRatiosState({
      widthRatio: clamp(next.widthRatio, 0.1, 1),
      heightRatio: clamp(next.heightRatio, 0.05, 1),
    });
  }, []);

  const setPreset = useCallback((preset: FramePresetName) => {
    setRatiosState(FRAME_PRESETS[preset]);
  }, []);

  const reset = useCallback(() => {
    setRatiosState(initialRatios);
  }, [initialRatios]);

  // Compute pixel geometry. Reads Dimensions at render time so rotation works.
  const geometry = useMemo<FrameGeometry>(() => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
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
  }, [ratios]);

  const value = useMemo<FrameContextValue>(
    () => ({ ratios, geometry, setRatios, setPreset, reset }),
    [ratios, geometry, setRatios, setPreset, reset],
  );

  return <FrameContext.Provider value={value}>{children}</FrameContext.Provider>
};


export const useFrame = (): FrameContextValue => {
  const ctx = useContext(FrameContext);
  if (!ctx) {
    throw new Error('useFrame must be used within a FrameProvider');
  }
  return ctx;
};


function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(v, hi));
}