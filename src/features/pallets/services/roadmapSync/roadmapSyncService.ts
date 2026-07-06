import type { RoadmapApi } from "../roadmapApi";
import type {
  OfflinePalletEvidenceItem,
  OfflinePalletOperation,
  OfflineValidationIssue,
} from "../../protocol";
import type { RoadmapType } from "../../protocol";
import { isApiValidationError } from "@shared/services/apiClient";

const PHOTOS_PER_PALLET = 4;
const MAX_PALLETS_PER_OPERATION = 50;

export class OfflineOperationValidationError extends Error {
  constructor(public readonly issues: OfflineValidationIssue[]) {
    super(issues[0]?.message ?? "Operação precisa ser revisada antes da sincronização.");
  }
}

export async function syncOfflinePalletOperation(roadmapApi: RoadmapApi, operation: OfflinePalletOperation) {
  const roadmap = operation.formData?.roadmap ?? operation.roadmap ?? "";
  const pallets = getSortedPallets(operation);
  const palletsQuantity = Number(operation.formData?.palletsQuantity ?? pallets.length);
  const typeRoadmap = getRoadmapType(operation.operationType);

  validateOperation({ operation, pallets, palletsQuantity, roadmap });
  await validateOperationOnline({ pallets, roadmapApi, typeRoadmap });

  const formData = buildRoadmapFormData({
    operation,
    pallets,
    palletsQuantity,
    roadmap,
    typeRoadmap,
  });

  if (operation.operationType === "entry") {
    return roadmapApi.startRoadmap(formData);
  }

  return roadmapApi.finishRoadmap(formData);
}

function buildRoadmapFormData({
  operation,
  pallets,
  palletsQuantity,
  roadmap,
  typeRoadmap,
}: {
  operation: OfflinePalletOperation;
  pallets: OfflinePalletEvidenceItem[];
  palletsQuantity: number;
  roadmap: string;
  typeRoadmap: RoadmapType;
}) {
  const formData = new FormData();

  formData.append("roadmap", roadmap);
  formData.append("typeRoadmap", typeRoadmap);
  formData.append("clientOperationId", operation.id);
  formData.append("palletsQuantity", String(palletsQuantity));
  formData.append(
    "photosPallets",
    JSON.stringify(pallets.map(pallet => ({ batch: pallet.batch, palletIndex: pallet.palletIndex }))),
  );

  pallets.forEach((pallet, palletIndex) => {
    pallet.photos.forEach((photoUri, photoIndex) => {
      appendFile(formData, "palletPhotos", photoUri, `palete-${palletIndex + 1}-foto-${photoIndex + 1}`);
    });
  });

  if (operation.operationType === "exit") {
    appendFile(formData, "truck", operation.shipGoodsData?.truck ?? "", "carga");
    appendFile(formData, "licensePlate", operation.exitExtraEvidenceData?.licensePlate ?? "", "placa");
    appendFile(formData, "seal", operation.exitExtraEvidenceData?.seal ?? "", "lacre");
  }

  return formData;
}

function validateOperation({
  operation,
  pallets,
  palletsQuantity,
  roadmap,
}: {
  operation: OfflinePalletOperation;
  pallets: OfflinePalletEvidenceItem[];
  palletsQuantity: number;
  roadmap: string;
}) {
  const issues: OfflineValidationIssue[] = [];

  if (!roadmap.trim()) {
    issues.push({ field: "roadmap", message: "Roteiro não informado.", stage: "form" });
  }

  if (!Number.isInteger(palletsQuantity) || palletsQuantity <= 0) {
    issues.push({ field: "palletsQuantity", message: "Quantidade de paletes inválida.", stage: "form" });
  }

  if (Number.isInteger(palletsQuantity) && palletsQuantity > MAX_PALLETS_PER_OPERATION) {
    issues.push({ field: "palletsQuantity", message: "Quantidade máxima de paletes é 50.", stage: "form" });
  }

  if (pallets.length !== palletsQuantity) {
    issues.push({ field: "palletsQuantity", message: "Quantidade de paletes não confere com as evidências.", stage: "form" });
  }

  getDuplicatedBatches(pallets).forEach(({ batch, palletIndex }) => {
    issues.push({
      batch,
      field: "batch",
      message: "Este lote já foi informado em outro palete.",
      palletIndex,
      stage: "pallets_evidence",
    });
  });

  pallets.forEach((pallet, index) => {
    if (!pallet.batch.trim()) {
      issues.push({ field: "batch", message: `Lote do palete ${index + 1} não informado.`, palletIndex: index, stage: "pallets_evidence" });
    }

    if (pallet.photos.filter(Boolean).length !== PHOTOS_PER_PALLET) {
      issues.push({ batch: pallet.batch, field: "photos", message: `Palete ${index + 1} precisa ter 4 fotos.`, palletIndex: index, stage: "pallets_evidence" });
    }
  });

  if (operation.operationType === "exit") {
    if (!operation.shipGoodsData?.truck) {
      issues.push({ field: "truck", message: "Foto da carga não informada.", stage: "exit_extra_evidence" });
    }

    if (!operation.exitExtraEvidenceData?.licensePlate) {
      issues.push({ field: "licensePlate", message: "Foto da placa não informada.", stage: "exit_extra_evidence" });
    }

    if (!operation.exitExtraEvidenceData?.seal) {
      issues.push({ field: "seal", message: "Foto do lacre não informada.", stage: "exit_extra_evidence" });
    }
  }

  if (issues.length > 0) {
    throw new OfflineOperationValidationError(issues);
  }
}

function getDuplicatedBatches(pallets: OfflinePalletEvidenceItem[]) {
  const firstIndexByBatch = new Map<string, number>();
  const duplicated: Array<{ batch: string; palletIndex: number }> = [];

  pallets.forEach((pallet, index) => {
    const normalizedBatch = pallet.batch.trim().toLowerCase();
    if (!normalizedBatch) return;

    const firstIndex = firstIndexByBatch.get(normalizedBatch);
    if (firstIndex == null) {
      firstIndexByBatch.set(normalizedBatch, index);
      return;
    }

    duplicated.push({ batch: pallet.batch, palletIndex: pallet.palletIndex });
  });

  return duplicated;
}

async function validateOperationOnline({
  pallets,
  roadmapApi,
  typeRoadmap,
}: {
  pallets: OfflinePalletEvidenceItem[];
  roadmapApi: RoadmapApi;
  typeRoadmap: RoadmapType;
}) {
  const issues: OfflineValidationIssue[] = [];

  for (const pallet of pallets) {
    try {
      await roadmapApi.validatePallet({
        batch: pallet.batch,
        typeRoadmap,
      });
    } catch (error) {
      if (!isApiValidationError(error)) throw error;

      issues.push({
        batch: pallet.batch,
        field: "batch",
        message: error instanceof Error ? error.message : "Palete não passou na validação.",
        palletIndex: pallet.palletIndex,
        stage: "pallets_evidence",
      });
    }
  }

  if (issues.length > 0) {
    throw new OfflineOperationValidationError(issues);
  }
}

function getSortedPallets(operation: OfflinePalletOperation) {
  return [...(operation.palletEvidenceData?.pallets ?? [])].sort(
    (current, next) => current.palletIndex - next.palletIndex,
  );
}

function getRoadmapType(operationType: OfflinePalletOperation["operationType"]): RoadmapType {
  return operationType === "entry" ? "ENTRY" : "EXIT";
}

function appendFile(formData: FormData, fieldName: string, uri: string, baseName: string) {
  const extension = getFileExtension(uri);

  formData.append(fieldName, {
    name: `${baseName}${extension}`,
    type: getMimeType(extension),
    uri,
  } as unknown as Blob);
}

function getFileExtension(uri: string) {
  const extension = uri.match(/\.[a-zA-Z0-9]+(?:\?.*)?$/)?.[0]?.replace(/\?.*$/, "").toLowerCase();

  if (extension && [".jpg", ".jpeg", ".png", ".webp"].includes(extension)) {
    return extension;
  }

  return ".jpg";
}

function getMimeType(extension: string) {
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}
