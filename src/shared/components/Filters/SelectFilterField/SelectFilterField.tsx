import React from "react";
import { SelectFilterDefinition, SelectFilterValue } from "../shared/types";
import {
  FilterFieldRoot,
  FilterHelpText,
  FilterOptionButton,
  FilterOptionList,
  FilterOptionText,
  FilterPickerButton,
  FilterPickerText,
  SelectedOptionRow,
  SelectedOptionsRoot,
  SelectedOptionText,
  FilterChipRemoveButton,
  FilterChipRemoveText,
} from "../shared/styled";
import { useSelectFilterField } from "./useSelectFilterField";

type Props = {
  definition: SelectFilterDefinition<any>;
  value?: SelectFilterValue;
  onChange: (value: SelectFilterValue | undefined) => void;
};

export function SelectFilterField({ definition, onChange, value }: Props) {
  const {
    handleRemove,
    handleSelect,
    isSelected,
    open,
    selectedLabel,
    selectedOptions,
    toggleOpen,
  } = useSelectFilterField({ definition, onChange, value });

  return (
    <FilterFieldRoot>
      <FilterPickerButton onPress={toggleOpen} hitSlop={4}>
        <FilterPickerText>{selectedLabel}</FilterPickerText>
      </FilterPickerButton>

      {open ? (
        <FilterOptionList>
          {definition.options.map(option => (
            <FilterOptionButton
              key={String(option.value)}
              selected={isSelected(option.value)}
              onPress={() => handleSelect(option.value)}
            >
              <FilterOptionText>{option.label}</FilterOptionText>
            </FilterOptionButton>
          ))}
        </FilterOptionList>
      ) : null}

      {definition.multiple ? (
        <SelectedOptionsRoot>
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <SelectedOptionRow key={String(option.value)}>
                <SelectedOptionText numberOfLines={1}>{option.label}</SelectedOptionText>
                <FilterChipRemoveButton onPress={() => handleRemove(option.value)} hitSlop={8}>
                  <FilterChipRemoveText>x</FilterChipRemoveText>
                </FilterChipRemoveButton>
              </SelectedOptionRow>
            ))
          ) : (
            <FilterHelpText>Nenhum item selecionado.</FilterHelpText>
          )}
        </SelectedOptionsRoot>
      ) : null}
    </FilterFieldRoot>
  );
}
