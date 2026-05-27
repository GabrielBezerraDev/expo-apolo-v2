import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { styled, Text } from 'tamagui';
import { typography } from '../config/typography';
import { useThemeMode } from '../hooks/useThemeMode';

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type Props = {
  title: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

const ButtonRoot = styled(Pressable, {
  minHeight: 50,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 18,
  flexDirection: 'row',
  gap: 8,
  borderColor: '$primary',
  variants: {
    variant: {
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

const ButtonText = styled(Text, {
  ...typography.button,
  variants: {
    variant: {
      primary: { color: '$white' },
      danger: { color: '$white' },
      secondary: { color: '$primary' },
      outline: { color: '$primary' },
    },
  } as const,
});

export function AppButton({ title, variant = 'primary', loading, disabled, onPress }: Props) {
  const { theme } = useThemeMode();

  return (
    <ButtonRoot variant={variant} disabled={disabled || loading} onPress={onPress}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? theme.white : theme.primary} /> : null}
      <ButtonText variant={variant}>{title}</ButtonText>
    </ButtonRoot>
  );
}
