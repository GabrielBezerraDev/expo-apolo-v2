import { useCallback } from "react";
import {
  OfflinePalletEvidenceData,
  OfflinePalletOperation,
  OfflinePalletOperationStep,
  OfflinePalletOperationStatus,
} from "../../types/offlinePalletOperation";
import {
  getOfflinePalletOperation,
  upsertOfflinePalletOperation,
} from "../../services/offlinePalletOperations";
import {
  deletePalletOperationImage,
  savePalletOperationImage,
} from "../../services/palletImageStorage";
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

export function useOfflinePalletOperation() {
  const {
    exitExtraEvidencePhotos,
    getValeusScreenPallet,
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
    const resolvedRoadmap = roadmap ?? getValeusScreenPallet("roadmap") ?? route;
    const resolvedQuantity = palletsQuantity ?? getValeusScreenPallet("palletsQuantity") ?? "";

    if (!resolvedRoadmap.trim() && !resolvedQuantity.trim() && !offlineOperationId) return null;

    const operation = await upsertOfflinePalletOperation({
      currentStep,
      formData: {
        palletsQuantity: resolvedQuantity,
        roadmap: resolvedRoadmap,
      },
      id: offlineOperationId ?? undefined,
      operationType: operationPallet,
      roadmap: resolvedRoadmap,
      status,
    });

    setOfflineOperationId(operation.id);
    if (operation.id !== offlineOperationId || operation.operationType !== operationPallet) {
      hydrateOfflineOperation(operation);
    }
    return operation;
  }, [getValeusScreenPallet, hydrateOfflineOperation, offlineOperationId, operationPallet, route, setOfflineOperationId]);

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
      operationType: operation.operationType,
      palletEvidenceData,
      roadmap: operation.roadmap,
      status,
    });

    setOfflineOperationId(updated.id);
    return updated;
  }, [palletEvidence, saveFormDraft, setOfflineOperationId]);

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
      operationType: operation.operationType,
      roadmap: operation.roadmap,
      shipGoodsData: { truck },
      status,
    });

    setOfflineOperationId(updated.id);
    return updated;
  }, [saveFormDraft, setOfflineOperationId, shipGoodsPhotos.truck]);

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
      operationType: operation.operationType,
      roadmap: operation.roadmap,
      status,
    });

    setOfflineOperationId(updated.id);
    return updated;
  }, [exitExtraEvidencePhotos.licensePlate, exitExtraEvidencePhotos.seal, saveFormDraft, setOfflineOperationId]);

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

  const hydrateOperationById = useCallback(async (operationId: string) => {
    const operation = await getOfflinePalletOperation(operationId);
    if (!operation) return null;

    hydrateOfflineOperation(operation);
    return operation;
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
