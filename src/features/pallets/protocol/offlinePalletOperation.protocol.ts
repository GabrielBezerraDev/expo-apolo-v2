export type OfflinePalletOperationType = "entry" | "exit";

export type OfflinePalletOperationStatus =
  | "draft"
  | "pending_sync"
  | "syncing"
  | "synced"
  | "failed"
  | "validation_failed";

export type OfflinePalletOperationStep =
  | "form"
  | "pallets_evidence"
  | "ship_goods"
  | "exit_extra_evidence"
  | "completed";

export type OfflinePalletFormData = {
  palletsQuantity?: string;
  roadmap?: string;
};

export type OfflinePalletEvidenceItem = {
  batch: string;
  palletIndex: number;
  photos: string[];
};

export type OfflinePalletEvidenceData = {
  pallets: OfflinePalletEvidenceItem[];
};

export type OfflineShipGoodsData = {
  truck?: string | null;
};

export type OfflineExitExtraEvidenceData = {
  licensePlate?: string | null;
  seal?: string | null;
};

export type OfflineValidationIssue = {
  batch?: string;
  field?: "batch" | "licensePlate" | "palletsQuantity" | "photos" | "roadmap" | "seal" | "truck";
  message: string;
  palletIndex?: number;
  stage: OfflinePalletOperationStep;
};

export type OfflinePalletOperation = {
  createdAt: string;
  currentStep: OfflinePalletOperationStep;
  exitExtraEvidenceData?: OfflineExitExtraEvidenceData;
  formData?: OfflinePalletFormData;
  id: string;
  lastError?: string | null;
  lastModifiedUserId?: number | null;
  operationType: OfflinePalletOperationType;
  palletEvidenceData?: OfflinePalletEvidenceData;
  roadmap?: string | null;
  shipGoodsData?: OfflineShipGoodsData;
  status: OfflinePalletOperationStatus;
  updatedAt: string;
  validationIssues?: OfflineValidationIssue[];
};

export type OfflinePalletOperationPatch = Partial<
  Pick<
    OfflinePalletOperation,
    | "currentStep"
    | "exitExtraEvidenceData"
    | "formData"
    | "lastError"
    | "lastModifiedUserId"
    | "palletEvidenceData"
    | "roadmap"
    | "shipGoodsData"
    | "status"
    | "validationIssues"
  >
> & {
  id?: string;
  operationType: OfflinePalletOperationType;
};

export type OfflinePalletOperationSummaryStatus = "complete" | "pending" | "not_started";

export type OfflinePalletOperationSummaryItem = {
  label: string;
  status: OfflinePalletOperationSummaryStatus;
  thumbnailUri?: string;
  value?: string;
};

export type OfflinePalletOperationSummarySection = {
  items: OfflinePalletOperationSummaryItem[];
  status: OfflinePalletOperationSummaryStatus;
  title: string;
};

export type OfflinePalletOperationSummary = {
  completedSteps: number;
  nextStep?: OfflinePalletOperationStep;
  operation: OfflinePalletOperation;
  progressLabel: string;
  sections: OfflinePalletOperationSummarySection[];
  totalSteps: number;
};
