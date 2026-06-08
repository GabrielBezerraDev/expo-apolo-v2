import { useEffect, useMemo, useState } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { FilterConfig, FilterValue, FilterValues } from "../shared/types";
import { buildFilterChips, cleanFilterValues } from "../shared/utils";

type UseFilterModalContentParams = {
  configs: FilterConfig<any>[];
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
  const [resetKey, setResetKey] = useState(0);
  const [selectedKey, setSelectedKey] = useState(getInitialSelectedKey(configs, initialValues));

  useEffect(() => {
    setDraftValues(initialValues);
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
        return nextValues;
      }

      nextValues[key] = value;
      return nextValues;
    });
  };

  const removeFilter = (key: string) => {
    setDraftValues(current => {
      const nextValues = { ...current };
      delete nextValues[key];
      return nextValues;
    });
    setResetKey(current => current + 1);
  };

  const chips = useMemo(
    () => buildFilterChips(configs, draftValues, removeFilter),
    [configs, draftValues],
  );

  const clearAll = () => {
    setDraftValues({});
    setResetKey(current => current + 1);
  };

  const applyFilters = () => {
    onApply(cleanFilterValues(draftValues));
    closeAllModals();
  };

  return {
    applyFilters,
    chips,
    clearAll,
    draftValues,
    resetKey,
    selectedConfig,
    selectedKey,
    setFilterValue,
    setSelectedKey,
  };
}

function getInitialSelectedKey(configs: FilterConfig<any>[], values: FilterValues) {
  const activeConfig = configs.find(config => values[config.key] != null);
  return activeConfig?.key ?? configs[0]?.key ?? "";
}
