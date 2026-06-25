import { Button, styled, Text, View } from "tamagui";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";

export const DateInputWrapper = styled(View, {
  gap: 7,
});

export const DateInputLabel = styled(Text, {
  ...typography.label,
  color: "$text",
  textTransform: "uppercase",
});

export const DateInputFrame = styled(Button, {
  unstyled: true,
  minHeight: 52,
  borderRadius: 14,
  borderWidth: 1,
  backgroundColor: "$gray100",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 14,
  width: "100%",
  gap: 10,
  pressStyle: buttonPressStyle,
  variants: {
    hasError: {
      true: { borderColor: "$error" },
      false: { borderColor: "$border" },
    },
    disabled: {
      true: { opacity: 0.55 },
      false: { opacity: 1 },
    },
  } as const,
});

export const DateInputValue = styled(Text, {
  flex: 1,
  ...typography.bodyLarge,
  variants: {
    placeholder: {
      true: { color: "$mutedText" },
      false: { color: "$black" },
    },
  } as const,
});

export const DateInputErrorText = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
});
