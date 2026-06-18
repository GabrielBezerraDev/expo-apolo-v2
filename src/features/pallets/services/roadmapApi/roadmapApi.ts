import { useMemo } from "react";
import { useApiClient } from "@shared/services/apiClient";
import type {
  Roadmap,
  RoadmapPalletValidationRequest,
  RoadmapPalletValidationResponse,
  RoadmapQueryParams,
  RoadmapResponse,
} from "../../protocol";

export type RoadmapApi = {
  finishRoadmap: (body: FormData) => Promise<Roadmap>;
  getFilterRoadmap: (params: RoadmapQueryParams) => Promise<RoadmapResponse>;
  hasAuthToken: boolean;
  roadmapExists: (roadmap: string) => Promise<boolean>;
  startRoadmap: (body: FormData) => Promise<Roadmap>;
  validatePallet: (body: RoadmapPalletValidationRequest) => Promise<RoadmapPalletValidationResponse>;
};

export function useRoadmapApi(): RoadmapApi {
  const apiClient = useApiClient();

  return useMemo(
    () => ({
      finishRoadmap: (body: FormData) =>
        apiClient.postFormData<Roadmap>("/roadmap/finish", { body }),
      getFilterRoadmap: (params: RoadmapQueryParams) =>
        apiClient.get<RoadmapResponse>("/roadmap/get-filter-roadmap", {
          query: params,
        }),
      hasAuthToken: apiClient.hasAuthToken,
      roadmapExists: async (roadmap: string) => {
        const normalizedRoadmap = roadmap.trim();
        if (!normalizedRoadmap) return false;

        const response = await apiClient.get<RoadmapResponse>("/roadmap/get-filter-roadmap", {
          query: {
            filterSearch: normalizedRoadmap,
            page: 1,
            pageSize: 100,
          },
        });

        return response.data.some(
          item => item.roadmap.trim().toLowerCase() === normalizedRoadmap.toLowerCase(),
        );
      },
      startRoadmap: (body: FormData) =>
        apiClient.postFormData<Roadmap>("/roadmap/start", { body }),
      validatePallet: (body: RoadmapPalletValidationRequest) =>
        apiClient.post<RoadmapPalletValidationResponse, RoadmapPalletValidationRequest>("/roadmap/validate-pallet", { body }),
    }),
    [apiClient],
  );
}
