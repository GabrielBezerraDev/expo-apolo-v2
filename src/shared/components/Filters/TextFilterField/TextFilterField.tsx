import React from "react";
import { AppInput } from "@shared/components/Forms/AppInput";
import { TextFilterConfig, TextFilterValue } from "../shared/types";
import { useTextFilterField } from "./useTextFilterField";

type Props = {
  config: TextFilterConfig<any>;
  value?: TextFilterValue;
  onChange: (value: TextFilterValue | undefined) => void;
};

export function TextFilterField({ config, onChange, value }: Props) {
  const { handleChangeText } = useTextFilterField({ onChange });

  return (
    <AppInput
      label={config.label}
      value={value ?? ""}
      onChangeText={handleChangeText}
      placeholder={config.placeholder ?? "Digite para filtrar"}
    />
  );
}
