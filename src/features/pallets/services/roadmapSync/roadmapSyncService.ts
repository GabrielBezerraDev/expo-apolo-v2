import type { RoadmapApi } from "../roadmapApi";
import type {
  OfflinePalletEvidenceItem,
  OfflinePalletOperation,
} from "../../protocol";
import type { RoadmapType } from "../../protocol";

const PHOTOS_PER_PALLET = 4;

export async function syncOfflinePalletOperation(roadmapApi: RoadmapApi, operation: OfflinePalletOperation) {
  const roadmap = operation.formData?.roadmap ?? operation.roadmap ?? "";
  const pallets = getSortedPallets(operation);
  const palletsQuantity = Number(operation.formData?.palletsQuantity ?? pallets.length);
  const typeRoadmap = getRoadmapType(operation.operationType);

  validateOperation({ operation, pallets, palletsQuantity, roadmap });

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
  if (!roadmap.trim()) {
    throw new Error("Roteiro nao informado.");
  }

  if (!Number.isInteger(palletsQuantity) || palletsQuantity <= 0) {
    throw new Error("Quantidade de paletes invalida.");
  }

  if (pallets.length !== palletsQuantity) {
    throw new Error("Quantidade de paletes nao confere com as evidencias.");
  }

  pallets.forEach((pallet, index) => {
    if (!pallet.batch.trim()) {
      throw new Error(`Lote do palete ${index + 1} nao informado.`);
    }

    if (pallet.photos.filter(Boolean).length !== PHOTOS_PER_PALLET) {
      throw new Error(`Palete ${index + 1} precisa ter 4 fotos.`);
    }
  });

  if (operation.operationType === "exit") {
    if (!operation.shipGoodsData?.truck) {
      throw new Error("Foto da carga nao informada.");
    }

    if (!operation.exitExtraEvidenceData?.licensePlate) {
      throw new Error("Foto da placa nao informada.");
    }

    if (!operation.exitExtraEvidenceData?.seal) {
      throw new Error("Foto do lacre nao informada.");
    }
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
