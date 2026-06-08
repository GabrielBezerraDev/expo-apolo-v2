import React from "react";
import { FilterDefinition } from "../shared/types";
import {
  FilterOptionButton,
  FilterOptionList,
  FilterOptionText,
  FilterPickerButton,
  FilterPickerRoot,
  FilterPickerText,
} from "../shared/styled";
import { useFilterDefinitionPicker } from "./useFilterDefinitionPicker";

type Props = {
  definitions: FilterDefinition<any>[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function FilterDefinitionPicker({ definitions, onSelect, selectedKey }: Props) {
  const { handleSelect, open, selectedDefinition, toggleOpen } = useFilterDefinitionPicker({
    definitions,
    onSelect,
    selectedKey,
  });

  return (
    <FilterPickerRoot>
      <FilterPickerButton onPress={toggleOpen} hitSlop={4}>
        <FilterPickerText>{selectedDefinition?.label ?? "Selecione um filtro"}</FilterPickerText>
      </FilterPickerButton>

      {open ? (
        <FilterOptionList>
          {definitions.map(definition => (
            <FilterOptionButton
              key={definition.key}
              selected={definition.key === selectedKey}
              onPress={() => handleSelect(definition.key)}
            >
              <FilterOptionText>{definition.label}</FilterOptionText>
            </FilterOptionButton>
          ))}
        </FilterOptionList>
      ) : null}
    </FilterPickerRoot>
  );
}
