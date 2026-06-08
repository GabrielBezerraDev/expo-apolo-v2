import { apiGet } from "@shared/services/apiClient";
import { QualityReportQueryParams, QualityReportResponse } from "../types/qualityReport";

export function getFilterQualityReport(params: QualityReportQueryParams, token?: string) {
  return apiGet<QualityReportResponse>("/quality-report/get-filter-quality-report", {
    query: params,
    token,
  });
}
