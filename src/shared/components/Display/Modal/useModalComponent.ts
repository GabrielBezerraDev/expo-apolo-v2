import { useEffect, useRef } from "react";
import { useWindowDimensions } from "tamagui";
import { ModalConfig, ModalPlacement } from "./modal.type";
import { useModalAnimation } from "./useModalAnimation";

type UseModalComponentParams = {
  modal: ModalConfig;
  removeModal: (id: string) => void;
  requestClose: (id: string) => void;
};

export function useModalComponent({ modal, removeModal, requestClose }: UseModalComponentParams) {
  const hasClosed = useRef(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const {
    title,
    showCloseButton = true,
    showHeader = true,
    showFooter = false,
    footerComponent,
    widthPercent = 90,
    heightPercent,
    maxWidth = 520,
    maxHeight,
    maxHeightPercent = 90,
    minHeight,
    minHeightPercent = 40,
    left,
    top,
    placement = "center",
    closeOnBackdrop = true,
    preventClose = false,
    animationType = "fade",
    backdropColor,
    contentStyle,
    bodyStyle,
    onClose,
    timeModal
  } = modal.options || {};

  const resolvedPlacement: ModalPlacement = placement;
  const isNotification = resolvedPlacement === "notification";
  const resolvedMinHeight = minHeight ?? screenHeight * (minHeightPercent / 100);
  const resolvedMaxHeight = maxHeight ?? screenHeight * (maxHeightPercent / 100);
  const { animateTo, backdropAnimatedStyle, contentAnimatedStyle } = useModalAnimation({
    animationType,
    placement: resolvedPlacement,
  });

  useEffect(() => {
    animateTo(1);
  }, [animateTo]);

  useEffect(() => {
    if (!modal.closing || hasClosed.current) return;

    hasClosed.current = true;
    animateTo(0, () => {
      onClose?.();
      removeModal(modal.id);
    });
  }, [animateTo, modal.closing, modal.id, onClose, removeModal]);

  useEffect(() => {
    if (!isNotification || preventClose) return;

    const timeout = setTimeout(() => {
      requestClose(modal.id);
    }, timeModal || 5500);

    return () => clearTimeout(timeout);
  }, [isNotification, modal.id, preventClose, requestClose]);

  const handleClose = () => {
    if (!preventClose) requestClose(modal.id);
  };

  const handleBackdropPress = () => {
    if (closeOnBackdrop && !preventClose) requestClose(modal.id);
  };

  return {
    backdropAnimatedStyle,
    backdropColor,
    bodyStyle,
    contentAnimatedStyle,
    contentStyle,
    footerComponent,
    handleBackdropPress,
    handleClose,
    heightPercent,
    isNotification,
    left,
    maxWidth,
    resolvedMaxHeight,
    resolvedMinHeight,
    resolvedPlacement,
    screenHeight,
    screenWidth,
    showCloseButton,
    showFooter,
    showHeader,
    title,
    top,
    widthPercent,
  };
}
