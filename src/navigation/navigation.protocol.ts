import type { Roadmap } from "@features/pallets/types/roadmap";

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
  RoadmapPhotos: { roadmap: Roadmap };
  OperationSuccess: { operation: 'entry' | 'exit' };
};
