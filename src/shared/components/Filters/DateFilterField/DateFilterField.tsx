import React from "react";
import { DateInput } from "@shared/components/Forms/DateInput";
import { DateFilterConfig, DateFilterValue } from "../shared/types";
import { FilterErrorText, FilterFieldRoot, FilterHelpText } from "../shared/styled";
import { useDateFilterField } from "./useDateFilterField";

type Props = {
  config: DateFilterConfig<any>;
  resetKey?: number;
  value?: DateFilterValue;
  onChange: (value: DateFilterValue | undefined) => void;
};

export function DateFilterField({ config, onChange, resetKey, value }: Props) {
  const {
    endLabel,
    endDate,
    error,
    handleEndChange,
    handleSingleChange,
    handleStartChange,
    maxDate,
    mode,
    singleDate,
    startDate,
    startLabel,
    startMaximumDate,
  } = useDateFilterField({ config, onChange, resetKey, value });

  return (
    <FilterFieldRoot>
      <FilterHelpText>Toque no campo para selecionar a data. Datas futuras não são aceitas.</FilterHelpText>

      {mode === "single" ? (
        <DateInput
          label={config.label}
          value={singleDate}
          onChange={handleSingleChange}
          maximumDate={maxDate}
          placeholder="Selecionar data"
        />
      ) : (
        <>
          <DateInput
            label={startLabel}
            value={startDate}
            onChange={handleStartChange}
            maximumDate={startMaximumDate}
            placeholder="Selecionar data inicial"
          />
          <DateInput
            label={endLabel}
            value={endDate}
            onChange={handleEndChange}
            minimumDate={startDate}
            maximumDate={maxDate}
            placeholder="Selecionar data final"
          />
        </>
      )}

      {error ? <FilterErrorText>{error}</FilterErrorText> : null}
    </FilterFieldRoot>
  );
}
