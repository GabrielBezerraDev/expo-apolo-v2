import { useMemo, useState } from "react";
import { FilterDefinition } from "../shared/types";

type UseFilterDefinitionPickerParams = {
  definitions: FilterDefinition<any>[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function useFilterDefinitionPicker({
  definitions,
  onSelect,
  selectedKey,
}: UseFilterDefinitionPickerParams) {
  const [open, setOpen] = useState(false);
  const selectedDefinition = useMemo(
    () => definitions.find(definition => definition.key === selectedKey) ?? definitions[0],
    [definitions, selectedKey],
  );

  const toggleOpen = () => setOpen(current => !current);

  const handleSelect = (key: string) => {
    onSelect(key);
    setOpen(false);
  };

  return {
    handleSelect,
    open,
    selectedDefinition,
    toggleOpen,
  };
}
