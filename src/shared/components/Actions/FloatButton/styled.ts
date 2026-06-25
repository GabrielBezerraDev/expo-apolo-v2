import { Button, styled, Text, View } from "tamagui";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";

export const FloatButtonRoot = styled(View, {
  position: "absolute",
  right: 20,
  bottom: 20,
  alignItems: "flex-end",
  zIndex: 50,
});

export const ActionRow = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  gap: 10,
  justifyContent: "flex-end",
  minWidth: 220,
});

export const ActionLabel = styled(Text, {
  ...typography.label,
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 999,
  borderWidth: 1,
  color: "$text",
  overflow: "hidden",
  paddingHorizontal: 12,
  paddingVertical: 8,
  flexShrink: 0,
  maxWidth: 150,
});

export const CircleButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  borderRadius: 999,
  borderWidth: 1,
  height: 58,
  justifyContent: "center",
  shadowColor: "$black",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
  pressStyle: buttonPressStyle,
  width: 58,
  variants: {
    variant: {
      main: {
        backgroundColor: "$primary",
        borderColor: "$primaryDark",
      },
      action: {
        backgroundColor: "$card",
        borderColor: "$primary",
      },
    },
    disabled: {
      true: { opacity: 0.45 },
      false: { opacity: 1 },
    },
  } as const,
  defaultVariants: {
    variant: "action",
    disabled: false,
  },
});
