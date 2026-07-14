import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

type SavePalletImageParams = {
  fileName: string;
  operationType: "entry" | "exit";
  operationId: string;
  ownerUserId: number;
  roadmap?: string | null;
  sourceUri: string;
  step: string;
};

const LOCAL_DATA_DIR = `${FileSystem.documentDirectory ?? ""}data`;

export async function savePalletOperationImage({
  fileName,
  operationType,
  operationId,
  ownerUserId,
  roadmap,
  sourceUri,
  step,
}: SavePalletImageParams) {
  if (!FileSystem.documentDirectory) {
    throw new Error("O armazenamento local de arquivos não está disponível neste dispositivo.");
  }

  const directory = `${LOCAL_DATA_DIR}/users/${ownerUserId}/${operationType}/${sanitizePathPart(operationId)}/${sanitizePathPart(step)}`;
  await ensureDirectory(directory);

  const manipulated = await ImageManipulator.manipulateAsync(sourceUri, [], {
    compress: 0.68,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  const destination = `${directory}/${buildUniqueImageFileName(fileName)}`;

  await FileSystem.copyAsync({ from: manipulated.uri, to: destination });
  await deleteTempImage(manipulated.uri, sourceUri);

  return destination;
}

export async function deletePalletOperationImageDirectory({
  operationId,
  operationType,
  ownerUserId,
  roadmap,
}: {
  operationId: string;
  operationType: "entry" | "exit";
  ownerUserId?: number | null;
  roadmap?: string | null;
}) {
  if (!FileSystem.documentDirectory) return;

  const directories = new Set([
    ...(ownerUserId
      ? [`${LOCAL_DATA_DIR}/users/${ownerUserId}/${operationType}/${sanitizePathPart(operationId)}`]
      : []),
    `${LOCAL_DATA_DIR}/${operationType}/${sanitizePathPart(operationId)}`,
  ]);

  for (const directory of directories) {
    const info = await FileSystem.getInfoAsync(directory);

    if (info.exists) {
      await FileSystem.deleteAsync(directory, { idempotent: true });
    }
  }
}

export async function deletePalletOperationImage(imageUri?: string | null) {
  if (!FileSystem.documentDirectory || !imageUri) return;
  if (!imageUri.startsWith(FileSystem.documentDirectory)) return;

  const info = await FileSystem.getInfoAsync(imageUri);

  if (info.exists) {
    await FileSystem.deleteAsync(imageUri, { idempotent: true });
  }
}

async function ensureDirectory(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) return;

  await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
}

async function deleteTempImage(tempUri: string, originalUri: string) {
  if (tempUri === originalUri) return;

  try {
    await FileSystem.deleteAsync(tempUri, { idempotent: true });
  } catch {
    // Best effort cleanup; the saved copy above is the source of truth.
  }
}

function sanitizePathPart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
}

function buildUniqueImageFileName(fileName: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${sanitizePathPart(fileName)}-${suffix}.jpg`;
}
