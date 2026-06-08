import { useEffect, useMemo, useState } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { FilterDefinition, FilterValue, FilterValues } from "../shared/types";
import { buildFilterChips, cleanFilterValues } from "../shared/utils";

type UseFilterModalContentParams = {
  definitions: FilterDefinition<any>[];
  initialValues?: FilterValues;
  onApply: (values: FilterValues) => void;
};

export function useFilterModalContent({
  definitions,
  initialValues = {},
  onApply,
}: UseFilterModalContentParams) {
  const { closeAllModals } = useModal();
  const [draftValues, setDraftValues] = useState<FilterValues>(initialValues);
  const [resetKey, setResetKey] = useState(0);
  const [selectedKey, setSelectedKey] = useState(getInitialSelectedKey(definitions, initialValues));

  useEffect(() => {
    setDraftValues(initialValues);
    setSelectedKey(getInitialSelectedKey(definitions, initialValues));
  }, [definitions, initialValues]);

  const selectedDefinition = useMemo(
    () => definitions.find(definition => definition.key === selectedKey) ?? definitions[0],
    [definitions, selectedKey],
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
    () => buildFilterChips(definitions, draftValues, removeFilter),
    [definitions, draftValues],
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
    selectedDefinition,
    selectedKey,
    setFilterValue,
    setSelectedKey,
  };
}

function getInitialSelectedKey(definitions: FilterDefinition<any>[], values: FilterValues) {
  const activeDefinition = definitions.find(definition => values[definition.key] != null);
  return activeDefinition?.key ?? definitions[0]?.key ?? "";
}
