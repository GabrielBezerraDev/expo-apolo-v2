import { useMemo, useState } from "react";
import { FilterOptionValue, SelectFilterConfig, SelectFilterValue } from "../shared/types";

type UseSelectFilterFieldParams = {
  config: SelectFilterConfig<any>;
  value?: SelectFilterValue;
  onChange: (value: SelectFilterValue | undefined) => void;
};

export function useSelectFilterField({ config, onChange, value }: UseSelectFilterFieldParams) {
  const [open, setOpen] = useState(false);
  const selectedValues = useMemo(() => {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const selectedOptions = useMemo(
    () => config.options.filter(option => selectedValues.includes(option.value)),
    [config.options, selectedValues],
  );

  const selectedLabel = useMemo(() => {
    if (selectedOptions.length === 0) return config.placeholder ?? "Selecione";
    if (config.multiple) return `${selectedOptions.length} selecionado(s)`;
    return selectedOptions[0]?.label ?? config.placeholder ?? "Selecione";
  }, [config.multiple, config.placeholder, selectedOptions]);

  const toggleOpen = () => setOpen(current => !current);

  const handleSelect = (optionValue: FilterOptionValue) => {
    if (!config.multiple) {
      onChange(optionValue);
      setOpen(false);
      return;
    }

    const nextValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(valueItem => valueItem !== optionValue)
      : [...selectedValues, optionValue];

    onChange(nextValues.length > 0 ? nextValues : undefined);
  };

  const handleRemove = (optionValue: FilterOptionValue) => {
    const nextValues = selectedValues.filter(valueItem => valueItem !== optionValue);
    onChange(nextValues.length > 0 ? nextValues : undefined);
  };

  const isSelected = (optionValue: FilterOptionValue) => selectedValues.includes(optionValue);

  return {
    handleRemove,
    handleSelect,
    isSelected,
    open,
    selectedLabel,
    selectedOptions,
    toggleOpen,
  };
}
