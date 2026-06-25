import { Button, styled, Text, View } from "tamagui";
import { primaryButtonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";

export const FeedbackRoot = styled(View, {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 24,
  gap: 6,
});

export const FeedbackText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "800",
  textAlign: "center",
});

export const ErrorText = styled(Text, {
  ...typography.bodyMedium,
  color: "$error",
  fontWeight: "800",
  textAlign: "center",
});

export const OfflineNoticeText = styled(Text, {
  ...typography.bodySmall,
  color: "$text",
  fontWeight: "800",
  textAlign: "center",
});

export const RetryButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$primary",
  borderRadius: 12,
  justifyContent: "center",
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 12,
  pressStyle: primaryButtonPressStyle,
});

export const RetryButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
});
