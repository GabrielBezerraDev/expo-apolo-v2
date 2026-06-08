import { useMemo } from "react";
import { FilterDefinition, useFilterController } from "@shared/components/Filters";
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

  const definitions = useMemo<FilterDefinition<PalletItem>[]>(
    () => [
      {
        key: "dateTime",
        label: "Data",
        type: "date",
        mode: "range",
        getItemValue: item => item.dateTime,
      },
      {
        key: "stage",
        label: "Estágio",
        type: "select",
        multiple: true,
        options: stageOptions,
        placeholder: "Selecione o estágio",
        getItemValue: item => item.stage,
      },
      {
        key: "line",
        label: "Linha",
        type: "select",
        multiple: true,
        options: lineOptions,
        placeholder: "Selecione a linha",
        getItemValue: item => item.line,
      },
      {
        key: "batch",
        label: "Batch",
        type: "text",
        placeholder: "Digite o batch",
        getItemValue: item => item.batch,
      },
      {
        key: "quantity",
        label: "Quantidade",
        type: "numberRange",
        getItemValue: item => item.quantity,
      },
    ],
    [lineOptions, stageOptions],
  );

  return useFilterController({
    data,
    definitions,
    modalHeightPercent: 72,
    modalTitle,
  });
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values)).map(value => ({ label: value, value }));
}
