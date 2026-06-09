import React from "react";
import { FilterChip } from "../shared/types";
import {
  FilterChipList,
  FilterChipRemoveButton,
  FilterChipRemoveText,
  FilterChipRoot,
  FilterChipScroll,
  FilterChipText,
} from "../shared/styled";

type Props = {
  chips: FilterChip[];
};

export function FilterChips({ chips }: Props) {
  if (chips.length === 0) return null;

  return (
    <FilterChipScroll horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false}>
      <FilterChipList>
        {chips.map(chip => (
          <FilterChipRoot key={chip.key}>
            <FilterChipText numberOfLines={1}>{chip.label}</FilterChipText>
            <FilterChipRemoveButton onPress={chip.onRemove} hitSlop={8}>
              <FilterChipRemoveText>x</FilterChipRemoveText>
            </FilterChipRemoveButton>
          </FilterChipRoot>
        ))}
      </FilterChipList>
    </FilterChipScroll>
  );
}
