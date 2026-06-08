import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import {
  DateInputErrorText,
  DateInputFrame,
  DateInputLabel,
  DateInputValue,
  DateInputWrapper,
} from "./styled";
import { useDateInput } from "./useDateInput";

type Props = {
  disabled?: boolean;
  error?: string;
  label?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  value?: Date;
};

export function DateInput({
  disabled,
  error,
  label,
  maximumDate,
  minimumDate,
  onChange,
  placeholder,
  value,
}: Props) {
  const {
    displayValue,
    handleChange,
    hasValue,
    openPicker,
    pickerValue,
    theme,
    visible,
  } = useDateInput({
    disabled,
    maximumDate,
    minimumDate,
    onChange,
    placeholder,
    value,
  });

  return (
    <DateInputWrapper>
      {label ? <DateInputLabel>{label}</DateInputLabel> : null}

      <DateInputFrame
        disabled={Boolean(disabled)}
        hasError={Boolean(error)}
        onPress={openPicker}
        hitSlop={4}
      >
        <DateInputValue placeholder={!hasValue}>{displayValue}</DateInputValue>
        <CalendarDays size={20} color={hasValue ? theme.primary : theme.mutedText} />
      </DateInputFrame>

      {visible ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}

      {error ? <DateInputErrorText>{error}</DateInputErrorText> : null}
    </DateInputWrapper>
  );
}
