import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import { DateFilterValue, FilterOptionValue, FilterValues } from "@shared/components/Filters";
import { useRoadmapApi } from "../../../services/roadmapApi";
import type { RoadmapQueryParams, RoadmapType } from "../../../protocol";

type UseRoadmapListParams = {
  appliedFilters: FilterValues;
  filterSearch?: string;
  page: number;
  pageSize: number;
  typeRoadmap: RoadmapType;
};

export function useRoadmapList({ appliedFilters, filterSearch, page, pageSize, typeRoadmap }: UseRoadmapListParams) {
  const roadmapApi = useRoadmapApi();
  const queryParams = useMemo(
    () => buildRoadmapQueryParams({ appliedFilters, filterSearch, page, pageSize, typeRoadmap }),
    [appliedFilters, filterSearch, page, pageSize, typeRoadmap],
  );

  return useQuery({
    queryKey: ["roadmap", queryParams],
    queryFn: () => roadmapApi.getFilterRoadmap(queryParams),
    enabled: hasApiBaseUrl() && roadmapApi.hasAuthToken,
  });
}

function buildRoadmapQueryParams({
  appliedFilters,
  filterSearch,
  page,
  pageSize,
  typeRoadmap,
}: UseRoadmapListParams): RoadmapQueryParams {
  const dateFilter = appliedFilters.dateFilter as DateFilterValue | undefined;

  return {
    dateFilter: dateFilter?.startDate && dateFilter.endDate
      ? { initDate: dateFilter.startDate, endDate: dateFilter.endDate }
      : undefined,
    filterSearch: filterSearch?.trim() || undefined,
    page,
    pageSize,
    statusRoadmap: valuesToCsv(appliedFilters.status),
    typeRoadmap,
  };
}

function valuesToCsv(value: FilterValues[string]) {
  if (Array.isArray(value)) return value.map(String).join(",");
  if (typeof value === "string" || typeof value === "number") return String(value as FilterOptionValue);
  return undefined;
}
