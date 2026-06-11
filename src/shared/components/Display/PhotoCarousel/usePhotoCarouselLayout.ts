import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useWindowDimensions } from "tamagui";
import type { PhotoCarouselHeightPreset } from "./types";

type UsePhotoCarouselLayoutParams = {
  heightPreset: PhotoCarouselHeightPreset;
  showItemHeader: boolean;
};

const HEADER_HEIGHT = 56;

const PRESET_CONFIG: Record<PhotoCarouselHeightPreset, {
  maxHeight: number;
  minHeight: number;
  screenMaxRatio: number;
  widthRatio: number;
}> = {
  compact: {
    maxHeight: 280,
    minHeight: 170,
    screenMaxRatio: 0.36,
    widthRatio: 0.58,
  },
  medium: {
    maxHeight: 460,
    minHeight: 240,
    screenMaxRatio: 0.5,
    widthRatio: 0.72,
  },
  large: {
    maxHeight: 620,
    minHeight: 320,
    screenMaxRatio: 0.68,
    widthRatio: 0.82,
  },
};

export function usePhotoCarouselLayout({
  heightPreset,
  showItemHeader,
}: UsePhotoCarouselLayoutParams) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);

    setContainerWidth(current => current === nextWidth ? current : nextWidth);
  }, []);

  const layout = useMemo(() => {
    const config = PRESET_CONFIG[heightPreset];
    const fallbackWidth = Math.max(220, screenWidth - 24);
    const carouselWidth = Math.max(220, containerWidth || fallbackWidth);
    const deviceMaxHeight = Math.min(config.maxHeight, screenHeight * config.screenMaxRatio);
    const minHeight = Math.min(config.minHeight, deviceMaxHeight);
    const photoHeight = clamp(carouselWidth * config.widthRatio, minHeight, deviceMaxHeight);

    return {
      carouselWidth,
      photoHeight: Math.round(photoHeight),
      totalHeight: Math.round(photoHeight + (showItemHeader ? HEADER_HEIGHT : 0)),
    };
  }, [containerWidth, heightPreset, screenHeight, screenWidth, showItemHeader]);

  return {
    ...layout,
    handleLayout,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}
