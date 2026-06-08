import { useMemo } from "react";
import { FilterConfig, useFilterController } from "@shared/components/Filters";
import { QualityReport } from "../types/qualityReport";

type UsePalletListFiltersParams = {
  reports: QualityReport[];
  modalTitle: string;
};

const stageOptions = [
  { label: "WIP", value: "WIP" },
  { label: "Qualidade", value: "PACKAGING" },
  { label: "Expedição", value: "STORAGE" },
  { label: "Finalizado", value: "FINISHED" },
  { label: "Retorno Produção", value: "PACKAGING_FOR_REVIEW" },
  { label: "Retorno Apontamento", value: "WIP_FOR_REVIEW" },
];

export function usePalletListFilters({ modalTitle, reports }: UsePalletListFiltersParams) {
  const lineOptions = useMemo(
    () => uniqueLineOptions(reports),
    [reports],
  );

  const configs = useMemo<FilterConfig[]>(
    () => [
      {
        key: "dateFilter",
        label: "Data",
        type: "date",
        mode: "range",
      },
      {
        key: "currentStage",
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
        key: "rangeFilter",
        label: "Quantidade",
        type: "numberRange",
      },
    ],
    [lineOptions],
  );

  return useFilterController({
    configs,
    modalHeightPercent: 72,
    modalTitle,
  });
}

function uniqueLineOptions(reports: QualityReport[]) {
  const lineMap = new Map<number, string>();

  reports.forEach(report => {
    const lineId = report.pallet?.lineId;
    if (!lineId) return;

    lineMap.set(lineId, report.pallet.lineName ?? `Linha ${lineId}`);
  });

  return Array.from(lineMap.entries()).map(([value, label]) => ({ label, value }));
}
