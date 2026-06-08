import React, { ReactNode } from "react";
import { Pressable, TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { ErrorText, InputFrame, Label, StyledInput, Wrapper } from "./styled";
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

type Props<T extends FieldValues> = TextInputProps & {
  label?: string;
  error?: string;
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
  isPassword,
  secureTextEntry,
  controllerReactFormsProps,
  ...props
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
    onBlur: props.onBlur,
    onChangeText: props.onChangeText,
    onFocus: props.onFocus,
    secureTextEntry,
    value: props.value,
  });

  const renderInput = (field?: ControllerRenderProps<T>) => {
    return (
      <Wrapper>
        {label ? <Label>{label}</Label> : null}

        <InputFrame hasError={Boolean(error)} isFocused={focused && !error}>
          {leftIcon}

          <StyledInput
            placeholderTextColor={theme.mutedText}
            secureTextEntry={hidden}
            style={{ color: theme.black, height: inputHeight }}
            {...props}
            value={getValue(field)}
            onChangeText={(value) => handleChangeText(value, field)}
            onBlur={(event) => handleBlur(event, field)}
            onFocus={handleFocus}
          />

          {isPassword ? (
            <Pressable onPress={toggleHidden} hitSlop={10}>
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
