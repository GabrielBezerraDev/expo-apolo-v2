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
  FormScreenPallet: undefined;
  PalletsEvidence: undefined;
  ExitExtraEvidence: undefined;
  PalletOperationSummary: { operationId: string };
  PalletHistory: { batch?: string; palletId: number };
  PalletPhotos: { batch?: string; palletId: number };
  OfflineSyncReview: undefined;
  RoadmapPhotos: { roadmap: Roadmap };
  OperationSuccess: { operation: 'entry' | 'exit' };
};
