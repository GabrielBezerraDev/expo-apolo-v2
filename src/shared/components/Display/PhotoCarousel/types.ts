export type PhotoCarouselHeightPreset = "compact" | "medium" | "large";
export type PhotoCaptureOrientation = "LandScape" | "Portrait";

export type PhotoCarouselItem = {
  captureOrientation?: PhotoCaptureOrientation;
  disabled?: boolean;
  id: string;
  subtitle?: string;
  title?: string;
  uri?: string | null;
};

export type PhotoCarouselProps = {
  captureOrientation?: PhotoCaptureOrientation;
  emptyLabel?: string;
  heightPreset?: PhotoCarouselHeightPreset;
  imageResizeMode?: "cover" | "contain";
  items: PhotoCarouselItem[];
  onPressItem?: (
    item: PhotoCarouselItem,
    index: number,
    captureOrientation: PhotoCaptureOrientation,
  ) => void;
  readonly?: boolean;
  showCounter?: boolean;
  showExpandButton?: boolean;
  showItemHeader?: boolean;
};
