import type { AuthSessionRecord, AuthTokens, AuthUser } from "@shared/services/authSession";

export type OfflineAuthUser = {
  createdAt: number;
  credentialStorageKey: string;
  emailNormalized: string;
  lastOnlineValidatedAt: number;
  offlineValidUntil: number;
  updatedAt: number;
  user: AuthUser;
  userId: number;
};

export type OfflineAuthSecret = {
  emailNormalized: string;
  lastOnlineValidatedAt: number;
  offlineValidUntil: number;
  passwordSalt: string;
  passwordVerifier: string;
  tokens: AuthTokens;
  user: AuthUser;
  version: 1;
};

export type CacheOnlineAuthUserParams = {
  email: string;
  now?: number;
  password: string;
  tokens: AuthTokens;
  user: AuthUser;
};

export type AuthenticateOfflineUserParams = {
  email: string;
  now?: number;
  password: string;
};

export type OfflineAuthSession = AuthSessionRecord;
