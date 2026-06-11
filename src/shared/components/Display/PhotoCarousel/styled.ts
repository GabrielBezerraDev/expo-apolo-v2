import { Button, Image, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const CarouselRoot = styled(View, {
  width: "100%",
});

export const CarouselPage = styled(View, {
  gap: 10,
});

export const ItemHeader = styled(View, {
  gap: 2,
  minHeight: 46,
});

export const ItemTitle = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "800",
});

export const ItemSubtitle = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

export const PhotoFrame = styled(View, {
  backgroundColor: "$background",
  borderColor: "$border",
  borderRadius: 14,
  borderWidth: 1,
  overflow: "hidden",
});

export const PhotoImage = styled(Image, {
  height: "100%",
  width: "100%",
});

export const EmptyContent = styled(View, {
  alignItems: "center",
  flex: 1,
  gap: 8,
  justifyContent: "center",
  padding: 16,
});

export const EmptyTitle = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "800",
  textAlign: "center",
});

export const EmptyCounter = styled(Text, {
  color: "$mutedText",
  fontSize: 34,
  fontWeight: "900",
});

export const EmptyText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
  textAlign: "center",
});

export const EditOverlay = styled(Button, {
  unstyled: true,
  bottom: 0,
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
  zIndex: 1,
});

export const ExpandButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.66)",
  borderColor: "rgba(255, 255, 255, 0.5)",
  borderRadius: 999,
  borderWidth: 1,
  bottom: 12,
  height: 42,
  justifyContent: "center",
  position: "absolute",
  right: 12,
  width: 42,
  zIndex: 2,
});

export const ViewerRoot = styled(View, {
  backgroundColor: "$black",
  flex: 1,
  paddingHorizontal: 16,
  paddingVertical: 18,
});

export const ViewerHeader = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  gap: 12,
  justifyContent: "space-between",
  minHeight: 48,
});

export const ViewerTitle = styled(Text, {
  ...typography.bodyMedium,
  color: "$white",
  flex: 1,
  fontWeight: "800",
});

export const ViewerCloseButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.16)",
  borderRadius: 999,
  height: 42,
  justifyContent: "center",
  width: 42,
});

export const ViewerImageFrame = styled(View, {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
});

export const ViewerImage = styled(Image, {
  height: "100%",
  width: "100%",
});
