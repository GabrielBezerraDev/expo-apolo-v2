import React from "react";
import { Animated } from "react-native";
import { Button, styled, Text, View } from "tamagui";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react-native";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { usePaginationComponent } from "./usePaginationComponent";

const AnimatedView = Animated.createAnimatedComponent(View);

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
    <AnimatedView style={paginationStyle}>
      <PaginationRoot width={width}>
        <TotalItemsSlot>
          <LabelBox
            paddingHorizontal={isNarrow ? 6 : 10}
          >
            <LabelText
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              fontSize={fontSize}
            >
              {labelText}
            </LabelText>
          </LabelBox>
        </TotalItemsSlot>
        <Arrows gap={arrowsGap}>
          <PaginationIconButton icon="first" onPress={sendToFirstPage} size={buttonSize} />
          <PaginationIconButton icon="previous" onPress={previousPage} size={buttonSize} />
          <PaginationIconButton icon="next" onPress={nextPage} size={buttonSize} />
          <PaginationIconButton icon="last" onPress={sendToLastPage} size={buttonSize} />
        </Arrows>
      </PaginationRoot>
    </AnimatedView>
  );
}

function PaginationIconButton({ icon, size, onPress }: PaginationIconButtonProps) {
  const { theme } = useThemeMode();
  const Icon = icon === "first"
    ? ChevronsLeft
    : icon === "previous"
      ? ChevronLeft
      : icon === "next"
        ? ChevronRight
        : ChevronsRight;

  return (
    <IconButton
      onPress={onPress}
      borderRadius={size / 2}
      height={size}
      width={size}
    >
      <Icon size={size / 2} color={theme.black} strokeWidth={2.4} />
    </IconButton>
  );
}

const PaginationRoot = styled(View, {
  alignItems: "center",
  backgroundColor: "$primary",
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 8,
  position: "relative",
  shadowColor: "$black",
  shadowOpacity: 1,
  shadowRadius: 10,
  zIndex: 10,
});

const TotalItemsSlot = styled(View, {
  alignItems: "center",
  flexShrink: 1,
  justifyContent: "flex-start",
  marginRight: 8,
});

const LabelBox = styled(View, {
  backgroundColor: "$white",
  borderRadius: 4,
  paddingVertical: 4,
  shadowOffset: { width: 5, height: 20 },
  shadowOpacity: 0,
  shadowRadius: 12,
});

const LabelText = styled(Text, {
  color: "$black",
  fontWeight: "600",
  textShadowColor: "$black",
  textShadowOffset: { height: 4, width: 4 },
});

const Arrows = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  flexShrink: 0,
  justifyContent: "flex-end",
});

const IconButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$white",
  justifyContent: "center",
  margin: 5,
  pressStyle: buttonPressStyle,
  shadowColor: "$black",
  shadowOpacity: 0.3,
  shadowRadius: 2,
});
