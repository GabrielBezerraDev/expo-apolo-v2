import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useThemeMode } from '@hooks/useThemeMode';
import { ButtonRoot, ButtonText } from './styled';


type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type Props = {
  title: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

export function AppButton({ title, variant = 'primary', loading, disabled, onPress }: Props) {
  const { theme } = useThemeMode();

  return (
    <ButtonRoot buttonVariant={variant} disabled={disabled || loading} onPress={onPress}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? theme.white : theme.primary} /> : null}
      <ButtonText buttonVariant={variant}>{title}</ButtonText>
    </ButtonRoot>
  );
}
