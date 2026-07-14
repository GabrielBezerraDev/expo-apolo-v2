import type { AuthUser } from "./authSession.protocol";

export function getAuthUserFromToken(token: string, fallbackEmail?: string): AuthUser {
  const decoded = decodeAuthToken(token);
  const payload = isRecord(decoded?.payload)
    ? decoded.payload
    : decoded;
  const userId = normalizeUserId(payload?.id);

  if (!userId) {
    throw new Error("Não foi possível identificar o usuário autenticado.");
  }

  return {
    ...(payload ?? {}),
    id: userId,
    ...(typeof payload?.email === "string" && payload.email.trim()
      ? { email: payload.email.trim().toLowerCase() }
      : fallbackEmail
        ? { email: fallbackEmail.trim().toLowerCase() }
        : {}),
  };
}

export function isAuthTokenExpired(token: string, now = Date.now()) {
  const expiration = getAuthTokenExpiresAt(token);

  return expiration != null && now >= expiration;
}

export function getAuthTokenExpiresAt(token: string) {
  const decoded = decodeAuthToken(token);
  const payload = isRecord(decoded?.payload) ? decoded.payload : null;
  return normalizeNumericDate(decoded?.exp ?? payload?.exp);
}

function decodeAuthToken(token?: string): Record<string, unknown> | null {
  const encodedPayload = token?.split(".")[1];
  if (!encodedPayload || typeof globalThis.atob !== "function") return null;

  try {
    const base64 = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");

    const decoded = JSON.parse(globalThis.atob(base64));
    return isRecord(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

function normalizeUserId(value: unknown) {
  const userId = typeof value === "string" ? Number(value) : value;
  return typeof userId === "number" && Number.isInteger(userId) && userId > 0
    ? userId
    : undefined;
}

function normalizeNumericDate(value: unknown) {
  const seconds = typeof value === "string" ? Number(value) : value;
  return typeof seconds === "number" && Number.isFinite(seconds)
    ? seconds * 1000
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
