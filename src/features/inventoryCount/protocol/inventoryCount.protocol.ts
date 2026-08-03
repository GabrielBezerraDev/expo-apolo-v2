export type InventoryCountStatus = "COMPLETED";

export type ParsedBinCode = {
  address: string;
  rawData: string;
};

export type ParsedMaterialCode = {
  expiresAt: string;
  labelId: string;
  lot: string;
  materialCode: string;
  printedAt: string;
  quantity: number;
  rawData: string;
};

export type ScannedMaterial = ParsedMaterialCode & {
  id: string;
  scannedAt: string;
};

export type ActiveInventoryBin = ParsedBinCode & {
  id: string;
  materials: ScannedMaterial[];
  startedAt: string;
};

export type CountedInventoryBin = ActiveInventoryBin & {
  completedAt: string;
};

export type InventoryCountDraft = {
  activeBin?: ActiveInventoryBin;
  bins: CountedInventoryBin[];
  id: string;
  startedAt: string;
};

export type InventoryCount = {
  bins: CountedInventoryBin[];
  completedAt: string;
  id: string;
  startedAt: string;
  status: InventoryCountStatus;
};
