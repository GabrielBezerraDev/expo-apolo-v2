import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

export type ModalAnimation = "fade" | "slide" | "none";
export type ModalPlacement = "center" | "top" | "bottom" | "notification";

export interface ModalOptions {
  title?: string;
  showCloseButton?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  footerComponent?: ReactNode;
  widthPercent?: number;
  heightPercent?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxHeightPercent?: number;
  minHeight?: number;
  minHeightPercent?: number;
  left?: number;
  top?: number;
  placement?: ModalPlacement;
  closeOnBackdrop?: boolean;
  preventClose?: boolean;
  priority?: number;
  animationType?: ModalAnimation;
  backdropColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  timeModal?: number;
  onClose?: () => void;
}

export interface ModalConfig {
  id: string;
  component: ReactNode;
  options?: ModalOptions;
  closing?: boolean;
}

export interface ModalContextType {
  openModal: (component: ReactNode, options?: ModalOptions) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  closeTopModal: () => void;
  updateModal: (id: string, options: Partial<ModalOptions>) => void;
}
