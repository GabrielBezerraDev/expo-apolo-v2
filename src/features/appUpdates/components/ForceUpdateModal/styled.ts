import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const UpdateRoot = styled(View, {
  alignItems: "center",
  gap: 16,
  paddingHorizontal: 4,
  paddingVertical: 6,
});

export const Title = styled(Text, {
  ...typography.headingMedium,
  color: "$text",
  textAlign: "center",
});

export const VersionText = styled(Text, {
  ...typography.bodyLarge,
  color: "$primary",
  fontWeight: "800",
  textAlign: "center",
});

export const Description = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  fontWeight: "700",
  textAlign: "center",
});

export const ProgressBarWrapper = styled(View, {
  backgroundColor: "$border",
  borderRadius: 999,
  height: 9,
  overflow: "hidden",
  width: "100%",
});

export const ProgressBarFill = styled(View, {
  backgroundColor: "$primary",
  borderRadius: 999,
  height: "100%",
});

export const ProgressText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "800",
  textAlign: "center",
});

export const ErrorText = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  fontWeight: "700",
  textAlign: "center",
});
