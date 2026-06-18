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
