import React, { ReactNode, useState } from "react";
import { Pressable, TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useThemeMode } from "@hooks/useThemeMode";
import { ErrorText, InputFrame, Label, StyledInput, Wrapper } from "./styled";
import {
  Controller,
  ControllerProps,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";
import { useWindowDimensions } from "tamagui";

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
  const { theme } = useThemeMode();
  const [hidden, setHidden] = useState(Boolean(isPassword || secureTextEntry));
  const [focused, setFocused] = useState(false);

  const renderInput = (field?: ControllerRenderProps<T>) => {
    const isControlledByReactHookForm = Boolean(field);
    const { height } = useWindowDimensions();
    return (
      <Wrapper>
        {label ? <Label>{label}</Label> : null}

        <InputFrame hasError={Boolean(error)} isFocused={focused && !error}>
          {leftIcon}

          <StyledInput
            placeholderTextColor={theme.mutedText}
            secureTextEntry={hidden}
            style={{ color: theme.text, height: height * 0.07 }}
            {...props}
            value={
              isControlledByReactHookForm
                ? field?.value == null
                  ? ""
                  : String(field.value)
                : props.value
            }
            onChangeText={(value) => {
              if (isControlledByReactHookForm) {
                field?.onChange(value);
                return;
              }

              props.onChangeText?.(value);
            }}
            onBlur={(event) => {
              setFocused(false);
              field?.onBlur();
              props.onBlur?.(event);
            }}
            onFocus={(event) => {
              setFocused(true);
              props.onFocus?.(event);
            }}
          />

          {isPassword ? (
            <Pressable onPress={() => setHidden((value) => !value)} hitSlop={10}>
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