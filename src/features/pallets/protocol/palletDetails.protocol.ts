import type { QualityReportPallet } from "./qualityReport.protocol";

export type PalletPhotoStage =
  | "WIP"
  | "STORAGE"
  | "VALORLOG_ENTRY"
  | "VALORLOG_EXIT";

export type PalletStagePhoto = {
  createdAt?: string;
  filePath: string;
  id: number | string;
  reportId?: number;
  roadmap?: string;
  roadmapId?: number;
  source?: "REPORT" | "ROADMAP" | string;
  stage: PalletPhotoStage | string;
};

export type PalletPhotosByStage = {
  label: string;
  photos: PalletStagePhoto[];
  stage: PalletPhotoStage;
};

export type PalletPhotosByStageResponse = {
  pallet: Required<Pick<QualityReportPallet, "id" | "batch">> & {
    currentStage: string;
    currentStageLabel: string;
  };
  stages: PalletPhotosByStage[];
  sticker: {
    filePath: string;
    id: number;
  } | null;
};

export type PalletChangeHistoryUser = {
  email?: string;
  id?: number;
  lastName?: string;
  name?: string;
};

export type PalletChangeHistory = {
  authorizedBy?: PalletChangeHistoryUser | null;
  createdAt: string;
  currentData?: Record<string, unknown> | null;
  description: string;
  fieldsChanged: string[];
  id: number;
  pallet?: QualityReportPallet | null;
  palletId: number;
  previousData?: Record<string, unknown> | null;
  tableName?: string;
  typeOperation: "CREATE" | "UPDATE" | "DELETE" | string;
  user?: PalletChangeHistoryUser | null;
};
