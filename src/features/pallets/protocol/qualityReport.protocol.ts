export type PalletReportType = "releasedPallet" | "onHoldPallet" | "lockedPallet";

export type PalletStage =
  | "WIP"
  | "PRODUCTION"
  | "PACKAGING"
  | "STORAGE"
  | "STOREKEEPER"
  | "PACKAGING_FOR_REVIEW"
  | "PRODUCTION_FOR_REVIEW"
  | "WIP_FOR_REVIEW"
  | "FINISHED"
  | "TO_VALORLOG"
  | "VALORLOG_ENTRY"
  | "VALORLOG_EXIT";

export type QualityReportPallet = {
  id?: number;
  batch?: string;
  createdAt?: string;
  currentStage?: PalletStage | string;
  lineId?: number;
  lineName?: string;
  quantity?: number;
  variant?: string;
};

export type QualityReport = {
  id: number;
  date?: string;
  firstBox?: number | string;
  holdReason?: string;
  issue?: string;
  lastBox?: number | string;
  observation?: string;
  pallet: QualityReportPallet;
  status?: string;
};

export type QualityReportResponse = {
  data: QualityReport[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type QualityReportQueryParams = {
  currentStage?: string;
  dateFilter?: {
    initDate?: string;
    endDate?: string;
  };
  filterSearch?: string;
  line?: string;
  page: number;
  pageSize: number;
  palletType: PalletReportType;
  rangeFilter?: {
    initValue?: string;
    endValue?: string;
  };
};
