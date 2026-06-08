import { useEffect, useMemo, useState } from "react";
import { DateFilterConfig, DateFilterValue } from "../shared/types";
import { dateToISODate, parseItemDate, startOfDay } from "../shared/utils";

type UseDateFilterFieldParams = {
  config: DateFilterConfig;
  onValidityChange?: (isValid: boolean) => void;
  resetKey?: number;
  value?: DateFilterValue;
  onChange: (value: DateFilterValue | undefined) => void;
};

export function useDateFilterField({
  config,
  onChange,
  onValidityChange,
  resetKey = 0,
  value,
}: UseDateFilterFieldParams) {
  const mode = config.mode ?? "range";
  const maxDate = useMemo(() => startOfDay(config.maxDate ?? new Date()), [config.maxDate]);
  const [singleDate, setSingleDate] = useState(() => getDateFromISO(value?.date));
  const [startDate, setStartDate] = useState(() => getDateFromISO(value?.startDate));
  const [endDate, setEndDate] = useState(() => getDateFromISO(value?.endDate));
  const [error, setError] = useState("");

  useEffect(() => {
    if (value?.date) setSingleDate(getDateFromISO(value.date));
    if (value?.startDate || value?.endDate) {
      setStartDate(getDateFromISO(value.startDate));
      setEndDate(getDateFromISO(value.endDate));
    }
  }, [value?.date, value?.endDate, value?.startDate]);

  useEffect(() => {
    if (value) return;

    setSingleDate(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setError("");
    onValidityChange?.(true);
  }, [onValidityChange, resetKey, value]);

  const handleSingleChange = (date: Date) => {
    const normalizedDate = startOfDay(date);
    setSingleDate(normalizedDate);
    validateSingle(normalizedDate);
  };

  const handleStartChange = (date: Date) => {
    const normalizedDate = startOfDay(date);
    setStartDate(normalizedDate);
    validateRange(normalizedDate, endDate);
  };

  const handleEndChange = (date: Date) => {
    const normalizedDate = startOfDay(date);
    setEndDate(normalizedDate);
    validateRange(startDate, normalizedDate);
  };

  const validateSingle = (nextDate: Date) => {
    if (nextDate > maxDate) {
      setError("A data não pode ser maior que hoje.");
      onValidityChange?.(false);
      onChange(undefined);
      return;
    }

    setError("");
    onValidityChange?.(true);
    onChange({ date: dateToISODate(nextDate) });
  };

  const validateRange = (nextStartDate?: Date, nextEndDate?: Date) => {
    if (!nextStartDate && !nextEndDate) {
      setError("");
      onValidityChange?.(true);
      onChange(undefined);
      return;
    }

    if (!nextStartDate || !nextEndDate) {
      setError("");
      onValidityChange?.(true);
      return;
    }

    if (nextStartDate > maxDate) {
      setError("A data inicial não pode ser maior que hoje.");
      onValidityChange?.(false);
      onChange(undefined);
      return;
    }

    if (nextEndDate < nextStartDate) {
      setError("A data final não pode ser menor que a inicial.");
      onValidityChange?.(false);
      onChange(undefined);
      return;
    }

    if (nextEndDate > maxDate) {
      setError("A data final não pode ser maior que hoje.");
      onValidityChange?.(false);
      onChange(undefined);
      return;
    }

    setError("");
    onValidityChange?.(true);
    onChange({
      startDate: dateToISODate(nextStartDate),
      endDate: dateToISODate(nextEndDate),
    });
  };

  const startMaximumDate = endDate && endDate < maxDate ? endDate : maxDate;

  return {
    endLabel: config.endLabel ?? "Data final",
    endDate,
    error,
    handleEndChange,
    handleSingleChange,
    handleStartChange,
    maxDate,
    mode,
    singleDate,
    startDate,
    startLabel: config.startLabel ?? "Data inicial",
    startMaximumDate,
  };
}

function getDateFromISO(value?: string) {
  const parsedDate = parseItemDate(value);
  return parsedDate ?? undefined;
}
