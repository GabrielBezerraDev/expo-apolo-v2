import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@navigation/AuthSessionContext";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import {
  DateFilterValue,
  FilterOptionValue,
  FilterValues,
  NumberRangeFilterValue,
} from "@shared/components/Filters";
import { getFilterQualityReport } from "../services/qualityReportApi";
import { PalletReportType, QualityReportQueryParams } from "../types/qualityReport";

type UseQualityReportListParams = {
  appliedFilters: FilterValues;
  batchSearch?: string;
  page: number;
  pageSize: number;
  reportType: PalletReportType;
};

export function useQualityReportList({
  appliedFilters,
  batchSearch,
  page,
  pageSize,
  reportType,
}: UseQualityReportListParams) {
  const { token } = useAuthSession();
  const queryParams = useMemo(
    () => buildQualityReportQueryParams({ appliedFilters, batchSearch, page, pageSize, reportType }),
    [appliedFilters, batchSearch, page, pageSize, reportType],
  );

  return useQuery({
    queryKey: ["quality-report", queryParams],
    queryFn: () => getFilterQualityReport(queryParams, token),
    enabled: hasApiBaseUrl(),
  });
}

type BuildQualityReportQueryParamsParams = {
  appliedFilters: FilterValues;
  batchSearch?: string;
  page: number;
  pageSize: number;
  reportType: PalletReportType;
};

function buildQualityReportQueryParams({
  appliedFilters,
  batchSearch,
  page,
  pageSize,
  reportType,
}: BuildQualityReportQueryParamsParams): QualityReportQueryParams {
  const dateFilter = appliedFilters.dateFilter as DateFilterValue | undefined;
  const rangeFilter = appliedFilters.rangeFilter as NumberRangeFilterValue | undefined;

  return {
    currentStage: valuesToCsv(appliedFilters.currentStage),
    dateFilter: dateFilter?.startDate && dateFilter.endDate
      ? { initDate: dateFilter.startDate, endDate: dateFilter.endDate }
      : undefined,
    filterSearch: batchSearch?.trim() || undefined,
    line: valuesToCsv(appliedFilters.line),
    page,
    pageSize,
    palletType: reportType,
    rangeFilter: rangeFilter?.startValue && rangeFilter.endValue
      ? { initValue: rangeFilter.startValue, endValue: rangeFilter.endValue }
      : undefined,
  };
}

function valuesToCsv(value: FilterValues[string]) {
  if (Array.isArray(value)) return value.map(String).join(",");
  if (typeof value === "string" || typeof value === "number") return String(value as FilterOptionValue);
  return undefined;
}
