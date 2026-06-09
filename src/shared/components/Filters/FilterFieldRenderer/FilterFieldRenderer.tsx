import React from "react";
import {
  DateFilterConfig,
  DateFilterValue,
  FilterConfig,
  FilterValue,
  NumberRangeFilterConfig,
  NumberRangeFilterValue,
  SelectFilterConfig,
  SelectFilterValue,
  TextFilterConfig,
  TextFilterValue,
} from "../shared/types";
import { DateFilterField } from "../DateFilterField";
import { NumberRangeFilterField } from "../NumberRangeFilterField";
import { SelectFilterField } from "../SelectFilterField";
import { TextFilterField } from "../TextFilterField";

type Props = {
  config: FilterConfig;
  onValidityChange?: (isValid: boolean) => void;
  resetKey?: number;
  value?: FilterValue;
  onChange: (value: FilterValue | undefined) => void;
};

export function FilterFieldRenderer({ config, onChange, onValidityChange, resetKey, value }: Props) {
  if (config.type === "date") {
    return (
      <DateFilterField
        config={config as DateFilterConfig}
        onValidityChange={onValidityChange}
        resetKey={resetKey}
        value={value as DateFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  if (config.type === "numberRange") {
    return (
      <NumberRangeFilterField
        config={config as NumberRangeFilterConfig}
        onValidityChange={onValidityChange}
        resetKey={resetKey}
        value={value as NumberRangeFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  if (config.type === "select") {
    return (
      <SelectFilterField
        config={config as SelectFilterConfig}
        value={value as SelectFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  return (
    <TextFilterField
      config={config as TextFilterConfig}
      value={value as TextFilterValue | undefined}
      onChange={onChange}
    />
  );
}
