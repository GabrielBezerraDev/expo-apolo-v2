import React from 'react';
import { ActivityIndicator, PressableProps } from 'react-native';
import { ButtonRoot, ButtonText } from './styled';
import { useAppButton } from './useAppButton';


type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type Props = PressableProps & {
  title: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

export function AppButton({ title, variant = 'primary', loading, disabled, onPress, ...props }: Props) {
  const { disabled: resolvedDisabled, loadingColor } = useAppButton({ disabled, loading, variant });

  return (
    <ButtonRoot buttonVariant={variant} disabled={resolvedDisabled} onPress={onPress} {...props}>
      {loading ? <ActivityIndicator color={loadingColor} /> : null}
      <ButtonText buttonVariant={variant}>{title}</ButtonText>
    </ButtonRoot>
  );
}
