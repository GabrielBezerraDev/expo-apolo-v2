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

type BaseFilterConfig<TItem> = {
  key: string;
  label: string;
  getItemValue?: (item: TItem) => unknown;
  chipLabel?: (value: FilterValue, config: FilterConfig<TItem>) => string;
  filter?: (item: TItem, value: FilterValue, values: FilterValues) => boolean;
};

export type DateFilterConfig<TItem = unknown> = BaseFilterConfig<TItem> & {
  type: "date";
  mode?: DateFilterMode;
  startLabel?: string;
  endLabel?: string;
  maxDate?: Date;
};

export type NumberRangeFilterConfig<TItem = unknown> = BaseFilterConfig<TItem> & {
  type: "numberRange";
  startLabel?: string;
  endLabel?: string;
};

export type SelectFilterConfig<TItem = unknown> = BaseFilterConfig<TItem> & {
  type: "select";
  options: FilterOption[];
  multiple?: boolean;
  placeholder?: string;
};

export type TextFilterConfig<TItem = unknown> = BaseFilterConfig<TItem> & {
  type: "text";
  placeholder?: string;
};

export type FilterConfig<TItem = unknown> =
  | DateFilterConfig<TItem>
  | NumberRangeFilterConfig<TItem>
  | SelectFilterConfig<TItem>
  | TextFilterConfig<TItem>;

export type FilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};
