import { Button, styled, Text, View } from "tamagui";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";

export const DrawerPanel = styled(View, {
  backgroundColor: "$background",
  borderLeftColor: "$border",
  borderLeftWidth: 1,
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 28,
});

export const DrawerHeader = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 8,
});

export const DrawerTitle = styled(Text, {
  ...typography.headingMedium,
  color: "$text",
});

export const DrawerSubtitle = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  marginBottom: 18,
});

export const DrawerCloseButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  borderRadius: 999,
  height: 36,
  justifyContent: "center",
  pressStyle: buttonPressStyle,
  width: 36,
});

export const DrawerItem = styled(Button, {
  unstyled: true,
  alignItems: "flex-start",
  borderBottomColor: "$border",
  borderBottomWidth: 1,
  paddingVertical: 16,
  pressStyle: buttonPressStyle,
});

export const DrawerItemText = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "600",
});

export const DrawerBackdropButton = styled(Button, {
  unstyled: true,
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});
