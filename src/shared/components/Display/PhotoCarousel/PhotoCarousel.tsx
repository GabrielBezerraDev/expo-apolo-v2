import React, { useState } from "react";
import { FlatList, Image, StyleSheet } from "react-native";
import { Maximize2 } from "lucide-react-native";
import { PhotoViewerModal } from "./PhotoViewerModal";
import {
  CarouselPage,
  CarouselRoot,
  EditOverlay,
  EmptyContent,
  EmptyCounter,
  EmptyText,
  EmptyTitle,
  ExpandButton,
  ItemHeader,
  ItemSubtitle,
  ItemTitle,
  PhotoFrame,
} from "./styled";
import type { PhotoCarouselItem, PhotoCarouselProps } from "./types";
import { usePhotoCarouselLayout } from "./usePhotoCarouselLayout";

export function PhotoCarousel({
  captureOrientation = "LandScape",
  emptyLabel = "Foto pendente",
  heightPreset = "medium",
  imageResizeMode = "cover",
  items,
  onPressItem,
  readonly = false,
  showCounter = true,
  showExpandButton = true,
  showItemHeader = false,
}: PhotoCarouselProps) {
  const [viewerItem, setViewerItem] = useState<PhotoCarouselItem | null>(null);
  const { carouselWidth, handleLayout, photoHeight, totalHeight } = usePhotoCarouselLayout({
    heightPreset,
    showItemHeader,
  });

  return (
    <CarouselRoot onLayout={handleLayout}>
      <FlatList
        horizontal
        pagingEnabled
        data={items}
        getItemLayout={(_, index) => ({
          index,
          length: carouselWidth,
          offset: carouselWidth * index,
        })}
        keyExtractor={(item, index) => item.id || `${index}`}
        renderItem={({ item, index }) => renderItem(item, index)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={carouselWidth}
        style={{ height: totalHeight, width: carouselWidth }}
      />
      <PhotoViewerModal
        item={viewerItem}
        onClose={() => setViewerItem(null)}
        visible={Boolean(viewerItem?.uri)}
      />
    </CarouselRoot>
  );

  function renderItem(item: PhotoCarouselItem, index: number) {
    const hasPhoto = Boolean(item.uri);
    const canEdit = !readonly && !item.disabled && Boolean(onPressItem);
    const resolvedCaptureOrientation = item.captureOrientation ?? captureOrientation;
    return (
      <CarouselPage width={carouselWidth}>
        {showItemHeader ? (
          <ItemHeader>
            {item.title ? <ItemTitle>{item.title}</ItemTitle> : null}
            {item.subtitle ? <ItemSubtitle>{item.subtitle}</ItemSubtitle> : null}
          </ItemHeader>
        ) : null}
        <PhotoFrame width={carouselWidth} height={photoHeight}>
          {hasPhoto ? (
            <Image
              resizeMode={imageResizeMode}
              source={{ uri: item.uri ?? "" }}
              style={styles.image}
            />
          ) : (
            <EmptyContent>
              {!showItemHeader && item.title ? <EmptyTitle>{item.title}</EmptyTitle> : null}
              {showCounter ? <EmptyCounter>{index + 1}/{items.length}</EmptyCounter> : null}
              <EmptyText>{emptyLabel}</EmptyText>
              {!showItemHeader && item.subtitle ? <EmptyText>{item.subtitle}</EmptyText> : null}
            </EmptyContent>
          )}
          {canEdit ? (
            <EditOverlay onPress={() => onPressItem?.(item, index, resolvedCaptureOrientation)} />
          ) : null}
          {hasPhoto && showExpandButton ? (
            <ExpandButton onPress={() => setViewerItem(item)} hitSlop={8}>
              <Maximize2 size={20} color="white" />
            </ExpandButton>
          ) : null}
        </PhotoFrame>
      </CarouselPage>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    height: "100%",
    width: "100%",
  },
});
