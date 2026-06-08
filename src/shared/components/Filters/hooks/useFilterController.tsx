import React, { useCallback, useMemo, useState } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { FilterModalContent } from "../FilterModalContent";
import { FilterDefinition, FilterValues } from "../shared/types";
import { buildFilterChips, cleanFilterValues, filterData } from "../shared/utils";

type UseFilterControllerParams<TItem> = {
  data: TItem[];
  definitions: FilterDefinition<TItem>[];
  modalTitle: string;
  modalHeightPercent?: number;
};

export function useFilterController<TItem>({
  data,
  definitions,
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
    () => buildFilterChips(definitions, values, removeFilter),
    [definitions, removeFilter, values],
  );

  const filteredData = useMemo(
    () => filterData(data, definitions, values),
    [data, definitions, values],
  );

  const openFilterModal = useCallback(() => {
    openModal(
      <FilterModalContent
        definitions={definitions}
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
  }, [definitions, modalHeightPercent, modalTitle, openModal, values]);

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
