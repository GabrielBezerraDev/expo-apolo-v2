import { useState } from "react";
import { TextInputProps } from "react-native";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { useWindowDimensions } from "tamagui";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";

type TextInputBlurEvent = Parameters<NonNullable<TextInputProps["onBlur"]>>[0];
type TextInputFocusEvent = Parameters<NonNullable<TextInputProps["onFocus"]>>[0];

type UseAppInputParams = Pick<
  TextInputProps,
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
  const { height } = useWindowDimensions();
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
      return;
    }

    onChangeText?.(nextValue);
  };

  const handleBlur = <T extends FieldValues>(
    event: TextInputBlurEvent,
    field?: ControllerRenderProps<T>,
  ) => {
    setFocused(false);
    field?.onBlur();
    onBlur?.(event);
  };

  const handleFocus = (event: TextInputFocusEvent) => {
    setFocused(true);
    onFocus?.(event);
  };

  const toggleHidden = () => setHidden(current => !current);

  return {
    focused,
    getValue,
    handleBlur,
    handleChangeText,
    handleFocus,
    hidden,
    inputHeight: height * 0.07,
    theme,
    toggleHidden,
  };
}
