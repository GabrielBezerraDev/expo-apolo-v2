export type RoadmapHistoryChangeSocket = {
  description: string;
  palletIds?: number[];
  registerHistoryId: number;
  roadmapCode: string;
  roadmapId: number;
  statusRoadmap: string;
  typeOperation: "CREATE" | "UPDATE" | "DELETE" | string;
  typeRoadmap: "ENTRY" | "EXIT" | string;
  user?: {
    email?: string;
    id?: number;
    lastName?: string;
    name?: string;
  } | null;
  userId?: number;
};

export type PalletHistoryChangeSocket = {
  batch?: string;
  description: string;
  email?: string;
  id?: number;
  lastName?: string;
  name?: string;
  palletId?: number;
  source?: string | null;
  typeOperation: "CREATE" | "UPDATE" | "DELETE" | string;
  userId?: number;
};

export type PalletIncidentCreatedSocket = {
  changedPalletStageTo: "STORAGE" | "VALORLOG_ENTRY" | "VALORLOG_EXIT";
  createdAt: string;
  incidentDescription: string;
  incidentId: number;
  incidentStage: "WIP" | "STORAGE" | "VALORLOG_ENTRY";
  palletBatch: string;
  palletId: number;
  reportedBySRSUserName: string;
};
