import { Pressable } from "react-native";
import { styled, Text, View } from "tamagui";
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
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
});

export const Title = styled(Text, { ...typography.headingSmall, color: "$text" });

export const Subtitle = styled(Text, { ...typography.bodySmall, color: "$mutedText" });

export const Actions = styled(View, { flexDirection: "row", alignItems: "center", gap: 10 });

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
