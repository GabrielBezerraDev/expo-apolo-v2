import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const FeedbackRoot = styled(View, {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 24,
  gap: 10,
});

export const FeedbackText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  textAlign: "center",
});

export const ErrorText = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  textAlign: "center",
});
