import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const LoadingRoot = styled(View, {
  alignItems: "center",
  justifyContent: "center",
});

export const LoadingTextFrame = styled(View, {
  alignItems: "center",
  minWidth: 220,
});

export const LoadingText = styled(Text, {
  ...typography.bodyMedium,
  color: "$primary",
  fontWeight: "800",
  textAlign: "center",
  textShadowColor: "rgba(0, 0, 0, 0.18)",
  textShadowRadius: 2,
});
