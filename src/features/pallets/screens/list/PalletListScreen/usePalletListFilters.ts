import { useMemo } from "react";
import { FilterConfig, useFilterController } from "@shared/components/Filters";
import { QualityReport } from "../../../protocol";
import { getPalletStageLabel } from "../../../utils";

type UsePalletListFiltersParams = {
  reports: QualityReport[];
  modalTitle: string;
};

const stageOptions = [
  "WIP",
  "STORAGE",
  "FINISHED",
  "TO_VALORLOG",
  "VALORLOG_ENTRY",
  "VALORLOG_EXIT",
].map(value => ({ label: getPalletStageLabel(value), value }));

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
    const lineId = report.pallet?.line?.id ?? report.pallet?.lineId;
    if (lineId == null) return;

    lineMap.set(lineId, report.pallet?.line?.name ?? `Linha ${lineId}`);
  });

  return Array.from(lineMap.entries()).map(([value, label]) => ({ label, value }));
}
