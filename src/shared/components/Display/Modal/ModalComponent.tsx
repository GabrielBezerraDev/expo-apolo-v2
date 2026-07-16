import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
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
  isTopModal: boolean;
  requestClose: (id: string) => void;
  removeModal: (id: string) => void;
};

export function ModalComponent({ modal, index, isTopModal, requestClose, removeModal }: Props) {
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
      accessibilityElementsHidden={!isTopModal}
      accessibilityViewIsModal={isTopModal && !isNotification}
      importantForAccessibility={isTopModal ? "yes" : "no-hide-descendants"}
      pointerEvents={isNotification ? "box-none" : "auto"}
      style={[
        backdropBaseStyle,
        {
          backgroundColor: isNotification ? "transparent" : backdropColor || "rgba(0, 0, 0, 0.5)",
          zIndex: 1000 + index * 10,
        },
        backdropAnimatedStyle,
      ]}
    >
      {!isNotification ? <ModalBackdropButton onPress={handleBackdropPress} /> : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={!isNotification}
        pointerEvents="box-none"
        style={[keyboardAvoidingBaseStyle, placementStyles[resolvedPlacement]]}
      >
        <AnimatedView
          style={[
            {
              elevation: 8,
              flexShrink: 1,
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
          <ModalContent
            style={{
              flexShrink: 1,
              maxHeight: "100%",
              minHeight: resolvedMinHeight,
            }}
          >
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

            <ModalBody
              automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <ModalBodyContent style={bodyStyle}>{modal.component}</ModalBodyContent>
            </ModalBody>

            {showFooter && footerComponent ? <ModalFooter>{footerComponent}</ModalFooter> : null}
          </ModalContent>
        </AnimatedView>
      </KeyboardAvoidingView>
    </AnimatedView>
  );
}

const backdropBaseStyle = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const keyboardAvoidingBaseStyle = {
  flex: 1,
  padding: 20,
  width: "100%" as const,
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
