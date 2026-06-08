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
  config: FilterConfig<any>;
  resetKey?: number;
  value?: FilterValue;
  onChange: (value: FilterValue | undefined) => void;
};

export function FilterFieldRenderer({ config, onChange, resetKey, value }: Props) {
  if (config.type === "date") {
    return (
      <DateFilterField
        config={config as DateFilterConfig<any>}
        resetKey={resetKey}
        value={value as DateFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  if (config.type === "numberRange") {
    return (
      <NumberRangeFilterField
        config={config as NumberRangeFilterConfig<any>}
        value={value as NumberRangeFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  if (config.type === "select") {
    return (
      <SelectFilterField
        config={config as SelectFilterConfig<any>}
        value={value as SelectFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  return (
    <TextFilterField
      config={config as TextFilterConfig<any>}
      value={value as TextFilterValue | undefined}
      onChange={onChange}
    />
  );
}
