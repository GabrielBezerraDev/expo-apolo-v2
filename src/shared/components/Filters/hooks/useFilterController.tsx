import React, { useCallback, useMemo, useState } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { FilterModalContent } from "../FilterModalContent";
import { FilterConfig, FilterValues } from "../shared/types";
import { buildFilterChips, cleanFilterValues, filterData } from "../shared/utils";

type UseFilterControllerParams<TItem> = {
  data: TItem[];
  configs: FilterConfig<TItem>[];
  modalTitle: string;
  modalHeightPercent?: number;
};

export function useFilterController<TItem>({
  configs,
  data,
  modalHeightPercent = 68,
  modalTitle,
}: UseFilterControllerParams<TItem>) {
  const { openModal } = useModal();
  const [values, setValues] = useState<FilterValues>({});

  const removeFilter = useCallback((key: string) => {
    setValues(current => {
      const nextValues = { ...current };
      delete nextValues[key];
      return nextValues;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setValues({});
  }, []);

  const chips = useMemo(
    () => buildFilterChips(configs, values, removeFilter),
    [configs, removeFilter, values],
  );

  const filteredData = useMemo(
    () => filterData(data, configs, values),
    [data, configs, values],
  );

  const openFilterModal = useCallback(() => {
    openModal(
      <FilterModalContent
        configs={configs}
        initialValues={values}
        onApply={nextValues => setValues(cleanFilterValues(nextValues))}
      />,
      {
        title: modalTitle,
        heightPercent: modalHeightPercent,
        maxHeightPercent: 88,
        animationType: "slide",
        minHeight:0
      },
    );
  }, [configs, modalHeightPercent, modalTitle, openModal, values]);

  return {
    chips,
    clearFilters,
    filteredData,
    hasFilters: chips.length > 0,
    openFilterModal,
    removeFilter,
    values,
  };
}
