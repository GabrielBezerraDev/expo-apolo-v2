import { useEffect, useState } from "react";
import { NumberRangeFilterConfig, NumberRangeFilterValue } from "../shared/types";

type UseNumberRangeFilterFieldParams = {
  config: NumberRangeFilterConfig;
  onValidityChange?: (isValid: boolean) => void;
  resetKey?: number;
  value?: NumberRangeFilterValue;
  onChange: (value: NumberRangeFilterValue | undefined) => void;
};

export function useNumberRangeFilterField({
  config,
  onChange,
  onValidityChange,
  resetKey = 0,
  value,
}: UseNumberRangeFilterFieldParams) {
  const [startValue, setStartValue] = useState(value?.startValue ?? "");
  const [endValue, setEndValue] = useState(value?.endValue ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setStartValue(value?.startValue ?? "");
    setEndValue(value?.endValue ?? "");
  }, [value?.endValue, value?.startValue]);

  useEffect(() => {
    if (value) return;

    setStartValue("");
    setEndValue("");
    setError("");
    onValidityChange?.(true);
  }, [onValidityChange, resetKey, value]);

  const handleStartChange = (text: string) => {
    const nextValue = onlyNumbers(text);
    setStartValue(nextValue);
    emitChange(nextValue, endValue);
  };

  const handleEndChange = (text: string) => {
    const nextValue = onlyNumbers(text);
    setEndValue(nextValue);
    emitChange(startValue, nextValue);
  };

  const emitChange = (nextStartValue: string, nextEndValue: string) => {
    if (!nextStartValue && !nextEndValue) {
      setError("");
      onValidityChange?.(true);
      onChange(undefined);
      return;
    }

    if (nextStartValue && nextEndValue && Number(nextStartValue) > Number(nextEndValue)) {
      setError("O valor inicial não pode ser maior que o final.");
      onValidityChange?.(false);
      onChange({
        startValue: nextStartValue || undefined,
        endValue: nextEndValue || undefined,
      });
      return;
    }

    setError("");
    onValidityChange?.(true);
    onChange({
      startValue: nextStartValue || undefined,
      endValue: nextEndValue || undefined,
    });
  };

  return {
    endLabel: config.endLabel ?? "Até",
    endValue,
    error,
    handleEndChange,
    handleStartChange,
    startLabel: config.startLabel ?? "De",
    startValue,
  };
}

function onlyNumbers(text: string) {
  return text.replace(/\D/g, "");
}
