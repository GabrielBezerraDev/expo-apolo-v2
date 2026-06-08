import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
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
import { ModalConfig } from "./modal.type";
import { useModalComponent } from "./useModalComponent";

type Props = {
  modal: ModalConfig;
  index: number;
  requestClose: (id: string) => void;
  removeModal: (id: string) => void;
};

export function ModalComponent({ modal, index, requestClose, removeModal }: Props) {
  const {
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
  } = useModalComponent({ modal, removeModal, requestClose });

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
