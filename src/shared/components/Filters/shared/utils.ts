import {
  DateFilterValue,
  FilterChip,
  FilterDefinition,
  FilterOption,
  FilterValue,
  FilterValues,
  NumberRangeFilterValue,
  SelectFilterValue,
} from "./types";

export function hasFilterValue(value: FilterValue | undefined) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (Array.isArray(value)) return value.length > 0;

  if ("date" in value || "startDate" in value || "endDate" in value) {
    return Boolean(value.date || value.startDate || value.endDate);
  }

  if ("startValue" in value || "endValue" in value) {
    return Boolean(value.startValue || value.endValue);
  }

  return false;
}

export function cleanFilterValues(values: FilterValues) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => hasFilterValue(value)),
  ) as FilterValues;
}

export function buildFilterChips(
  definitions: FilterDefinition<any>[],
  values: FilterValues,
  onRemove: (key: string) => void,
): FilterChip[] {
  return definitions.flatMap(definition => {
    const value = values[definition.key];
    if (!hasFilterValue(value)) return [];

    return [
      {
        key: definition.key,
        label: getFilterChipLabel(definition, value as FilterValue),
        onRemove: () => onRemove(definition.key),
      },
    ];
  });
}

export function filterData<TItem>(
  data: TItem[],
  definitions: FilterDefinition<TItem>[],
  values: FilterValues,
) {
  const activeDefinitions = definitions.filter(definition => hasFilterValue(values[definition.key]));
  if (activeDefinitions.length === 0) return data;

  return data.filter(item =>
    activeDefinitions.every(definition => {
      const value = values[definition.key];
      if (!value) return true;
      if (definition.filter) return definition.filter(item, value, values);

      const itemValue = definition.getItemValue?.(item);

      if (definition.type === "date") {
        return matchesDateFilter(itemValue, value as DateFilterValue);
      }

      if (definition.type === "numberRange") {
        return matchesNumberRangeFilter(itemValue, value as NumberRangeFilterValue);
      }

      if (definition.type === "select") {
        return matchesSelectFilter(itemValue, value as SelectFilterValue);
      }

      return matchesTextFilter(itemValue, value as string);
    }),
  );
}

export function maskDateInput(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseDateInput(text: string) {
  const [dayText, monthText, yearText] = text.split("/");
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (!day || !month || !year || yearText?.length !== 4) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return startOfDay(date);
}

export function parseItemDate(value: unknown) {
  if (value instanceof Date) return startOfDay(value);
  if (typeof value !== "string") return null;

  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return parseDateInput(`${day}/${month}/${year}`);
  }

  const brDateMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brDateMatch) {
    const [, day, month, year] = brDateMatch;
    return parseDateInput(`${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfDay(parsed);
}

export function dateToISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isoDateToInput(value?: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

export function formatDateForChip(value?: string) {
  return isoDateToInput(value) || value || "";
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getFilterChipLabel(definition: FilterDefinition<any>, value: FilterValue) {
  if (definition.chipLabel) return definition.chipLabel(value, definition);

  if (definition.type === "date") {
    const dateValue = value as DateFilterValue;
    if (definition.mode === "single") return `${definition.label}: ${formatDateForChip(dateValue.date)}`;
    return `${definition.label}: ${formatDateForChip(dateValue.startDate)} até ${formatDateForChip(dateValue.endDate)}`;
  }

  if (definition.type === "numberRange") {
    const rangeValue = value as NumberRangeFilterValue;
    if (rangeValue.startValue && rangeValue.endValue) {
      return `${definition.label}: ${rangeValue.startValue} até ${rangeValue.endValue}`;
    }
    if (rangeValue.startValue) return `${definition.label}: a partir de ${rangeValue.startValue}`;
    return `${definition.label}: até ${rangeValue.endValue}`;
  }

  if (definition.type === "select") {
    const selectedValues = Array.isArray(value) ? value : [value as string | number];
    const labels = selectedValues.map(selectedValue => findOptionLabel(definition.options, selectedValue));
    return `${definition.label}: ${labels.join(", ")}`;
  }

  return `${definition.label}: ${String(value)}`;
}

function findOptionLabel(options: FilterOption[], value: string | number) {
  return options.find(option => option.value === value)?.label ?? String(value);
}

function matchesDateFilter(itemValue: unknown, filterValue: DateFilterValue) {
  const itemDate = parseItemDate(itemValue);
  if (!itemDate) return false;

  if (filterValue.date) {
    const selectedDate = parseItemDate(filterValue.date);
    return Boolean(selectedDate && itemDate.getTime() === selectedDate.getTime());
  }

  const startDate = filterValue.startDate ? parseItemDate(filterValue.startDate) : null;
  const endDate = filterValue.endDate ? parseItemDate(filterValue.endDate) : null;

  if (startDate && itemDate < startDate) return false;
  if (endDate && itemDate > endDate) return false;
  return true;
}

function matchesNumberRangeFilter(itemValue: unknown, filterValue: NumberRangeFilterValue) {
  const numericValue = Number(itemValue);
  if (Number.isNaN(numericValue)) return false;

  const startValue = Number(filterValue.startValue);
  const endValue = Number(filterValue.endValue);

  if (filterValue.startValue && numericValue < startValue) return false;
  if (filterValue.endValue && numericValue > endValue) return false;
  return true;
}

function matchesSelectFilter(itemValue: unknown, filterValue: SelectFilterValue) {
  const values = Array.isArray(filterValue) ? filterValue : [filterValue];
  return values.map(String).includes(String(itemValue));
}

function matchesTextFilter(itemValue: unknown, filterValue: string) {
  return String(itemValue ?? "")
    .toLowerCase()
    .includes(filterValue.trim().toLowerCase());
}
