import React, { useEffect, useRef } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  ModalBody,
  ModalBodyContent,
  ModalCloseButton,
  ModalCloseText,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "./styled";
import { ModalConfig, ModalPlacement } from "./modal.type";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type Props = {
  modal: ModalConfig;
  index: number;
  requestClose: (id: string) => void;
  removeModal: (id: string) => void;
};

export function ModalComponent({ modal, index, requestClose, removeModal }: Props) {
  const progress = useSharedValue(0);
  const hasClosed = useRef(false);

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
  } = modal.options || {};

  const resolvedPlacement: ModalPlacement = placement;
  const isNotification = resolvedPlacement === "notification";
  const resolvedMinHeight = minHeight ?? screenHeight * (minHeightPercent / 100);
  const resolvedMaxHeight = maxHeight ?? screenHeight * (maxHeightPercent / 100);

  const animateTo = (toValue: number, callback?: () => void) => {
    if (animationType === "none") {
      progress.value = toValue;
      callback?.();
      return;
    }

    progress.value = withTiming(toValue, { duration: toValue === 1 ? 220 : 170 }, finished => {
      if (finished && callback) runOnJS(callback)();
    });
  };

  useEffect(() => {
    animateTo(1);
  }, []);

  useEffect(() => {
    if (!modal.closing || hasClosed.current) return;

    hasClosed.current = true;
    animateTo(0, () => {
      onClose?.();
      removeModal(modal.id);
    });
  }, [modal.closing, modal.id, onClose, removeModal]);

  useEffect(() => {
    if (!isNotification || preventClose) return;

    const timeout = setTimeout(() => {
      requestClose(modal.id);
    }, 5500);

    return () => clearTimeout(timeout);
  }, [isNotification, modal.id, preventClose, requestClose]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    if (animationType === "slide") {
      const initialOffset = resolvedPlacement === "bottom" ? 48 : -48;

      return {
        opacity: progress.value,
        transform: [
          {
            translateY: initialOffset * (1 - progress.value),
          },
        ],
      };
    }

    return {
      opacity: progress.value,
      transform: [
        {
          scale: animationType === "none" ? 1 : 0.96 + progress.value * 0.04,
        },
      ],
    };
  });

  const handleClose = () => {
    if (!preventClose) requestClose(modal.id);
  };

  const handleBackdropPress = () => {
    if (closeOnBackdrop && !preventClose) requestClose(modal.id);
  };

  return (
    <Animated.View
      pointerEvents={isNotification ? "box-none" : "auto"}
      style={[
        styles.backdropBase,
        styles[resolvedPlacement],
        {
          backgroundColor: isNotification ? "transparent" : backdropColor || "rgba(0, 0, 0, 0.5)",
          zIndex: 1000 + index * 10,
        },
        backdropAnimatedStyle,
      ]}
    >
      {!isNotification ? <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} /> : null}

      <Animated.View
        style={[
          {
            elevation: 8,
            width: screenWidth * (widthPercent / 100),
            height: heightPercent ? screenHeight * (heightPercent / 100) : undefined,
            maxHeight: resolvedMaxHeight,
            maxWidth,
            minHeight: resolvedMinHeight,
            left,
            top,
          },
          contentAnimatedStyle,
          contentStyle,
        ]}
      >
        <ModalContent onStartShouldSetResponder={() => true}>
          {showHeader ? (
            <ModalHeader>
              <ModalTitle>{title || "Modal"}</ModalTitle>
              {showCloseButton ? (
                <ModalCloseButton onPress={handleClose} hitSlop={8}>
                  <ModalCloseText>x</ModalCloseText>
                </ModalCloseButton>
              ) : null}
            </ModalHeader>
          ) : null}

          <ModalBody showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <ModalBodyContent style={bodyStyle}>{modal.component}</ModalBodyContent>
          </ModalBody>

          {showFooter && footerComponent ? <ModalFooter>{footerComponent}</ModalFooter> : null}
        </ModalContent>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdropBase: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  top: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 36,
  },
  bottom: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 28,
  },
  notification: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 18,
  },
});
