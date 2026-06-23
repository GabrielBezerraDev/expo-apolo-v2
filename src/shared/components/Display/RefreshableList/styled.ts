import { Button, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const FeedbackRoot = styled(View, {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 24,
  gap: 14,
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

export const RetryButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$primary",
  borderRadius: 12,
  justifyContent: "center",
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 12,
});

export const RetryButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
});
