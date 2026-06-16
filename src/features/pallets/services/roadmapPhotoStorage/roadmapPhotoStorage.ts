const MINIO_VALORLOG_PUBLIC_URL = process.env.EXPO_PUBLIC_MINIO_VALORLOG_PUBLIC_URL ?? "";

export function hasRoadmapPhotoPublicUrl() {
  return MINIO_VALORLOG_PUBLIC_URL.trim().length > 0;
}

export function resolveRoadmapPhotoUri(path?: string | null) {
  const normalizedPath = path?.trim().replace(/^\/+/, "");
  if (!normalizedPath) return null;
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;

  const baseUrl = MINIO_VALORLOG_PUBLIC_URL.trim().replace(/\/+$/, "");
  console.log("URL completa: ",`${baseUrl}/${normalizedPath}`);
  return baseUrl ? `${baseUrl}/${normalizedPath}` : normalizedPath;
}
