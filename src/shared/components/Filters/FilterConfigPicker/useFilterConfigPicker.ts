import { useMemo, useState } from "react";
import { FilterConfig } from "../shared/types";

type UseFilterConfigPickerParams = {
  configs: FilterConfig<any>[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function useFilterConfigPicker({
  configs,
  onSelect,
  selectedKey,
}: UseFilterConfigPickerParams) {
  const [open, setOpen] = useState(false);
  const selectedConfig = useMemo(
    () => configs.find(config => config.key === selectedKey) ?? configs[0],
    [configs, selectedKey],
  );

  const toggleOpen = () => setOpen(current => !current);

  const handleSelect = (key: string) => {
    onSelect(key);
    setOpen(false);
  };

  return {
    handleSelect,
    open,
    selectedConfig,
    toggleOpen,
  };
}
