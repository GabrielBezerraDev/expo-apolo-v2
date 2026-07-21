import { Button, styled, Text, View } from "tamagui";
import { primaryButtonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";

export const Screen = styled(View, {
  backgroundColor: "$background",
  flex: 1,
});

export const ViewerHeader = styled(View, {
  alignItems: "center",
  borderBottomColor: "$border",
  borderBottomWidth: 1,
  justifyContent: "center",
  minHeight: 52,
  paddingHorizontal: 14,
});

export const PageLabel = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
});

export const ViewerFrame = styled(View, {
  backgroundColor: "$surface",
  borderColor: "$border",
  borderRadius: 14,
  borderWidth: 1,
  flex: 1,
  margin: 12,
  overflow: "hidden",
});

export const CenteredFrame = styled(View, {
  alignItems: "center",
  flex: 1,
  gap: 12,
  justifyContent: "center",
  paddingHorizontal: 28,
});

export const StateIconFrame = styled(View, {
  alignItems: "center",
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 999,
  borderWidth: 1,
  height: 72,
  justifyContent: "center",
  marginBottom: 4,
  width: 72,
});

export const StateTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
  textAlign: "center",
});

export const StateText = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  maxWidth: 360,
  textAlign: "center",
});

export const RetryButton = styled(Button, {
  alignItems: "center",
  backgroundColor: "$primary",
  borderRadius: 12,
  justifyContent: "center",
  marginTop: 4,
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
