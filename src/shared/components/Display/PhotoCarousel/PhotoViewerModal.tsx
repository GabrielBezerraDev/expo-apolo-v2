import React from "react";
import { Modal } from "react-native";
import { X } from "lucide-react-native";
import type { PhotoCarouselItem } from "./types";
import {
  ViewerCloseButton,
  ViewerHeader,
  ViewerImage,
  ViewerImageFrame,
  ViewerRoot,
  ViewerTitle,
} from "./styled";

type Props = {
  item: PhotoCarouselItem | null;
  onClose: () => void;
  visible: boolean;
};

export function PhotoViewerModal({ item, onClose, visible }: Props) {
  const title = item?.title ?? "Foto";

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent={false}
      visible={visible}
    >
      <ViewerRoot>
        <ViewerHeader>
          <ViewerTitle numberOfLines={1}>{title}</ViewerTitle>
          <ViewerCloseButton onPress={onClose} hitSlop={10}>
            <X size={24} color="white" />
          </ViewerCloseButton>
        </ViewerHeader>
        <ViewerImageFrame>
          {item?.uri ? (
            <ViewerImage src={item.uri} resizeMode="contain" />
          ) : null}
        </ViewerImageFrame>
      </ViewerRoot>
    </Modal>
  );
}
