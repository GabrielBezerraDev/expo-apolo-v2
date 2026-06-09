import { Button, Input, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const Wrapper = styled(View, { gap: 7 });

export const Label = styled(Text, { ...typography.label, color: "$text", textTransform: "uppercase" });

export const InputFrame = styled(View, {
  minHeight: 52,
  borderRadius: 14,
  borderWidth: 1,
  backgroundColor: "$gray100",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 14,
  width: '100%',
  gap: 10,
  variants: {
    hasError: {
      true: { borderColor: "$error" },
      false: { borderColor: "$border" },
    },
    isFocused: {
      true: { borderColor: "$primary" },
      false: {},
    },
  } as const,
});

export const StyledInput = styled(Input, {
  unstyled: true,
  flex: 1,
  ...typography.bodyLarge,
  padding: 0,
});

export const InputIconButton = styled(Button, {
  unstyled: true,
});


export const ErrorText = styled(Text, { ...typography.bodySmall, color: "$error" });
