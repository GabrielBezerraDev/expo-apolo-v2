import {
  DateFilterValue,
  FilterChip,
  FilterConfig,
  FilterOption,
  FilterValue,
  FilterValues,
  NumberRangeFilterValue,
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
  configs: FilterConfig[],
  values: FilterValues,
  onRemove: (key: string) => void,
): FilterChip[] {
  return configs.flatMap(config => {
    const value = values[config.key];
    if (!hasFilterValue(value)) return [];

    return [
      {
        key: config.key,
        label: getFilterChipLabel(config, value as FilterValue),
        onRemove: () => onRemove(config.key),
      },
    ];
  });
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

function getFilterChipLabel(config: FilterConfig, value: FilterValue) {
  if (config.chipLabel) return config.chipLabel(value, config);

  if (config.type === "date") {
    const dateValue = value as DateFilterValue;
    if (config.mode === "single") return `${config.label}: ${formatDateForChip(dateValue.date)}`;
    return `${config.label}: ${formatDateForChip(dateValue.startDate)} até ${formatDateForChip(dateValue.endDate)}`;
  }

  if (config.type === "numberRange") {
    const rangeValue = value as NumberRangeFilterValue;
    if (rangeValue.startValue && rangeValue.endValue) {
      return `${config.label}: ${rangeValue.startValue} até ${rangeValue.endValue}`;
    }
    if (rangeValue.startValue) return `${config.label}: a partir de ${rangeValue.startValue}`;
    return `${config.label}: até ${rangeValue.endValue}`;
  }

  if (config.type === "select") {
    const selectedValues = Array.isArray(value) ? value : [value as string | number];
    const labels = selectedValues.map(selectedValue => findOptionLabel(config.options, selectedValue));
    return `${config.label}: ${labels.join(", ")}`;
  }

  return `${config.label}: ${String(value)}`;
}

function findOptionLabel(options: FilterOption[], value: string | number) {
  return options.find(option => option.value === value)?.label ?? String(value);
}
