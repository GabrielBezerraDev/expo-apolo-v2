import React from "react";
import { X } from "lucide-react-native";
import { Button, styled, Text, XStack } from "tamagui";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";

export type ScanFeedbackState = {
  message: string;
  tone: "error" | "info" | "success";
};

type Props = ScanFeedbackState & {
  onClose?: () => void;
};

export function ScanFeedback({ message, onClose, tone }: Props) {
  const { theme } = useThemeMode();

  return (
    <FeedbackRoot tone={tone}>
      <FeedbackText tone={tone}>{message}</FeedbackText>
      {onClose ? (
        <CloseButton
          accessibilityLabel="Fechar aviso"
          hitSlop={8}
          onPress={onClose}
        >
          <X size={20} color={theme.error} strokeWidth={2.5} />
        </CloseButton>
      ) : null}
    </FeedbackRoot>
  );
}

const FeedbackRoot = styled(XStack, {
  alignItems: "center",
  backgroundColor: "$surface",
  borderRadius: 14,
  borderWidth: 1,
  gap: 10,
  paddingHorizontal: 14,
  paddingVertical: 11,
  variants: {
    tone: {
      error: { borderColor: "$error" },
      info: { borderColor: "$primary" },
      success: { borderColor: "$success" },
    },
  } as const,
});

const FeedbackText = styled(Text, {
  ...typography.bodyMedium,
  flex: 1,
  fontWeight: "600",
  variants: {
    tone: {
      error: { color: "$error" },
      info: { color: "$text" },
      success: { color: "$success" },
    },
  } as const,
});

const CloseButton = styled(Button, {
  alignItems: "center",
  borderRadius: 999,
  height: 30,
  justifyContent: "center",
  pressStyle: buttonPressStyle,
  unstyled: true,
  width: 30,
});
