import { useMemo } from "react";
import { FilterConfig, useFilterController } from "@shared/components/Filters";

type UseOperationListFiltersParams = {
  modalTitle: string;
};

export function useOperationListFilters({ modalTitle }: UseOperationListFiltersParams) {
  const configs = useMemo<FilterConfig[]>(
    () => [
      {
        key: "dateFilter",
        label: "Data",
        type: "date",
        mode: "range",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        multiple: true,
        options: [
          { label: "Em progresso", value: "IN_PROGRESS" },
          { label: "Finalizado", value: "FINISHED" },
        ],
        placeholder: "Selecione o status",
      },
    ],
    [],
  );

  return useFilterController({
    configs,
    modalTitle,
  });
}
