import { useMemo } from "react";
import { useApiClient } from "@shared/services/apiClient";
import type {
  PalletChangeHistory,
  PalletPhotosByStageResponse,
  QualityReportPallet,
} from "../../protocol";

export type PalletApi = {
  getPalletById: (id: number) => Promise<QualityReportPallet>;
  getPalletHistoryByPalletId: (id: number) => Promise<PalletChangeHistory[]>;
  getPalletPhotosByStage: (id: number) => Promise<PalletPhotosByStageResponse>;
  hasAuthToken: boolean;
};

export function usePalletApi(): PalletApi {
  const apiClient = useApiClient();

  return useMemo(
    () => ({
      getPalletById: (id: number) => apiClient.get<QualityReportPallet>(`/pallets/${id}`),
      getPalletHistoryByPalletId: (id: number) =>
        apiClient.get<PalletChangeHistory[]>(`/pallet-change-history-by-pallet-id/${id}`),
      getPalletPhotosByStage: (id: number) =>
        apiClient.get<PalletPhotosByStageResponse>(`/pallets/${id}/photos-by-stage`),
      hasAuthToken: apiClient.hasAuthToken,
    }),
    [apiClient],
  );
}
