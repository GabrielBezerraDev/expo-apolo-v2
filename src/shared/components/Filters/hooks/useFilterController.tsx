import React, { useCallback, useMemo, useState } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { FilterModalContent } from "../FilterModalContent";
import { FilterConfig, FilterValues } from "../shared/types";
import { buildFilterChips, cleanFilterValues } from "../shared/utils";

type UseFilterControllerParams = {
  configs: FilterConfig[];
  initialValues?: FilterValues;
  modalTitle: string;
  modalHeightPercent?: number;
};

export function useFilterController({
  configs,
  initialValues = {},
  modalHeightPercent = 68,
  modalTitle,
}: UseFilterControllerParams) {
  const { openModal } = useModal();
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(initialValues);

  const removeFilter = useCallback((key: string) => {
    setAppliedFilters(current => {
      const nextValues = { ...current };
      delete nextValues[key];
      return nextValues;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setAppliedFilters({});
  }, []);

  const chips = useMemo(
    () => buildFilterChips(configs, appliedFilters, removeFilter),
    [appliedFilters, configs, removeFilter],
  );

  const openFilterModal = useCallback(() => {
    openModal(
      <FilterModalContent
        configs={configs}
        initialValues={appliedFilters}
        onApply={nextValues => setAppliedFilters(cleanFilterValues(nextValues))}
      />,
      {
        title: modalTitle,
        heightPercent: modalHeightPercent,
        maxHeightPercent: 88,
        animationType: "slide",
        minHeight:0
      },
    );
  }, [appliedFilters, configs, modalHeightPercent, modalTitle, openModal]);

  return {
    appliedFilters,
    chips,
    clearFilters,
    hasFilters: chips.length > 0,
    openFilterModal,
    removeFilter,
    setAppliedFilters,
  };
}
