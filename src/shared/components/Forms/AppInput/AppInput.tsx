import React, { ReactNode } from "react";
import type { InputProps } from "tamagui";
import { Eye, EyeOff } from "lucide-react-native";
import { ErrorText, InputFrame, InputIconButton, Label, StyledInput, Wrapper } from "./styled";
import {
  Controller,
  ControllerProps,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";
import { useAppInput } from "./useAppInput";

type AppInputControllerProps<T extends FieldValues> = Omit<
  ControllerProps<T>,
  "render"
>;

type AppInputBaseProps = Pick<
  InputProps,
  | "autoCapitalize"
  | "autoComplete"
  | "autoCorrect"
  | "disabled"
  | "keyboardType"
  | "onBlur"
  | "onChangeText"
  | "onFocus"
  | "placeholder"
  | "secureTextEntry"
  | "textContentType"
  | "value"
>;

type Props<T extends FieldValues> = AppInputBaseProps & {
  label?: string;
  error?: string;
  editable?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
  controllerReactFormsProps?: AppInputControllerProps<T>;
};

export function AppInput<T extends FieldValues>({
  label,
  error,
  leftIcon,
  rightIcon,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  editable,
  disabled,
  isPassword,
  keyboardType,
  onBlur,
  onChangeText,
  onFocus,
  placeholder,
  secureTextEntry,
  textContentType,
  value,
  controllerReactFormsProps,
}: Props<T>) {
  const {
    focused,
    getValue,
    handleBlur,
    handleChangeText,
    handleFocus,
    hidden,
    inputHeight,
    theme,
    toggleHidden,
  } = useAppInput({
    isPassword,
    onBlur,
    onChangeText,
    onFocus,
    secureTextEntry,
    value,
  });

  const renderInput = (field?: ControllerRenderProps<T>) => {
    return (
      <Wrapper>
        {label ? <Label>{label}</Label> : null}

        <InputFrame hasError={Boolean(error)} isFocused={focused && !error}>
          {leftIcon}

          <StyledInput
            placeholderTextColor="$mutedText"
            secureTextEntry={hidden}
            color="$text"
            height={inputHeight}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            keyboardType={keyboardType}
            placeholder={placeholder}
            disabled={editable === false || disabled}
            textContentType={textContentType}
            value={getValue(field)}
            onChangeText={(value) => handleChangeText(value, field)}
            onBlur={(event) => handleBlur(event, field)}
            onFocus={handleFocus}
          />

          {isPassword ? (
            <InputIconButton
              accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
              onPress={toggleHidden}
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
            </InputIconButton>
          ) : (
            rightIcon
          )}
        </InputFrame>

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Wrapper>
    );
  };

  if (!controllerReactFormsProps) {
    return renderInput();
  }

  return (
    <Controller
      {...controllerReactFormsProps}
      render={({ field }) => renderInput(field)}
    />
  );
}
