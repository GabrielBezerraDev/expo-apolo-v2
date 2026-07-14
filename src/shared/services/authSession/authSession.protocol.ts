export type AuthTokens = {
  refreshToken?: string;
  token: string;
};

export type AuthUser = {
  email?: string;
  id: number;
  name?: string;
  [key: string]: unknown;
};

export type AuthSessionMode = "offline" | "online";

export type AuthSessionRecord = {
  lastOnlineValidatedAt: number;
  mode: AuthSessionMode;
  offlineValidUntil: number;
  tokens: AuthTokens;
  user: AuthUser;
};

export type AuthRevalidationReason = "offline_access_expired" | "server_rejected_session";
