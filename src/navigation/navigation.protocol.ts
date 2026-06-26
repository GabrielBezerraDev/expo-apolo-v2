import type { Roadmap } from "@features/pallets/protocol";

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabsParamList = {
  EntryList: undefined;
  ExitList: undefined;
  PalletList: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Scanner: undefined;
  FormScreenRoadmap: undefined;
  PalletsEvidence: undefined;
  ExitExtraEvidence: undefined;
  PalletOperationSummary: { operationId: string };
  PalletHistory: { batch?: string; palletId: number };
  PalletPhotos: { batch?: string; palletId: number };
  RoadmapPhotos: { roadmap: Roadmap };
  OperationSuccess: { operation: 'entry' | 'exit'; syncStatus?: "pending" | "synced" };
  OperationSyncError: { operationId: string };
};
