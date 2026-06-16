const MINIO_VALORLOG_PUBLIC_URL = process.env.EXPO_PUBLIC_MINIO_VALORLOG_PUBLIC_URL ?? "";

export function hasRoadmapPhotoPublicUrl() {
  return MINIO_VALORLOG_PUBLIC_URL.trim().length > 0;
}

export function resolveRoadmapPhotoUri(path?: string | null) {
  const normalizedPath = path?.trim().replace(/^\/+/, "");
  if (!normalizedPath) return null;
  if (/^https?:\/\//i.test(normalizedPath)) return encodeURI(normalizedPath);

  const baseUrl = MINIO_VALORLOG_PUBLIC_URL.trim().replace(/\/+$/, "");
  return baseUrl ? encodeURI(joinUrl(baseUrl, normalizedPath)) : normalizedPath;
}

function joinUrl(baseUrl: string, path: string) {
  const baseParts = baseUrl.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  const baseLastPart = baseParts[baseParts.length - 1];
  const pathFirstPart = pathParts[0];

  if (baseLastPart && pathFirstPart && baseLastPart === pathFirstPart) {
    return `${baseUrl}/${pathParts.slice(1).join("/")}`;
  }

  return `${baseUrl}/${path}`;
}
