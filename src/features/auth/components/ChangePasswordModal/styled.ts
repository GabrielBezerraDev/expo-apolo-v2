import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const FormRoot = styled(View, {
  gap: 16,
  width: "100%",
});

export const Title = styled(Text, {
  ...typography.headingMedium,
  color: "$text",
  textAlign: "center",
});

export const Description = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  textAlign: "center",
});

export const ApiErrorText = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  textAlign: "center",
});
