import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

type SavePalletImageParams = {
  fileName: string;
  operationType: "entry" | "exit";
  operationId: string;
  roadmap?: string | null;
  sourceUri: string;
  step: string;
};

const LOCAL_DATA_DIR = `${FileSystem.documentDirectory ?? ""}data`;

export async function savePalletOperationImage({
  fileName,
  operationType,
  operationId,
  roadmap,
  sourceUri,
  step,
}: SavePalletImageParams) {
  if (!FileSystem.documentDirectory) {
    throw new Error("Local file storage is not available on this device.");
  }

  const operationDirectory = sanitizePathPart(roadmap || operationId);
  const directory = `${LOCAL_DATA_DIR}/${operationType}/${operationDirectory}/${sanitizePathPart(step)}`;
  await ensureDirectory(directory);

  const manipulated = await ImageManipulator.manipulateAsync(sourceUri, [], {
    compress: 0.68,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  const destination = `${directory}/${sanitizePathPart(fileName)}.jpg`;

  await FileSystem.deleteAsync(destination, { idempotent: true });
  await FileSystem.copyAsync({ from: manipulated.uri, to: destination });
  await deleteTempImage(manipulated.uri, sourceUri);

  return destination;
}

export async function deletePalletOperationImageDirectory({
  operationId,
  operationType,
  roadmap,
}: {
  operationId: string;
  operationType: "entry" | "exit";
  roadmap?: string | null;
}) {
  if (!FileSystem.documentDirectory) return;

  const operationDirectory = sanitizePathPart(roadmap || operationId);
  const directories = new Set([
    `${LOCAL_DATA_DIR}/${operationType}/${operationDirectory}`,
    `${LOCAL_DATA_DIR}/${operationType}/${sanitizePathPart(operationId)}`,
  ]);

  for (const directory of directories) {
    const info = await FileSystem.getInfoAsync(directory);

    if (info.exists) {
      await FileSystem.deleteAsync(directory, { idempotent: true });
    }
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
