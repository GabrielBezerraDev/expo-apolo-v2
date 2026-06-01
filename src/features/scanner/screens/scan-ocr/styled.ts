import { Pressable } from "react-native";
import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const ScannerRoot = styled(View, {
  backgroundColor: "$black",
  flex: 1,
});

export const ScannerOverlay = styled(View, {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const ScannerTopBar = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 18,
  paddingTop: 28,
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
});

export const ScannerTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$white",
});

export const ScannerDescription = styled(Text, {
  ...typography.bodySmall,
  color: "$white",
  maxWidth: 260,
  opacity: 0.78,
  textAlign: "center",
});

export const ScannerIconButton = styled(Pressable, {
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.42)",
  borderColor: "rgba(255, 255, 255, 0.22)",
  borderRadius: 999,
  borderWidth: 1,
  height: 46,
  justifyContent: "center",
  width: 46,
});

export const FrameBox = styled(View, {
  borderColor: "$primary",
  borderRadius: 18,
  borderWidth: 2,
  position: "absolute",
});

export const FrameCorner = styled(View, {
  borderColor: "$white",
  height: 24,
  position: "absolute",
  width: 24,
  variants: {
    corner: {
      topLeft: { borderLeftWidth: 4, borderTopWidth: 4, left: -3, top: -3, borderTopLeftRadius: 18 },
      topRight: { borderRightWidth: 4, borderTopWidth: 4, right: -3, top: -3, borderTopRightRadius: 18 },
      bottomLeft: { borderBottomWidth: 4, borderLeftWidth: 4, bottom: -3, left: -3, borderBottomLeftRadius: 18 },
      bottomRight: { borderBottomWidth: 4, borderRightWidth: 4, bottom: -3, right: -3, borderBottomRightRadius: 18 },
    },
  } as const,
});

export const CaptureButtonOuter = styled(Pressable, {
  alignItems: "center",
  backgroundColor: "rgba(255, 98, 0, 0.22)",
  borderColor: "$primary",
  borderRadius: 999,
  borderWidth: 2,
  bottom: 34,
  height: 82,
  justifyContent: "center",
  left: "50%",
  marginLeft: -41,
  position: "absolute",
  width: 82,
  zIndex: 10,
});

export const CaptureButtonInner = styled(View, {
  backgroundColor: "$primary",
  borderRadius: 999,
  height: 60,
  width: 60,
});

export const PermissionPanel = styled(View, {
  alignItems: "center",
  backgroundColor: "$background",
  flex: 1,
  gap: 14,
  justifyContent: "center",
  padding: 24,
});

export const PermissionText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  textAlign: "center",
});

export const PermissionButton = styled(Pressable, {
  backgroundColor: "$primary",
  borderRadius: 14,
  paddingHorizontal: 18,
  paddingVertical: 14,
});

export const PermissionButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
});
