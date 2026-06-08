export type FilterOptionValue = string | number;

export type FilterOption = {
  label: string;
  value: FilterOptionValue;
};

export type DateFilterMode = "single" | "range";

export type DateFilterValue = {
  date?: string;
  startDate?: string;
  endDate?: string;
};

export type NumberRangeFilterValue = {
  startValue?: string;
  endValue?: string;
};

export type SelectFilterValue = FilterOptionValue | FilterOptionValue[];
export type TextFilterValue = string;

export type FilterValue = DateFilterValue | NumberRangeFilterValue | SelectFilterValue | TextFilterValue;
export type FilterValues = Record<string, FilterValue | undefined>;

type BaseFilterConfig = {
  key: string;
  label: string;
  chipLabel?: (value: FilterValue, config: FilterConfig) => string;
};

export type DateFilterConfig = BaseFilterConfig & {
  type: "date";
  mode?: DateFilterMode;
  startLabel?: string;
  endLabel?: string;
  maxDate?: Date;
};

export type NumberRangeFilterConfig = BaseFilterConfig & {
  type: "numberRange";
  startLabel?: string;
  endLabel?: string;
};

export type SelectFilterConfig = BaseFilterConfig & {
  type: "select";
  options: FilterOption[];
  multiple?: boolean;
  placeholder?: string;
};

export type TextFilterConfig = BaseFilterConfig & {
  type: "text";
  placeholder?: string;
};

export type FilterConfig =
  | DateFilterConfig
  | NumberRangeFilterConfig
  | SelectFilterConfig
  | TextFilterConfig;

export type FilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};
