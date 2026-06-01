import React, { ReactNode, useState } from "react";
import { Pressable, TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useThemeMode } from "@hooks/useThemeMode";
import { ErrorText, InputFrame, Label, StyledInput, Wrapper } from "./styled";
import { Controller, ControllerProps } from "react-hook-form";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
  controllerReactFormsProps: Omit<ControllerProps, 'render'>;
};

export function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword,
  secureTextEntry,
  controllerReactFormsProps,
  ...props
}: Props) {
  const { theme } = useThemeMode();
  const [hidden, setHidden] = useState(Boolean(isPassword || secureTextEntry));
  const [focused, setFocused] = useState(false);

  return (
    <Controller
      {...controllerReactFormsProps}
      render={(controllerProps) => {
        return <Wrapper>
          {label ? <Label>{label}</Label> : null}
          <InputFrame hasError={Boolean(error)} isFocused={focused && !error}>
            {leftIcon}
            <StyledInput
              placeholderTextColor={theme.mutedText}
              secureTextEntry={hidden}
              style={{ color: theme.text }}
              {...props}
              onBlur={(event) => {
                setFocused(false);
                props.onBlur?.(event);
              }}
              onFocus={(event) => {
                setFocused(true);
                props.onFocus?.(event);
              }}
            />
            {isPassword ? (
              <Pressable
                onPress={() => setHidden((value) => !value)}
                hitSlop={10}
              >
                {hidden ? (
                  <EyeOff
                    size={20}
                    color={focused ? theme.primary : theme.mutedText}
                  />
                ) : (
                  <Eye
                    size={20}
                    color={focused ? theme.primary : theme.mutedText}
                  />
                )}
              </Pressable>
            ) : (
              rightIcon
            )}
          </InputFrame>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </Wrapper>;
      }}
    />
  );
}
