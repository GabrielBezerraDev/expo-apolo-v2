import {
  blockOfflineAuth,
  isOfflineAuthBlocked,
  type AuthSessionRecord,
} from "@shared/services/authSession";
import type {
  AuthenticateOfflineUserParams,
  CacheOnlineAuthUserParams,
  OfflineAuthSecret,
} from "../../protocol";
import {
  deleteOfflineAuthUser,
  getOfflineAuthUserByEmail,
  getOfflineAuthUserById,
  normalizeOfflineAuthEmail,
  upsertOfflineAuthUser,
} from "./offlineAuthDatabase";
import {
  createOfflineAuthCredentialStorageKey,
  getOfflineAuthCredentialStorageKeys,
  getLegacyOfflineAuthCredentialStorageKey,
  getOfflineAuthSecret,
  removeOfflineAuthSecret,
  setOfflineAuthSecret,
} from "./offlineAuthStorage";
import { createPasswordVerifier, verifyPassword } from "./passwordVerifier";

export const OFFLINE_AUTH_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export type OfflineAuthErrorCode =
  | "credentials_invalid"
  | "offline_access_expired"
  | "offline_user_not_found"
  | "storage_unavailable";

export class OfflineAuthError extends Error {
  constructor(
    public readonly code: OfflineAuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "OfflineAuthError";
  }
}

export async function cacheOnlineAuthUser({
  email,
  now = Date.now(),
  password,
  tokens,
  user,
}: CacheOnlineAuthUserParams): Promise<AuthSessionRecord> {
  const emailNormalized = normalizeOfflineAuthEmail(email);
  const offlineValidUntil = now + OFFLINE_AUTH_TTL_MS;
  const { salt, verifier } = await createPasswordVerifier(password);
  const [existingByEmail, existingByUserId] = await Promise.all([
    getOfflineAuthUserByEmail(emailNormalized),
    getOfflineAuthUserById(user.id),
  ]);
  const credentialStorageKey = createOfflineAuthCredentialStorageKey(
    user.id,
    existingByUserId?.credentialStorageKey,
  );
  const secret: OfflineAuthSecret = {
    emailNormalized,
    lastOnlineValidatedAt: now,
    offlineValidUntil,
    passwordSalt: salt,
    passwordVerifier: verifier,
    tokens,
    user,
    version: 1,
  };

  await setOfflineAuthSecret(credentialStorageKey, secret);
  try {
    await upsertOfflineAuthUser({
      createdAt: existingByUserId?.createdAt ?? now,
      credentialStorageKey,
      emailNormalized,
      lastOnlineValidatedAt: now,
      offlineValidUntil,
      updatedAt: now,
      user,
      userId: user.id,
    });
  } catch (error) {
    await removeOfflineAuthSecret(credentialStorageKey).catch(() => undefined);
    throw error;
  }

  const staleCredentialKeys = new Set(
    [existingByEmail?.credentialStorageKey, existingByUserId?.credentialStorageKey]
      .filter((key): key is string => Boolean(key)),
  );
  staleCredentialKeys.delete(credentialStorageKey);
  await Promise.all(
    [...staleCredentialKeys].map(key => removeOfflineAuthSecret(key).catch(() => undefined)),
  );

  return {
    lastOnlineValidatedAt: now,
    mode: "online",
    offlineValidUntil,
    tokens,
    user,
  };
}

export async function authenticateOfflineUser({
  email,
  now = Date.now(),
  password,
}: AuthenticateOfflineUserParams): Promise<AuthSessionRecord> {
  const cachedUser = await getOfflineAuthUserByEmail(email);
  if (!cachedUser) {
    throw new OfflineAuthError(
      "offline_user_not_found",
      "Este usuário precisa fazer o primeiro login com acesso à internet.",
    );
  }

  const secret = await getOfflineAuthSecret(cachedUser.credentialStorageKey);
  if (!secret || secret.user.id !== cachedUser.userId) {
    throw new OfflineAuthError(
      "storage_unavailable",
      "O acesso offline deste usuário não está disponível. Faça login online novamente.",
    );
  }

  if (
    secret.emailNormalized !== cachedUser.emailNormalized ||
    secret.lastOnlineValidatedAt !== cachedUser.lastOnlineValidatedAt ||
    secret.offlineValidUntil !== cachedUser.offlineValidUntil
  ) {
    throw new OfflineAuthError(
      "storage_unavailable",
      "Os dados locais deste usuário estão inconsistentes. Faça login online novamente.",
    );
  }

  if (await isOfflineAuthBlocked(cachedUser.userId)) {
    throw new OfflineAuthError(
      "offline_access_expired",
      "Este usuário precisa ser validado novamente com acesso à internet.",
    );
  }

  if (now + MAX_CLOCK_SKEW_MS < cachedUser.lastOnlineValidatedAt) {
    await invalidateOfflineAuthUser(cachedUser.userId);
    throw new OfflineAuthError(
      "offline_access_expired",
      "A data ou hora do dispositivo está inválida. Faça login novamente com acesso à internet.",
    );
  }

  const offlineValidUntil = Math.min(cachedUser.offlineValidUntil, secret.offlineValidUntil);
  if (now >= offlineValidUntil) {
    await invalidateOfflineAuthUser(cachedUser.userId);
    throw new OfflineAuthError(
      "offline_access_expired",
      "Seu acesso offline expirou. Conecte-se à internet para validar o usuário novamente.",
    );
  }

  const passwordMatches = await verifyPassword(
    password,
    secret.passwordSalt,
    secret.passwordVerifier,
  );
  if (!passwordMatches) {
    throw new OfflineAuthError(
      "credentials_invalid",
      "E-mail ou senha inválidos para o acesso offline.",
    );
  }

  return {
    lastOnlineValidatedAt: secret.lastOnlineValidatedAt,
    mode: "offline",
    offlineValidUntil,
    tokens: secret.tokens,
    user: secret.user,
  };
}

export async function forgetOfflineAuthUser(userId: number) {
  const cachedUser = await getOfflineAuthUserById(userId);
  const credentialStorageKeys = new Set([
    ...getOfflineAuthCredentialStorageKeys(userId),
    getLegacyOfflineAuthCredentialStorageKey(userId),
    cachedUser?.credentialStorageKey,
  ].filter((key): key is string => Boolean(key)));

  await Promise.all(
    [...credentialStorageKeys].map(key => removeOfflineAuthSecret(key)),
  );
  await deleteOfflineAuthUser(userId);
}

export async function invalidateOfflineAuthUser(userId: number) {
  const [blockResult, forgetResult] = await Promise.allSettled([
    blockOfflineAuth(userId),
    forgetOfflineAuthUser(userId),
  ]);

  if (blockResult.status === "rejected" && forgetResult.status === "rejected") {
    throw blockResult.reason;
  }
}
