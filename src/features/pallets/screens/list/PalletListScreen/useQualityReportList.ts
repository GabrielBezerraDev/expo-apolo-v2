import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import {
  DateFilterValue,
  FilterOptionValue,
  FilterValues,
  NumberRangeFilterValue,
} from "@shared/components/Filters";
import { useQualityReportApi } from "../../../services";
import { PalletReportType, QualityReportQueryParams } from "../../../protocol";

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
  const qualityReportApi = useQualityReportApi();
  const queryParams = useMemo(
    () => buildQualityReportQueryParams({ appliedFilters, batchSearch, page, pageSize, reportType }),
    [appliedFilters, batchSearch, page, pageSize, reportType],
  );

  return useQuery({
    queryKey: ["quality-report", queryParams],
    queryFn: () => qualityReportApi.getFilterQualityReport(queryParams),
    enabled: hasApiBaseUrl() && qualityReportApi.hasAuthToken,
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
