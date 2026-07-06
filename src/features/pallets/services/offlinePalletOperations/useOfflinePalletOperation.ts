import { useCallback } from "react";
import { useAuthSession } from "@shared/services/authSession";
import {
  OfflinePalletEvidenceData,
  OfflinePalletOperation,
  OfflinePalletOperationStep,
  OfflinePalletOperationStatus,
  OfflineValidationIssue,
} from "../../protocol";
import {
  getOfflinePalletOperation,
  upsertOfflinePalletOperation,
} from "./offlinePalletOperationsDatabase";
import {
  deletePalletOperationImage,
  savePalletOperationImage,
} from "../palletImageStorage";
import { PalletEvidenceItem, usePallet } from "../../providers/PalletProvider";

type SaveFormDraftParams = {
  currentStep?: OfflinePalletOperationStep;
  palletsQuantity?: string;
  roadmap?: string;
  status?: OfflinePalletOperationStatus;
};

type SavePalletEvidenceDraftParams = {
  currentStep?: OfflinePalletOperationStep;
  evidence?: PalletEvidenceItem[];
  status?: OfflinePalletOperationStatus;
};

type PersistPalletPhotoParams = {
  palletIndex: number;
  photoIndex: number;
  sourceUri: string;
};

type PersistOperationPhotoParams = {
  fileName: string;
  sourceUri: string;
  step: string;
};

type HydrateOperationByIdOptions = {
  clearInvalidFields?: boolean;
  reviewStage?: OfflinePalletOperationStep;
};

export function useOfflinePalletOperation() {
  const { userId } = useAuthSession();
  const {
    exitExtraEvidencePhotos,
    getValuesScreenRoadmap,
    hydrateOfflineOperation,
    offlineOperationId,
    operationPallet,
    palletEvidence,
    route,
    setExitExtraEvidencePhotos,
    setOfflineOperationId,
    setPalletEvidence,
    setShipGoodsPhotos,
    shipGoodsPhotos,
  } = usePallet();

  const saveFormDraft = useCallback(async ({
    currentStep = "form",
    palletsQuantity,
    roadmap,
    status = "draft",
  }: SaveFormDraftParams = {}) => {
    const resolvedRoadmap = roadmap ?? getValuesScreenRoadmap("roadmap") ?? route;
    const resolvedQuantity = palletsQuantity ?? getValuesScreenRoadmap("palletsQuantity") ?? "";

    if (!resolvedRoadmap.trim() && !offlineOperationId) return null;

    const operation = await upsertOfflinePalletOperation({
      currentStep,
      formData: {
        palletsQuantity: resolvedQuantity,
        roadmap: resolvedRoadmap,
      },
      id: offlineOperationId ?? undefined,
      lastModifiedUserId: userId,
      operationType: operationPallet,
      roadmap: resolvedRoadmap,
      status,
    });

    setOfflineOperationId(operation.id);
    if (operation.id !== offlineOperationId || operation.operationType !== operationPallet) {
      hydrateOfflineOperation(operation);
    }
    return operation;
  }, [getValuesScreenRoadmap, hydrateOfflineOperation, offlineOperationId, operationPallet, route, setOfflineOperationId, userId]);

  const savePalletEvidenceDraft = useCallback(async ({
    currentStep = "pallets_evidence",
    evidence = palletEvidence,
    status = "draft",
  }: SavePalletEvidenceDraftParams = {}) => {
    const operation = await ensureOperationExists(saveFormDraft);
    if (!operation) return null;

    const palletEvidenceData = mapPalletEvidence(evidence);
    const updated = await upsertOfflinePalletOperation({
      currentStep,
      id: operation.id,
      lastModifiedUserId: userId,
      operationType: operation.operationType,
      palletEvidenceData,
      roadmap: operation.roadmap,
      status,
    });

    setOfflineOperationId(updated.id);
    return updated;
  }, [palletEvidence, saveFormDraft, setOfflineOperationId, userId]);

  const persistPalletPhoto = useCallback(async ({ palletIndex, photoIndex, sourceUri }: PersistPalletPhotoParams) => {
    const operation = await ensureOperationExists(saveFormDraft);
    if (!operation) return sourceUri;
    const previousUri = palletEvidence[palletIndex]?.photos[photoIndex] ?? null;

    const localUri = await savePalletOperationImage({
      fileName: `pallet-${palletIndex + 1}-photo-${photoIndex + 1}`,
      operationId: operation.id,
      operationType: operation.operationType,
      roadmap: operation.roadmap,
      sourceUri,
      step: "pallets",
    });

    const nextEvidence = palletEvidence.map((pallet, index) => {
      if (index !== palletIndex) return pallet;

      return {
        ...pallet,
        photos: pallet.photos.map((photo, indexPhoto) => (indexPhoto === photoIndex ? localUri : photo)),
      };
    });

    setPalletEvidence(nextEvidence);
    await savePalletEvidenceDraft({ evidence: nextEvidence });
    await deletePalletOperationImage(previousUri);

    return localUri;
  }, [palletEvidence, saveFormDraft, savePalletEvidenceDraft, setPalletEvidence]);

  const persistOperationPhoto = useCallback(async ({ fileName, sourceUri, step }: PersistOperationPhotoParams) => {
    const operation = await ensureOperationExists(saveFormDraft);
    if (!operation) return sourceUri;

    return savePalletOperationImage({
      fileName,
      operationId: operation.id,
      operationType: operation.operationType,
      roadmap: operation.roadmap,
      sourceUri,
      step,
    });
  }, [saveFormDraft]);

  const saveShipGoodsDraft = useCallback(async ({
    currentStep = "exit_extra_evidence",
    truck = shipGoodsPhotos.truck,
    status = "draft",
  }: {
    currentStep?: OfflinePalletOperationStep;
    status?: OfflinePalletOperationStatus;
    truck?: string | null;
  } = {}) => {
    const operation = await ensureOperationExists(saveFormDraft);
    if (!operation) return null;

    const updated = await upsertOfflinePalletOperation({
      currentStep,
      id: operation.id,
      lastModifiedUserId: userId,
      operationType: operation.operationType,
      roadmap: operation.roadmap,
      shipGoodsData: { truck },
      status,
    });

    setOfflineOperationId(updated.id);
    return updated;
  }, [saveFormDraft, setOfflineOperationId, shipGoodsPhotos.truck, userId]);

  const persistShipGoodsPhoto = useCallback(async (sourceUri: string) => {
    const previousUri = shipGoodsPhotos.truck;
    const localUri = await persistOperationPhoto({ fileName: "truck", sourceUri, step: "exit-extra" });
    setShipGoodsPhotos({ truck: localUri });
    await saveShipGoodsDraft({ truck: localUri });
    await deletePalletOperationImage(previousUri);
    return localUri;
  }, [persistOperationPhoto, saveShipGoodsDraft, setShipGoodsPhotos, shipGoodsPhotos.truck]);

  const saveExitExtraEvidenceDraft = useCallback(async ({
    currentStep = "exit_extra_evidence",
    licensePlate = exitExtraEvidencePhotos.licensePlate,
    seal = exitExtraEvidencePhotos.seal,
    status = "draft",
  }: {
    currentStep?: OfflinePalletOperationStep;
    licensePlate?: string | null;
    seal?: string | null;
    status?: OfflinePalletOperationStatus;
  } = {}) => {
    const operation = await ensureOperationExists(saveFormDraft);
    if (!operation) return null;

    const updated = await upsertOfflinePalletOperation({
      currentStep,
      exitExtraEvidenceData: { licensePlate, seal },
      id: operation.id,
      lastModifiedUserId: userId,
      operationType: operation.operationType,
      roadmap: operation.roadmap,
      status,
    });

    setOfflineOperationId(updated.id);
    return updated;
  }, [exitExtraEvidencePhotos.licensePlate, exitExtraEvidencePhotos.seal, saveFormDraft, setOfflineOperationId, userId]);

  const persistExitExtraEvidencePhoto = useCallback(async (
    key: "licensePlate" | "seal",
    sourceUri: string,
  ) => {
    const previousUri = exitExtraEvidencePhotos[key];
    const localUri = await persistOperationPhoto({
      fileName: key === "licensePlate" ? "license-plate" : "seal",
      sourceUri,
      step: "exit-extra",
    });
    const next = { ...exitExtraEvidencePhotos, [key]: localUri };

    setExitExtraEvidencePhotos(next);
    await saveExitExtraEvidenceDraft(next);
    await deletePalletOperationImage(previousUri);

    return localUri;
  }, [exitExtraEvidencePhotos, persistOperationPhoto, saveExitExtraEvidenceDraft, setExitExtraEvidencePhotos]);

  const hydrateOperationById = useCallback(async (operationId: string, options: HydrateOperationByIdOptions = {}) => {
    const operation = await getOfflinePalletOperation(operationId);
    if (!operation) return null;

    const operationToHydrate = options.clearInvalidFields
      ? sanitizeOperationForReview(operation, options.reviewStage)
      : operation;

    hydrateOfflineOperation(operationToHydrate);
    return operationToHydrate;
  }, [hydrateOfflineOperation]);

  return {
    hydrateOperationById,
    persistExitExtraEvidencePhoto,
    persistPalletPhoto,
    persistShipGoodsPhoto,
    saveExitExtraEvidenceDraft,
    saveFormDraft,
    savePalletEvidenceDraft,
    saveShipGoodsDraft,
  };
}

async function ensureOperationExists(
  saveFormDraft: () => Promise<OfflinePalletOperation | null>,
) {
  return saveFormDraft();
}

function mapPalletEvidence(evidence: PalletEvidenceItem[]): OfflinePalletEvidenceData {
  return {
    pallets: evidence.map((pallet, palletIndex) => ({
      batch: pallet.batch,
      palletIndex,
      photos: pallet.photos,
    })),
  };
}

function sanitizeOperationForReview(
  operation: OfflinePalletOperation,
  reviewStage?: OfflinePalletOperationStep,
): OfflinePalletOperation {
  const issues = getReviewIssues(operation.validationIssues, reviewStage);
  if (issues.length === 0) return operation;

  const sanitizedOperation: OfflinePalletOperation = {
    ...operation,
    exitExtraEvidenceData: operation.exitExtraEvidenceData
      ? { ...operation.exitExtraEvidenceData }
      : undefined,
    formData: operation.formData ? { ...operation.formData } : undefined,
    palletEvidenceData: operation.palletEvidenceData
      ? {
          pallets: operation.palletEvidenceData.pallets.map(pallet => ({
            ...pallet,
            photos: [...pallet.photos],
          })),
        }
      : undefined,
    shipGoodsData: operation.shipGoodsData ? { ...operation.shipGoodsData } : undefined,
  };

  issues.forEach(issue => {
    clearInvalidField(sanitizedOperation, issue);
  });

  return sanitizedOperation;
}

function getReviewIssues(
  issues: OfflineValidationIssue[] | undefined,
  reviewStage?: OfflinePalletOperationStep,
) {
  if (!issues?.length) return [];
  if (!reviewStage) return issues;

  return issues.filter(issue => issue.stage === reviewStage);
}

function clearInvalidField(operation: OfflinePalletOperation, issue: OfflineValidationIssue) {
  if (!issue.field) {
    clearInvalidFieldFallback(operation, issue);
    return;
  }

  if (issue.field === "roadmap") {
    operation.formData = { ...operation.formData, roadmap: "" };
    operation.roadmap = "";
    return;
  }

  if (issue.field === "palletsQuantity") {
    operation.formData = { ...operation.formData, palletsQuantity: "" };
    return;
  }

  if (issue.field === "batch") {
    clearPalletBatch(operation, issue);
    return;
  }

  if (issue.field === "photos") {
    clearPalletPhotos(operation, issue);
    return;
  }

  if (issue.field === "truck") {
    operation.shipGoodsData = { ...operation.shipGoodsData, truck: null };
    return;
  }

  if (issue.field === "licensePlate") {
    operation.exitExtraEvidenceData = { ...operation.exitExtraEvidenceData, licensePlate: null };
    return;
  }

  if (issue.field === "seal") {
    operation.exitExtraEvidenceData = { ...operation.exitExtraEvidenceData, seal: null };
  }
}

function clearInvalidFieldFallback(operation: OfflinePalletOperation, issue: OfflineValidationIssue) {
  if (issue.stage === "form") {
    operation.formData = { ...operation.formData, roadmap: "" };
    operation.roadmap = "";
    return;
  }

  if (issue.stage === "pallets_evidence") {
    clearPalletBatch(operation, issue);
  }
}

function clearPalletBatch(operation: OfflinePalletOperation, issue: OfflineValidationIssue) {
  const pallets = operation.palletEvidenceData?.pallets;
  if (!pallets?.length) return;

  if (issue.palletIndex != null && pallets[issue.palletIndex]) {
    pallets[issue.palletIndex] = { ...pallets[issue.palletIndex], batch: "" };
    return;
  }

  if (issue.batch) {
    const normalizedBatch = normalizeBatch(issue.batch);
    operation.palletEvidenceData = {
      pallets: pallets.map(pallet => normalizeBatch(pallet.batch) === normalizedBatch
        ? { ...pallet, batch: "" }
        : pallet),
    };
  }
}

function clearPalletPhotos(operation: OfflinePalletOperation, issue: OfflineValidationIssue) {
  const pallets = operation.palletEvidenceData?.pallets;
  if (!pallets?.length || issue.palletIndex == null || !pallets[issue.palletIndex]) return;

  pallets[issue.palletIndex] = {
    ...pallets[issue.palletIndex],
    photos: Array.from({ length: 4 }, () => ""),
  };
}

function normalizeBatch(value: string) {
  return value.trim().toLowerCase();
}
