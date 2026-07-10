import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";
import { version as currentVersion } from "../../../../package.json";

export type AppUpdateInfo = {
  currentVersion: string;
  downloadUrl: string;
  latestVersion: string;
};

type DownloadProgressHandler = (progress: number) => void;

const DEFAULT_APK_BUCKET_URL = "http://172.21.72.238:9000/apolo";
const APK_BUCKET_PREFIX = "apolloapk_update/";
const APK_FILE_PREFIX = "apollo-release_";
const APK_MIME_TYPE = "application/vnd.android.package-archive";
const FLAG_GRANT_READ_URI_PERMISSION = 1;

export async function getAvailableAppUpdate(): Promise<AppUpdateInfo | null> {
  if (Platform.OS !== "android") return null;
  const bucketUrl = getApkBucketUrl();
  if (!bucketUrl) return null;

  const xmlText = await fetchBucketListing(bucketUrl);
  const latestApk = findLatestApk(xmlText, bucketUrl);

  if (!latestApk || compareVersions(latestApk.version, currentVersion) <= 0) {
    return null;
  }

  return {
    currentVersion,
    downloadUrl: latestApk.downloadUrl,
    latestVersion: latestApk.version,
  };
}

export async function downloadAndInstallApk({
  downloadUrl,
  latestVersion,
  onInstallStart,
  onProgress,
}: {
  downloadUrl: string;
  latestVersion: string;
  onInstallStart?: () => void;
  onProgress?: DownloadProgressHandler;
}) {
  if (Platform.OS !== "android") {
    throw new Error("Atualização automática está disponível apenas no Android.");
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error("Armazenamento local indisponível neste dispositivo.");
  }

  const updateDirectory = `${FileSystem.cacheDirectory}updates`;
  await ensureDirectory(updateDirectory);

  const apkPath = `${updateDirectory}/${APK_FILE_PREFIX}${sanitizeVersion(latestVersion)}.apk`;
  const download = FileSystem.createDownloadResumable(
    downloadUrl,
    apkPath,
    {},
    ({ totalBytesExpectedToWrite, totalBytesWritten }) => {
      if (totalBytesExpectedToWrite <= 0) return;

      const nextProgress = Math.min(
        100,
        Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100),
      );
      onProgress?.(nextProgress);
    },
  );

  const result = await download.downloadAsync();
  if (!result?.uri) {
    throw new Error("Não foi possível baixar o APK de atualização.");
  }

  onProgress?.(100);
  const contentUri = await FileSystem.getContentUriAsync(result.uri);
  onInstallStart?.();
  await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
    data: contentUri,
    flags: FLAG_GRANT_READ_URI_PERMISSION,
    type: APK_MIME_TYPE,
  });
}

function getApkBucketUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_APK_UPDATE_BUCKET_URL
    ?? process.env.EXPO_PUBLIC_MINIO_VALORLOG_PUBLIC_URL
    ?? DEFAULT_APK_BUCKET_URL;
  return normalizeBucketUrl(configuredUrl);
}

function normalizeBucketUrl(value: string) {
  return value.trim().replace(/[/?]+$/, "");
}

async function fetchBucketListing(bucketUrl: string) {
  const params = new URLSearchParams({
    "list-type": "2",
    prefix: APK_BUCKET_PREFIX,
  });
  const response = await fetch(`${bucketUrl}/?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Não foi possível verificar atualizações do aplicativo.");
  }

  return response.text();
}

function findLatestApk(xmlText: string, bucketUrl: string): { downloadUrl: string; version: string } | null {
  const keys = extractBucketKeys(xmlText);
  let latest: { downloadUrl: string; version: string } | null = null;

  for (const key of keys) {
    const version = extractVersionFromApkKey(key);
    if (!version) continue;

    if (!latest || compareVersions(version, latest.version) > 0) {
      latest = {
        downloadUrl: `${bucketUrl}/${encodeURI(key)}`,
        version,
      };
    }
  }

  return latest;
}

function extractBucketKeys(xmlText: string) {
  const keys: string[] = [];
  const keyRegex = /<Key>([^<]+)<\/Key>/g;
  let match = keyRegex.exec(xmlText);

  while (match) {
    keys.push(decodeXmlEntity(match[1]));
    match = keyRegex.exec(xmlText);
  }

  return keys;
}

function extractVersionFromApkKey(key: string) {
  const fileName = key.split("/").pop() ?? key;
  const match = fileName.match(/^apollo-release_(\d+(?:\.\d+){2,3})(?:\.apk)?$/i);

  return match?.[1] ?? null;
}

function compareVersions(current: string, next: string) {
  const currentParts = parseVersion(current);
  const nextParts = parseVersion(next);
  const length = Math.max(currentParts.length, nextParts.length);

  for (let index = 0; index < length; index += 1) {
    const currentPart = currentParts[index] ?? 0;
    const nextPart = nextParts[index] ?? 0;

    if (currentPart > nextPart) return 1;
    if (currentPart < nextPart) return -1;
  }

  return 0;
}

function parseVersion(version: string) {
  return version.split(".").map(part => Number.parseInt(part, 10) || 0);
}

function sanitizeVersion(version: string) {
  return version.replace(/[^0-9.]/g, "-");
}

function decodeXmlEntity(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function ensureDirectory(directory: string) {
  const info = await FileSystem.getInfoAsync(directory);
  if (info.exists) return;

  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
}
