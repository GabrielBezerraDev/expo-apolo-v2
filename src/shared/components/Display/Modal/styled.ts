import { Pressable } from "react-native";
import { ScrollView, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const ModalContainer = styled(View, {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 1000,
});

export const ModalBackdrop = styled(Pressable, {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  padding: 20,
  variants: {
    placement: {
      center: { alignItems: "center", justifyContent: "center" },
      top: { alignItems: "center", justifyContent: "flex-start", paddingTop: 36 },
      bottom: { alignItems: "center", justifyContent: "flex-end", paddingBottom: 28 },
      notification: { alignItems: "center", justifyContent: "flex-start", paddingTop: 18 },
    },
  } as const,
});

export const ModalContent = styled(View, {
  backgroundColor: "$card",
  borderColor: "$primary",
  borderRadius: 18,
  borderWidth: 1,
  maxWidth: "100%",
  overflow: "hidden",
  shadowColor: "$black",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  minHeight: "50%"
});

export const ModalHeader = styled(View, {
  alignItems: "center",
  borderBottomColor: "$border",
  borderBottomWidth: 1,
  flexDirection: "row",
  gap: 12,
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingVertical: 14,
});

export const ModalTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
  flex: 1,
});

export const ModalCloseButton = styled(Pressable, {
  alignItems: "center",
  borderRadius: 999,
  height: 32,
  justifyContent: "center",
  width: 32,
});

export const ModalCloseText = styled(Text, {
  color: "$mutedText",
  fontSize: 24,
  lineHeight: 26,
});

export const ModalBody = styled(ScrollView, {
  flexGrow: 0,
});

export const ModalBodyContent = styled(View, {
  padding: 16,
});

export const ModalFooter = styled(View, {
  borderTopColor: "$border",
  borderTopWidth: 1,
  padding: 16,
});
