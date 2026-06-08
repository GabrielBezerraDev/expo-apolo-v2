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

type BaseFilterDefinition<TItem> = {
  key: string;
  label: string;
  getItemValue?: (item: TItem) => unknown;
  chipLabel?: (value: FilterValue, definition: FilterDefinition<TItem>) => string;
  filter?: (item: TItem, value: FilterValue, values: FilterValues) => boolean;
};

export type DateFilterDefinition<TItem = unknown> = BaseFilterDefinition<TItem> & {
  type: "date";
  mode?: DateFilterMode;
  startLabel?: string;
  endLabel?: string;
  maxDate?: Date;
};

export type NumberRangeFilterDefinition<TItem = unknown> = BaseFilterDefinition<TItem> & {
  type: "numberRange";
  startLabel?: string;
  endLabel?: string;
};

export type SelectFilterDefinition<TItem = unknown> = BaseFilterDefinition<TItem> & {
  type: "select";
  options: FilterOption[];
  multiple?: boolean;
  placeholder?: string;
};

export type TextFilterDefinition<TItem = unknown> = BaseFilterDefinition<TItem> & {
  type: "text";
  placeholder?: string;
};

export type FilterDefinition<TItem = unknown> =
  | DateFilterDefinition<TItem>
  | NumberRangeFilterDefinition<TItem>
  | SelectFilterDefinition<TItem>
  | TextFilterDefinition<TItem>;

export type FilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};
