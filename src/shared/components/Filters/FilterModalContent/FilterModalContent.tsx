import React from "react";
import { AppButton } from "@shared/components/Forms/AppButton";
import { FilterDefinition, FilterValues } from "../shared/types";
import { FilterChips } from "../FilterChips";
import { FilterDefinitionPicker } from "../FilterDefinitionPicker";
import { FilterFieldRenderer } from "../FilterFieldRenderer";
import {
  FilterButtonRow,
  FilterButtonSlot,
  FilterHelpText,
  FilterModalRoot,
} from "../shared/styled";
import { useFilterModalContent } from "./useFilterModalContent";

type Props = {
  definitions: FilterDefinition<any>[];
  initialValues?: FilterValues;
  onApply: (values: FilterValues) => void;
};

export function FilterModalContent({ definitions, initialValues, onApply }: Props) {
  const {
    applyFilters,
    chips,
    clearAll,
    draftValues,
    resetKey,
    selectedDefinition,
    selectedKey,
    setFilterValue,
    setSelectedKey,
  } = useFilterModalContent({ definitions, initialValues, onApply });

  if (!selectedDefinition) {
    return <FilterHelpText>Nenhum filtro configurado.</FilterHelpText>;
  }

  return (
    <FilterModalRoot>
      <FilterDefinitionPicker
        definitions={definitions}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />

      <FilterFieldRenderer
        definition={selectedDefinition}
        resetKey={resetKey}
        value={draftValues[selectedDefinition.key]}
        onChange={value => setFilterValue(selectedDefinition.key, value)}
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
