export type RoadmapType = "ENTRY" | "EXIT";
export type RoadmapStatus = "IN_PROGRESS" | "FINISHED";

export type RoadmapPallet = {
  id: number;
  palletId: number;
  roadmapId: number;
  typeRoadmap: RoadmapType;
  pallet?: {
    batch?: string;
    currentStage?: string;
    id: number;
    line?: { name?: string };
    lineId?: number;
    quantity?: number;
    variant?: string;
  };
};

export type Roadmap = {
  createdAt: string;
  exitEvidencePhotos?: Record<string, string> | null;
  id: number;
  pallets: RoadmapPallet[];
  palletsQuantity: number;
  photosPallets?: unknown;
  roadmap: string;
  statusRoadmap: RoadmapStatus;
  typeRoadmap: RoadmapType;
  updatedAt: string;
};

export type RoadmapResponse = {
  data: Roadmap[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type RoadmapQueryParams = {
  dateFilter?: {
    endDate?: string;
    initDate?: string;
  };
  filterSearch?: string;
  page: number;
  pageSize: number;
  statusRoadmap?: RoadmapStatus | string;
  typeRoadmap?: RoadmapType | "VALORLOG_ENTRY" | "VALORLOG_EXIT";
};
