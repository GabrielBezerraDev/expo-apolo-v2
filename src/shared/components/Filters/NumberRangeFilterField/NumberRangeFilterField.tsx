import React from "react";
import { AppInput } from "@shared/components/Forms/AppInput";
import { NumberRangeFilterConfig, NumberRangeFilterValue } from "../shared/types";
import { FilterErrorText, FilterFieldRoot } from "../shared/styled";
import { useNumberRangeFilterField } from "./useNumberRangeFilterField";

type Props = {
  config: NumberRangeFilterConfig;
  onValidityChange?: (isValid: boolean) => void;
  resetKey?: number;
  value?: NumberRangeFilterValue;
  onChange: (value: NumberRangeFilterValue | undefined) => void;
};

export function NumberRangeFilterField({ config, onChange, onValidityChange, resetKey, value }: Props) {
  const {
    endLabel,
    endValue,
    error,
    handleEndChange,
    handleStartChange,
    startLabel,
    startValue,
  } = useNumberRangeFilterField({ config, onChange, onValidityChange, resetKey, value });

  return (
    <FilterFieldRoot>
      <AppInput
        label={startLabel}
        value={startValue}
        onChangeText={handleStartChange}
        placeholder="0"
        keyboardType="numeric"
      />
      <AppInput
        label={endLabel}
        value={endValue}
        onChangeText={handleEndChange}
        placeholder="0"
        keyboardType="numeric"
      />
      {error ? <FilterErrorText>{error}</FilterErrorText> : null}
    </FilterFieldRoot>
  );
}
