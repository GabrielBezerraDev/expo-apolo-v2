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
  configs: FilterConfig<any>[];
  initialValues?: FilterValues;
  onApply: (values: FilterValues) => void;
};

export function FilterModalContent({ configs, initialValues, onApply }: Props) {
  const {
    applyFilters,
    chips,
    clearAll,
    draftValues,
    resetKey,
    selectedConfig,
    selectedKey,
    setFilterValue,
    setSelectedKey,
  } = useFilterModalContent({ configs, initialValues, onApply });

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
      />

      <FilterChips chips={chips} />

      <FilterButtonRow>
        <FilterButtonSlot>
          <AppButton title="Limpar" variant="outline" onPress={clearAll} />
        </FilterButtonSlot>
        <FilterButtonSlot>
          <AppButton title="Filtrar" onPress={applyFilters} />
        </FilterButtonSlot>
      </FilterButtonRow>
    </FilterModalRoot>
  );
}
