import {
  OfflinePalletEvidenceItem,
  OfflinePalletOperation,
  OfflinePalletOperationStep,
  OfflinePalletOperationSummary,
  OfflinePalletOperationSummaryItem,
  OfflinePalletOperationSummarySection,
  OfflinePalletOperationSummaryStatus,
} from "../../protocol";

const PHOTOS_PER_PALLET = 4;

export function buildOfflinePalletOperationSummary(
  operation: OfflinePalletOperation,
): OfflinePalletOperationSummary {
  const formSection = buildFormSection(operation);
  const palletSection = buildPalletSection(operation);
  const sections: OfflinePalletOperationSummarySection[] = [formSection, palletSection];

  if (operation.operationType === "exit") {
    sections.push(buildExitExtraEvidenceSection(operation));
  }

  const totalSteps = operation.operationType === "entry" ? 2 : 3;
  const completedSteps = sections.filter(section => section.status === "complete").length;
  const nextStep = getNextStep(operation, sections);

  return {
    completedSteps,
    nextStep,
    operation,
    progressLabel: `${completedSteps}/${totalSteps} etapas completas`,
    sections,
    totalSteps,
  };
}

function buildFormSection(operation: OfflinePalletOperation): OfflinePalletOperationSummarySection {
  const formData = operation.formData;
  const roadmap = formData?.roadmap ?? operation.roadmap ?? "";
  const palletsQuantity = formData?.palletsQuantity ?? "";
  const items: OfflinePalletOperationSummaryItem[] = [
    buildTextItem("Roteiro", roadmap),
    buildTextItem("Quantidade de paletes", palletsQuantity),
  ];

  return {
    items,
    status: getSectionStatus(items),
    title: "Dados iniciais",
  };
}

function buildPalletSection(operation: OfflinePalletOperation): OfflinePalletOperationSummarySection {
  const quantity = Number(operation.formData?.palletsQuantity ?? 0);
  const pallets = operation.palletEvidenceData?.pallets ?? [];
  const expectedPallets = Number.isInteger(quantity) && quantity > 0 ? quantity : pallets.length;
  const items: OfflinePalletOperationSummaryItem[] = [];

  if (expectedPallets === 0) {
    items.push({ label: "Paletes", status: "not_started", value: "Nenhum palete informado" });
  }

  for (let index = 0; index < expectedPallets; index += 1) {
    const pallet = findPallet(pallets, index);
    items.push(buildTextItem(`Palete ${index + 1} - lote`, pallet?.batch ?? ""));

    for (let photoIndex = 0; photoIndex < PHOTOS_PER_PALLET; photoIndex += 1) {
      const photo = pallet?.photos?.[photoIndex] ?? "";
      items.push(buildPhotoItem(`Palete ${index + 1} - foto ${photoIndex + 1}`, photo));
    }
  }

  return {
    items,
    status: getSectionStatus(items),
    title: "Evidências dos paletes",
  };
}

function buildExitExtraEvidenceSection(operation: OfflinePalletOperation): OfflinePalletOperationSummarySection {
  const items = [
    buildPhotoItem("Foto da carga", operation.shipGoodsData?.truck ?? ""),
    buildPhotoItem("Foto da placa", operation.exitExtraEvidenceData?.licensePlate ?? ""),
    buildPhotoItem("Foto do lacre", operation.exitExtraEvidenceData?.seal ?? ""),
  ];

  return {
    items,
    status: getSectionStatus(items),
    title: "Evidências finais da saída",
  };
}

function getNextStep(
  operation: OfflinePalletOperation,
  sections: OfflinePalletOperationSummarySection[],
): OfflinePalletOperationStep | undefined {
  if (sections[0]?.status !== "complete") return "form";
  if (sections[1]?.status !== "complete") return "pallets_evidence";

  if (operation.operationType === "entry") return undefined;
  if (sections[2]?.status !== "complete") return "exit_extra_evidence";

  return undefined;
}

function findPallet(pallets: OfflinePalletEvidenceItem[], index: number) {
  return pallets.find(pallet => pallet.palletIndex === index);
}

function buildTextItem(label: string, value: string): OfflinePalletOperationSummaryItem {
  return {
    label,
    status: value.trim() ? "complete" : "pending",
    value: value.trim() || "Pendente",
  };
}

function buildPhotoItem(label: string, uri: string): OfflinePalletOperationSummaryItem {
  return {
    label,
    status: uri ? "complete" : "pending",
    thumbnailUri: uri || undefined,
    value: uri ? "Foto preenchida" : "Foto pendente",
  };
}

function getSectionStatus(items: OfflinePalletOperationSummaryItem[]): OfflinePalletOperationSummaryStatus {
  if (items.every(item => item.status === "complete")) return "complete";
  if (items.some(item => item.status === "complete")) return "pending";
  return "not_started";
}
