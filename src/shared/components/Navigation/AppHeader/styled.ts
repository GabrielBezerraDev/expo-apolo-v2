import { Button, styled, Text, View } from "tamagui";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";

export const Root = styled(View, {
  backgroundColor: "$background",
  paddingTop: 14,
  paddingHorizontal: 20,
  paddingBottom: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
});

export const Left = styled(View, { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 });

export const Logo = styled(View, {
  width: 99,
  height: 99,
  flexShrink: 0,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
});

export const Title = styled(Text, { ...typography.headingSmall, color: "$text" });

export const Subtitle = styled(Text, { ...typography.bodySmall, color: "$mutedText" });

export const Actions = styled(View, { flexDirection: "row", alignItems: "center", gap: 10 });

export const HeaderIconButton = styled(Button, {
  unstyled: true,
  pressStyle: buttonPressStyle,
});
