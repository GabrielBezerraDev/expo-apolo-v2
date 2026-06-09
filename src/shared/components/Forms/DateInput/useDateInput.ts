import { useMemo, useState } from "react";
import { Platform } from "react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";

type UseDateInputParams = {
  disabled?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  value?: Date;
};

export function useDateInput({
  disabled,
  maximumDate,
  minimumDate,
  onChange,
  placeholder = "Selecionar data",
  value,
}: UseDateInputParams) {
  const { theme } = useThemeMode();
  const [visible, setVisible] = useState(false);

  const pickerValue = useMemo(
    () => clampDate(value ?? new Date(), minimumDate, maximumDate),
    [maximumDate, minimumDate, value],
  );

  const displayValue = value ? formatDisplayDate(value) : placeholder;
  const hasValue = Boolean(value);

  const openPicker = () => {
    if (disabled) return;
    setVisible(true);
  };

  const closePicker = () => setVisible(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") closePicker();
    if (event.type === "dismissed" || !selectedDate) return;

    onChange(clampDate(selectedDate, minimumDate, maximumDate));

    if (Platform.OS !== "android") closePicker();
  };

  return {
    displayValue,
    handleChange,
    hasValue,
    openPicker,
    pickerValue,
    theme,
    visible,
  };
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

function clampDate(date: Date, minimumDate?: Date, maximumDate?: Date) {
  if (minimumDate && date < minimumDate) return minimumDate;
  if (maximumDate && date > maximumDate) return maximumDate;
  return date;
}
