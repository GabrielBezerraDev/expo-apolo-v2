import React from "react";
import {
  DateFilterDefinition,
  DateFilterValue,
  FilterDefinition,
  FilterValue,
  NumberRangeFilterDefinition,
  NumberRangeFilterValue,
  SelectFilterDefinition,
  SelectFilterValue,
  TextFilterDefinition,
  TextFilterValue,
} from "../shared/types";
import { DateFilterField } from "../DateFilterField";
import { NumberRangeFilterField } from "../NumberRangeFilterField";
import { SelectFilterField } from "../SelectFilterField";
import { TextFilterField } from "../TextFilterField";

type Props = {
  definition: FilterDefinition<any>;
  resetKey?: number;
  value?: FilterValue;
  onChange: (value: FilterValue | undefined) => void;
};

export function FilterFieldRenderer({ definition, onChange, resetKey, value }: Props) {
  if (definition.type === "date") {
    return (
      <DateFilterField
        definition={definition as DateFilterDefinition<any>}
        resetKey={resetKey}
        value={value as DateFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  if (definition.type === "numberRange") {
    return (
      <NumberRangeFilterField
        definition={definition as NumberRangeFilterDefinition<any>}
        value={value as NumberRangeFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  if (definition.type === "select") {
    return (
      <SelectFilterField
        definition={definition as SelectFilterDefinition<any>}
        value={value as SelectFilterValue | undefined}
        onChange={onChange}
      />
    );
  }

  return (
    <TextFilterField
      definition={definition as TextFilterDefinition<any>}
      value={value as TextFilterValue | undefined}
      onChange={onChange}
    />
  );
}
