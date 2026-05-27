import React, { ReactNode, useState } from 'react';
import { Pressable, TextInput, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { styled, Text, View } from 'tamagui';
import { typography } from '../config/typography';
import { useThemeMode } from '../hooks/useThemeMode';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
};

const Wrapper = styled(View, { gap: 7 });

const Label = styled(Text, { ...typography.label, color: '$text', textTransform: 'uppercase' });

const InputFrame = styled(View, {
  minHeight: 52,
  borderRadius: 14,
  borderWidth: 1,
  backgroundColor: '$background',
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 14,
  gap: 10,
  variants: {
    hasError: {
      true: { borderColor: '$error' },
      false: { borderColor: '$border' },
    },
  } as const,
});

const StyledInput = styled(TextInput, { flex: 1, ...typography.bodyLarge, padding: 0 });

const ErrorText = styled(Text, { ...typography.bodySmall, color: '$error' });

export function AppInput({ label, error, leftIcon, rightIcon, isPassword, secureTextEntry, ...props }: Props) {
  const { theme } = useThemeMode();
  const [hidden, setHidden] = useState(Boolean(isPassword || secureTextEntry));

  return (
    <Wrapper>
      {label ? <Label>{label}</Label> : null}
      <InputFrame hasError={Boolean(error)}>
        {leftIcon}
        <StyledInput placeholderTextColor={theme.mutedText} secureTextEntry={hidden} style={{ color: theme.text }} {...props} />
        {isPassword ? (
          <Pressable onPress={() => setHidden(value => !value)} hitSlop={10}>
            {hidden ? <EyeOff size={20} color={theme.mutedText} /> : <Eye size={20} color={theme.mutedText} />}
          </Pressable>
        ) : (
          rightIcon
        )}
      </InputFrame>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Wrapper>
  );
}
