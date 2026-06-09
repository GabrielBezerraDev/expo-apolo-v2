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
  ShipGoods: undefined;
  ExitExtraEvidence: undefined;
  PalletOperationSummary: { operationId: string };
  OperationSuccess: { operation: 'entry' | 'exit' };
};
