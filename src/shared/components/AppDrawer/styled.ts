import { Pressable } from "react-native";
import { styled, Text, View } from "tamagui";
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

export const DrawerCloseButton = styled(Pressable, {
  alignItems: "center",
  borderRadius: 999,
  height: 36,
  justifyContent: "center",
  width: 36,
});

export const DrawerItem = styled(Pressable, {
  borderBottomColor: "$border",
  borderBottomWidth: 1,
  paddingVertical: 16,
});

export const DrawerItemText = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "600",
});
