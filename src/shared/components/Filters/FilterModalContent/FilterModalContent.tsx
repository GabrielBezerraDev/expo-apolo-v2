import React from "react";
import { AppButton } from "@shared/components/Forms/AppButton";
import { FilterConfig, FilterValues } from "../shared/types";
import { FilterChips } from "../FilterChips";
import { FilterConfigPicker } from "../FilterConfigPicker";
import { FilterFieldRenderer } from "../FilterFieldRenderer";
import {
  FilterButtonRow,
  FilterButtonSlot,
  FilterHelpText,
  FilterModalRoot,
} from "../shared/styled";
import { useFilterModalContent } from "./useFilterModalContent";

type Props = {
  configs: FilterConfig[];
  initialValues?: FilterValues;
  onApply: (values: FilterValues) => void;
};

export function FilterModalContent({ configs, initialValues, onApply }: Props) {
  const {
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
  } = useFilterModalContent({ configs, initialValues, onApply });

  const handleSelectedFilterValidityChange = React.useCallback(
    (isValid: boolean) => {
      if (!selectedConfig) return;

      setFilterValidity(selectedConfig.key, isValid);
    },
    [selectedConfig, setFilterValidity],
  );

  if (!selectedConfig) {
    return <FilterHelpText>Nenhum filtro configurado.</FilterHelpText>;
  }

  return (
    <FilterModalRoot>
      <FilterConfigPicker
        configs={configs}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />

      <FilterFieldRenderer
        config={selectedConfig}
        resetKey={resetKey}
        value={draftValues[selectedConfig.key]}
        onChange={value => setFilterValue(selectedConfig.key, value)}
        onValidityChange={handleSelectedFilterValidityChange}
      />

      <FilterChips chips={chips} />

      <FilterButtonRow>
        <FilterButtonSlot>
          <AppButton title="Limpar" variant="outline" disabled={!canClearFilters} onPress={clearAll} />
        </FilterButtonSlot>
        <FilterButtonSlot>
          <AppButton title="Filtrar" disabled={!canApplyFilters} onPress={applyFilters} />
        </FilterButtonSlot>
      </FilterButtonRow>
    </FilterModalRoot>
  );
}
