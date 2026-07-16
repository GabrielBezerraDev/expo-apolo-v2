import { useState } from "react";
import { Dimensions, useWindowDimensions } from "react-native";
import type { InputProps } from "tamagui";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";

type TextInputBlurEvent = unknown;
type TextInputFocusEvent = unknown;

type UseAppInputParams = Pick<
  InputProps,
  "onBlur" | "onChangeText" | "onFocus" | "secureTextEntry" | "value"
> & {
  isPassword?: boolean;
};

export function useAppInput({
  isPassword,
  onBlur,
  onChangeText,
  onFocus,
  secureTextEntry,
  value,
}: UseAppInputParams) {
  const { theme } = useThemeMode();
  // Subscribe to screen changes without sizing against the keyboard-resized window.
  useWindowDimensions();
  const screenHeight = Dimensions.get("screen").height;
  const [hidden, setHidden] = useState(Boolean(isPassword || secureTextEntry));
  const [focused, setFocused] = useState(false);

  const getValue = <T extends FieldValues>(field?: ControllerRenderProps<T>) => {
    if (!field) return value;
    return field.value == null ? "" : String(field.value);
  };

  const handleChangeText = <T extends FieldValues>(
    nextValue: string,
    field?: ControllerRenderProps<T>,
  ) => {
    if (field) {
      field.onChange(nextValue);
    }

    onChangeText?.(nextValue);
  };

  const handleBlur = <T extends FieldValues>(
    event: TextInputBlurEvent,
    field?: ControllerRenderProps<T>,
  ) => {
    setFocused(false);
    field?.onBlur();
    onBlur?.(event as Parameters<NonNullable<InputProps["onBlur"]>>[0]);
  };

  const handleFocus = (event: TextInputFocusEvent) => {
    setFocused(true);
    onFocus?.(event as Parameters<NonNullable<InputProps["onFocus"]>>[0]);
  };

  const toggleHidden = () => setHidden(current => !current);

  return {
    focused,
    getValue,
    handleBlur,
    handleChangeText,
    handleFocus,
    hidden,
    inputHeight: Math.max(52, screenHeight * 0.07),
    theme,
    toggleHidden,
  };
}
