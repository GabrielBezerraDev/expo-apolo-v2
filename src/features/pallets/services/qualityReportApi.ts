import { useMemo } from "react";
import { useApiClient } from "@shared/services/apiClient";
import { QualityReportQueryParams, QualityReportResponse } from "../types/qualityReport";

export type QualityReportApi = {
  getFilterQualityReport: (params: QualityReportQueryParams) => Promise<QualityReportResponse>;
  hasAuthToken: boolean;
};

export function useQualityReportApi(): QualityReportApi {
  const apiClient = useApiClient();

  return useMemo(
    () => ({
      getFilterQualityReport: (params: QualityReportQueryParams) =>
        apiClient.get<QualityReportResponse>("/quality-report/get-filter-quality-report", {
          query: params,
        }),
      hasAuthToken: apiClient.hasAuthToken,
    }),
    [apiClient],
  );
}
