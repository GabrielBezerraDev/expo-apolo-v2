import React from 'react';
import { Spinner } from 'tamagui';
import { ButtonRoot, ButtonText } from './styled';
import { useAppButton } from './useAppButton';


type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type Props = Omit<
  React.ComponentProps<typeof ButtonRoot>,
  "buttonVariant" | "children" | "disabled" | "onPress" | "variant"
> & {
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
      {loading ? <Spinner color={loadingColor} /> : null}
      <ButtonText buttonVariant={variant}>{title}</ButtonText>
    </ButtonRoot>
  );
}
