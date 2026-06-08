import { useMemo } from "react";
import { FilterConfig, useFilterController } from "@shared/components/Filters";
import { OperationItem } from "../mocks/palletMock";

type UseOperationListFiltersParams = {
  data: OperationItem[];
  modalTitle: string;
};

export function useOperationListFilters({ data, modalTitle }: UseOperationListFiltersParams) {
  const statusOptions = useMemo(
    () => uniqueOptions(data.map(item => item.status)),
    [data],
  );
  const clientOptions = useMemo(
    () => uniqueOptions(data.map(item => item.client)),
    [data],
  );

  const configs = useMemo<FilterConfig<OperationItem>[]>(
    () => [
      {
        key: "doneAt",
        label: "Data",
        type: "date",
        mode: "range",
        getItemValue: item => item.doneAt,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        multiple: true,
        options: statusOptions,
        placeholder: "Selecione o status",
        getItemValue: item => item.status,
      },
      {
        key: "client",
        label: "Cliente",
        type: "select",
        multiple: true,
        options: clientOptions,
        placeholder: "Selecione o cliente",
        getItemValue: item => item.client,
      },
      {
        key: "totalPallets",
        label: "Total de pallets",
        type: "numberRange",
        getItemValue: item => item.totalPallets,
      },
    ],
    [clientOptions, statusOptions],
  );

  return useFilterController({
    configs,
    data,
    modalTitle,
  });
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values)).map(value => ({ label: value, value }));
}
