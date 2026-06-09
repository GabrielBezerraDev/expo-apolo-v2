import React from "react";
import { SelectFilterConfig, SelectFilterValue } from "../shared/types";
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
  config: SelectFilterConfig;
  value?: SelectFilterValue;
  onChange: (value: SelectFilterValue | undefined) => void;
};

export function SelectFilterField({ config, onChange, value }: Props) {
  const {
    handleRemove,
    handleSelect,
    isSelected,
    open,
    selectedLabel,
    selectedOptions,
    toggleOpen,
  } = useSelectFilterField({ config, onChange, value });

  return (
    <FilterFieldRoot>
      <FilterPickerButton onPress={toggleOpen} hitSlop={4}>
        <FilterPickerText>{selectedLabel}</FilterPickerText>
      </FilterPickerButton>

      {open ? (
        <FilterOptionList>
          {config.options.map(option => (
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

      {config.multiple ? (
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
