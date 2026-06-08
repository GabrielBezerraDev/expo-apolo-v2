import { useMemo } from "react";
import { FilterConfig, useFilterController } from "@shared/components/Filters";
import { PalletItem } from "../mocks/palletMock";

type UsePalletListFiltersParams = {
  data: PalletItem[];
  modalTitle: string;
};

export function usePalletListFilters({ data, modalTitle }: UsePalletListFiltersParams) {
  const stageOptions = useMemo(
    () => uniqueOptions(data.map(item => item.stage)),
    [data],
  );
  const lineOptions = useMemo(
    () => uniqueOptions(data.map(item => item.line)),
    [data],
  );

  const configs = useMemo<FilterConfig[]>(
    () => [
      {
        key: "dateTime",
        label: "Data",
        type: "date",
        mode: "range",
      },
      {
        key: "stage",
        label: "Estágio",
        type: "select",
        multiple: true,
        options: stageOptions,
        placeholder: "Selecione o estágio",
      },
      {
        key: "line",
        label: "Linha",
        type: "select",
        multiple: true,
        options: lineOptions,
        placeholder: "Selecione a linha",
      },
      {
        key: "batch",
        label: "Batch",
        type: "text",
        placeholder: "Digite o batch",
      },
      {
        key: "quantity",
        label: "Quantidade",
        type: "numberRange",
      },
    ],
    [lineOptions, stageOptions],
  );

  return useFilterController({
    configs,
    modalHeightPercent: 72,
    modalTitle,
  });
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values)).map(value => ({ label: value, value }));
}
