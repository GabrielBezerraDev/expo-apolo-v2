import type {
  DateFilterValue,
  FilterConfig,
  FilterValues,
  SelectFilterValue,
  TextFilterValue,
} from "@shared/components/Filters";
import { useFilterController } from "@shared/components/Filters";
import type { InventoryCount } from "../../protocol";

const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    multiple: true,
    options: [{ label: "Finalizada", value: "COMPLETED" }],
    placeholder: "Selecione o status",
    type: "select",
  },
  {
    endLabel: "Até",
    key: "completedAt",
    label: "Data de finalização",
    mode: "range",
    startLabel: "De",
    type: "date",
  },
  {
    key: "binAddress",
    label: "Bin",
    placeholder: "Ex.: A-07-01",
    type: "text",
  },
  {
    key: "materialCode",
    label: "Material",
    placeholder: "Ex.: JF3248SAM",
    type: "text",
  },
];

export function useInventoryCountFilters() {
  return useFilterController({
    configs: FILTER_CONFIGS,
    modalTitle: "Filtrar contagens",
  });
}

export function filterInventoryCounts(
  counts: InventoryCount[],
  filters: FilterValues,
) {
  const dateFilter = filters.completedAt as DateFilterValue | undefined;
  const statusFilter = filters.status as SelectFilterValue | undefined;
  const statuses = statusFilter == null
    ? []
    : Array.isArray(statusFilter)
      ? statusFilter
      : [statusFilter];
  const binAddress = normalizeFilterText(
    filters.binAddress as TextFilterValue | undefined,
  );
  const materialCode = normalizeFilterText(
    filters.materialCode as TextFilterValue | undefined,
  );

  return counts.filter(count => {
    const completionDate = toLocalDateValue(count.completedAt);
    if (dateFilter?.startDate && completionDate < dateFilter.startDate) {
      return false;
    }
    if (dateFilter?.endDate && completionDate > dateFilter.endDate) {
      return false;
    }
    if (statuses.length > 0 && !statuses.includes(count.status)) {
      return false;
    }
    if (
      binAddress &&
      !count.bins.some(bin => bin.address.toUpperCase().includes(binAddress))
    ) {
      return false;
    }
    if (
      materialCode &&
      !count.bins.some(bin =>
        bin.materials.some(material =>
          material.materialCode.toUpperCase().includes(materialCode),
        ),
      )
    ) {
      return false;
    }

    return true;
  });
}

function normalizeFilterText(value: string | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function toLocalDateValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
