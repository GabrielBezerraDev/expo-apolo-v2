import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react-native";
import { usePagination } from "./PaginationProvider";

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
    nextPage,
    sendToLastPage,
    previousPage,
    sendToFirstPage,
    currentPage,
    lastPage,
    totalItems,
  } = usePagination();

  const paginationTranslateY = useRef(new Animated.Value(100)).current;
  const { width } = useWindowDimensions();

  const isNarrow = width < 420;
  const isVeryNarrow = width < 340;
  const buttonSize = isVeryNarrow ? 22 : isNarrow ? 26 : 30;
  const fontSize = isVeryNarrow ? 11 : isNarrow ? 12 : 14;
  const arrowsGap = isVeryNarrow ? 4 : isNarrow ? 6 : 10;
  const labelText = isNarrow
    ? `${currentPage}/${lastPage} • ${totalItems} ${itemLabel}`
    : `Página ${currentPage} de ${lastPage} | Total de ${itemLabel}: ${totalItems}`;

  useEffect(() => {
    Animated.timing(paginationTranslateY, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [paginationTranslateY]);

  return (
    <Animated.View style={{ transform: [{ translateY: paginationTranslateY }] }}>
      <View style={[styles.wrapper, {width: width}]}>
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
    backgroundColor: "#fa6406ff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 36,
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
