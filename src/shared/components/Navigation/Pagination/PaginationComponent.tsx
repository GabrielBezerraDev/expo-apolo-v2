import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { View } from "tamagui";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react-native";
import { usePaginationComponent } from "./usePaginationComponent";

type PaginationComponentProps = {
  itemLabel?: string;
};

type PaginationIconButtonProps = {
  icon: "first" | "previous" | "next" | "last";
  size: number;
  onPress: () => void;
};

export function PaginationComponent({ itemLabel = "Paletes" }: PaginationComponentProps) {
  const {
    arrowsGap,
    buttonSize,
    fontSize,
    isNarrow,
    labelText,
    nextPage,
    paginationStyle,
    previousPage,
    sendToFirstPage,
    sendToLastPage,
    width,
  } = usePaginationComponent(itemLabel);

  return (
    <Animated.View style={paginationStyle}>
      <View style={[styles.wrapper, {width: width}]} backgroundColor={'$primary'} >
        <View style={[styles.totalItemsSlot, { flexShrink: 1, marginRight: 8 }]}> 
          <View
            style={[
              styles.labelBox,
              {
                paddingHorizontal: isNarrow ? 6 : 10,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[styles.labelText, { fontSize }]}
            >
              {labelText}
            </Text>
          </View>
        </View>
        <View style={[styles.arrows, { gap: arrowsGap, flexShrink: 0 }]}> 
          <PaginationIconButton icon="first" onPress={sendToFirstPage} size={buttonSize} />
          <PaginationIconButton icon="previous" onPress={previousPage} size={buttonSize} />
          <PaginationIconButton icon="next" onPress={nextPage} size={buttonSize} />
          <PaginationIconButton icon="last" onPress={sendToLastPage} size={buttonSize} />
        </View>
      </View>
    </Animated.View>
  );
}

function PaginationIconButton({ icon, size, onPress }: PaginationIconButtonProps) {
  const Icon = icon === "first"
    ? ChevronsLeft
    : icon === "previous"
      ? ChevronLeft
      : icon === "next"
        ? ChevronRight
        : ChevronsRight;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.iconButton,
        {
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}
    >
      <Icon size={size / 2} color="black" strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    position: "relative",
    shadowColor: "#000000",
    shadowOpacity: 1,
    shadowRadius: 10,
    zIndex: 10,
  },
  totalItemsSlot: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  labelBox: {
    backgroundColor: "white",
    borderRadius: 4,
    elevation: 2,
    paddingVertical: 4,
    shadowOffset: { width: 5, height: 20 },
    shadowOpacity: 0,
    shadowRadius: 12,
  },
  labelText: {
    color: "black",
    fontWeight: "600",
    textShadowColor: "black",
    textShadowOffset: { height: 4, width: 4 },
  },
  arrows: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "white",
    elevation: 12,
    justifyContent: "center",
    margin: 5,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
