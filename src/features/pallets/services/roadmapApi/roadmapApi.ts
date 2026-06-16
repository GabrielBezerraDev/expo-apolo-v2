import { useMemo } from "react";
import { useApiClient } from "@shared/services/apiClient";
import type { Roadmap, RoadmapQueryParams, RoadmapResponse } from "../../types/roadmap";

export type RoadmapApi = {
  finishRoadmap: (body: FormData) => Promise<Roadmap>;
  getFilterRoadmap: (params: RoadmapQueryParams) => Promise<RoadmapResponse>;
  hasAuthToken: boolean;
  startRoadmap: (body: FormData) => Promise<Roadmap>;
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
      startRoadmap: (body: FormData) =>
        apiClient.postFormData<Roadmap>("/roadmap/start", { body }),
    }),
    [apiClient],
  );
}
