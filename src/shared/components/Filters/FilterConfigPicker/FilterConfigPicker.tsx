import React from "react";
import { FilterConfig } from "../shared/types";
import {
  FilterOptionButton,
  FilterOptionList,
  FilterOptionText,
  FilterPickerButton,
  FilterPickerRoot,
  FilterPickerText,
} from "../shared/styled";
import { useFilterConfigPicker } from "./useFilterConfigPicker";

type Props = {
  configs: FilterConfig[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function FilterConfigPicker({ configs, onSelect, selectedKey }: Props) {
  const { handleSelect, open, selectedConfig, toggleOpen } = useFilterConfigPicker({
    configs,
    onSelect,
    selectedKey,
  });

  return (
    <FilterPickerRoot>
      <FilterPickerButton onPress={toggleOpen} hitSlop={4}>
        <FilterPickerText>{selectedConfig?.label ?? "Selecione um filtro"}</FilterPickerText>
      </FilterPickerButton>

      {open ? (
        <FilterOptionList>
          {configs.map(config => (
            <FilterOptionButton
              key={config.key}
              selected={config.key === selectedKey}
              onPress={() => handleSelect(config.key)}
            >
              <FilterOptionText>{config.label}</FilterOptionText>
            </FilterOptionButton>
          ))}
        </FilterOptionList>
      ) : null}
    </FilterPickerRoot>
  );
}
