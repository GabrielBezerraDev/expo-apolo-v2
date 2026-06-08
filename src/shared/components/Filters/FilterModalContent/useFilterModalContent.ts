import { useCallback, useEffect, useMemo, useState } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { FilterConfig, FilterValue, FilterValues } from "../shared/types";
import { buildFilterChips, cleanFilterValues } from "../shared/utils";

type UseFilterModalContentParams = {
  configs: FilterConfig[];
  initialValues?: FilterValues;
  onApply: (values: FilterValues) => void;
};

export function useFilterModalContent({
  configs,
  initialValues = {},
  onApply,
}: UseFilterModalContentParams) {
  const { closeAllModals } = useModal();
  const [draftValues, setDraftValues] = useState<FilterValues>(initialValues);
  const [invalidFilterKeys, setInvalidFilterKeys] = useState<Record<string, boolean>>({});
  const [resetKey, setResetKey] = useState(0);
  const [selectedKey, setSelectedKey] = useState(getInitialSelectedKey(configs, initialValues));

  useEffect(() => {
    setDraftValues(initialValues);
    setInvalidFilterKeys({});
    setSelectedKey(getInitialSelectedKey(configs, initialValues));
  }, [configs, initialValues]);

  const selectedConfig = useMemo(
    () => configs.find(config => config.key === selectedKey) ?? configs[0],
    [configs, selectedKey],
  );

  const setFilterValue = (key: string, value: FilterValue | undefined) => {
    setDraftValues(current => {
      const nextValues = { ...current };

      if (value == null) {
        delete nextValues[key];
        setFilterValidity(key, true);
        return nextValues;
      }

      nextValues[key] = value;
      return nextValues;
    });
  };

  const setFilterValidity = useCallback((key: string, isValid: boolean) => {
    setInvalidFilterKeys(current => {
      if (isValid) {
        if (!current[key]) return current;

        const nextKeys = { ...current };
        delete nextKeys[key];
        return nextKeys;
      }

      if (current[key]) return current;
      return { ...current, [key]: true };
    });
  }, []);

  const removeFilter = (key: string) => {
    setDraftValues(current => {
      const nextValues = { ...current };
      delete nextValues[key];
      return nextValues;
    });
    setFilterValidity(key, true);
    setResetKey(current => current + 1);
  };

  const chips = useMemo(
    () => buildFilterChips(configs, draftValues, removeFilter),
    [configs, draftValues],
  );

  const cleanedDraftValues = useMemo(() => cleanFilterValues(draftValues), [draftValues]);
  const canApplyFilters = Object.keys(invalidFilterKeys).length === 0;
  const canClearFilters = Object.keys(cleanedDraftValues).length > 0 || Object.keys(invalidFilterKeys).length > 0;

  const clearAll = () => {
    if (!canClearFilters) return;

    setDraftValues({});
    setInvalidFilterKeys({});
    setResetKey(current => current + 1);
    onApply({});
  };

  const applyFilters = () => {
    if (!canApplyFilters) return;

    onApply(cleanedDraftValues);
    closeAllModals();
  };

  return {
    applyFilters,
    canApplyFilters,
    canClearFilters,
    chips,
    clearAll,
    draftValues,
    resetKey,
    selectedConfig,
    selectedKey,
    setFilterValue,
    setFilterValidity,
    setSelectedKey,
  };
}

function getInitialSelectedKey(configs: FilterConfig[], values: FilterValues) {
  const activeConfig = configs.find(config => values[config.key] != null);
  return activeConfig?.key ?? configs[0]?.key ?? "";
}
