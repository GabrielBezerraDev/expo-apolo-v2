import React from "react";
import { AppInput } from "@shared/components/Forms/AppInput";
import { TextFilterDefinition, TextFilterValue } from "../shared/types";
import { useTextFilterField } from "./useTextFilterField";

type Props = {
  definition: TextFilterDefinition<any>;
  value?: TextFilterValue;
  onChange: (value: TextFilterValue | undefined) => void;
};

export function TextFilterField({ definition, onChange, value }: Props) {
  const { handleChangeText } = useTextFilterField({ onChange });

  return (
    <AppInput
      label={definition.label}
      value={value ?? ""}
      onChangeText={handleChangeText}
      placeholder={definition.placeholder ?? "Digite para filtrar"}
    />
  );
}
