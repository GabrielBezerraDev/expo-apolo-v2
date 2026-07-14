import * as SecureStore from "expo-secure-store";
import type { OfflineAuthSecret } from "../../protocol";

const OFFLINE_AUTH_KEY_PREFIX = "apollo.offlineAuth";

export function createOfflineAuthCredentialStorageKey(userId: number, currentKey?: string) {
  const [firstKey, secondKey] = getOfflineAuthCredentialStorageKeys(userId);
  return currentKey === firstKey ? secondKey : firstKey;
}

export function getOfflineAuthCredentialStorageKeys(userId: number) {
  return [
    `${OFFLINE_AUTH_KEY_PREFIX}.${userId}.a`,
    `${OFFLINE_AUTH_KEY_PREFIX}.${userId}.b`,
  ] as const;
}

export function getLegacyOfflineAuthCredentialStorageKey(userId: number) {
  return `${OFFLINE_AUTH_KEY_PREFIX}.${userId}`;
}

export async function getOfflineAuthSecret(key: string) {
  const serialized = await SecureStore.getItemAsync(key);
  if (!serialized) return null;

  try {
    const secret = JSON.parse(serialized) as Partial<OfflineAuthSecret>;
    if (
      secret.version !== 1 ||
      typeof secret.emailNormalized !== "string" ||
      typeof secret.lastOnlineValidatedAt !== "number" ||
      typeof secret.offlineValidUntil !== "number" ||
      !isHexValue(secret.passwordSalt, 32) ||
      !isHexValue(secret.passwordVerifier, 64) ||
      !isAuthUser(secret.user) ||
      !isAuthTokens(secret.tokens)
    ) {
      return null;
    }

    return secret as OfflineAuthSecret;
  } catch {
    return null;
  }
}

export async function setOfflineAuthSecret(key: string, secret: OfflineAuthSecret) {
  await SecureStore.setItemAsync(key, JSON.stringify(secret), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function removeOfflineAuthSecret(key: string) {
  await SecureStore.deleteItemAsync(key);
}

function isAuthUser(value: unknown): value is OfflineAuthSecret["user"] {
  if (!isRecord(value)) return false;
  return typeof value.id === "number" && Number.isInteger(value.id) && value.id > 0;
}

function isAuthTokens(value: unknown): value is OfflineAuthSecret["tokens"] {
  if (!isRecord(value) || typeof value.token !== "string" || !value.token) return false;
  return value.refreshToken == null || typeof value.refreshToken === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHexValue(value: unknown, length: number): value is string {
  return typeof value === "string" && value.length === length && /^[a-f0-9]+$/i.test(value);
}
