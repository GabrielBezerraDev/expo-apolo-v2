import React from "react";
import Animated from "react-native-reanimated";
import { View } from "tamagui";
import {
  ModalBackdropButton,
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

const AnimatedView = Animated.createAnimatedComponent(View);

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
    <AnimatedView
      pointerEvents={isNotification ? "box-none" : "auto"}
      style={[
        backdropBaseStyle,
        placementStyles[resolvedPlacement],
        {
          backgroundColor: isNotification ? "transparent" : backdropColor || "rgba(0, 0, 0, 0.5)",
          zIndex: 1000 + index * 10,
        },
        backdropAnimatedStyle,
      ]}
    >
      {!isNotification ? <ModalBackdropButton onPress={handleBackdropPress} /> : null}

      <AnimatedView
        style={[
          {
            elevation: 8,
            width: screenWidth * (widthPercent / 100),
            height: heightPercent ? screenHeight * (heightPercent / 100) : undefined,
            maxHeight: resolvedMaxHeight,
            maxWidth,
            left,
            top,
          },
          contentAnimatedStyle,
          contentStyle,
        ]}
      >
        <ModalContent style={[{minHeight:resolvedMinHeight}]} onStartShouldSetResponder={() => true}>
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
      </AnimatedView>
    </AnimatedView>
  );
}

const backdropBaseStyle = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  padding: 20,
};

const placementStyles = {
  center: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  top: {
    alignItems: "center" as const,
    justifyContent: "flex-start" as const,
    paddingTop: 36,
  },
  bottom: {
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    paddingBottom: 28,
  },
  notification: {
    alignItems: "center" as const,
    justifyContent: "flex-start" as const,
    paddingTop: 18,
  },
};
