import { Pressable } from "react-native";
import { styled, Text } from "tamagui";
import { typography } from "@shared/typography";

export const ButtonRoot = styled(Pressable, {
  minHeight: 50,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 18,
  flexDirection: 'row',
  gap: 8,
  borderColor: '$primary',
  variants: {
    buttonVariant: {
      primary: { backgroundColor: '$primary', borderWidth: 0 },
      danger: { backgroundColor: '$error', borderWidth: 0 },
      secondary: { backgroundColor: '$card', borderWidth: 0 },
      outline: { backgroundColor: 'transparent', borderWidth: 1 },
    },
    disabled: {
      true: { opacity: 0.55 },
      false: { opacity: 1 },
    },
  } as const,
});

export const ButtonText = styled(Text, {
  ...typography.button,
  variants: {
    buttonVariant: {
      primary: { color: '$white' },
      danger: { color: '$white' },
      secondary: { color: '$primary' },
      outline: { color: '$primary' },
    },
  } as const,
});
