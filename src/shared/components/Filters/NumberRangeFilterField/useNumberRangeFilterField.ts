import { useEffect, useState } from "react";
import { NumberRangeFilterDefinition, NumberRangeFilterValue } from "../shared/types";

type UseNumberRangeFilterFieldParams = {
  definition: NumberRangeFilterDefinition<any>;
  value?: NumberRangeFilterValue;
  onChange: (value: NumberRangeFilterValue | undefined) => void;
};

export function useNumberRangeFilterField({ definition, onChange, value }: UseNumberRangeFilterFieldParams) {
  const [startValue, setStartValue] = useState(value?.startValue ?? "");
  const [endValue, setEndValue] = useState(value?.endValue ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setStartValue(value?.startValue ?? "");
    setEndValue(value?.endValue ?? "");
  }, [value?.endValue, value?.startValue]);

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
      onChange(undefined);
      return;
    }

    if (nextStartValue && nextEndValue && Number(nextStartValue) > Number(nextEndValue)) {
      setError("O valor inicial não pode ser maior que o final.");
      onChange(undefined);
      return;
    }

    setError("");
    onChange({
      startValue: nextStartValue || undefined,
      endValue: nextEndValue || undefined,
    });
  };

  return {
    endLabel: definition.endLabel ?? "Até",
    endValue,
    error,
    handleEndChange,
    handleStartChange,
    startLabel: definition.startLabel ?? "De",
    startValue,
  };
}

function onlyNumbers(text: string) {
  return text.replace(/\D/g, "");
}
