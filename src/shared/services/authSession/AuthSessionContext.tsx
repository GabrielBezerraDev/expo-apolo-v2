import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AUTH_TOKEN_STORAGE_KEY = "valorlog.authToken";
const AUTH_REFRESH_TOKEN_STORAGE_KEY = "valorlog.refreshToken";

export type AuthSessionTokens = {
  refreshToken?: string;
  token: string;
};

export type AuthSessionStatus =
  | "loading"
  | "signedOut"
  | "passwordChangeRequired"
  | "authenticated";

export type AuthSessionUser = {
  email?: string;
  id: number | string;
  lastName?: string;
  name?: string;
  resetPassword: boolean;
  [claim: string]: unknown;
};

export type PasswordChangePreference = {
  email: string;
  shouldRemember: boolean;
};

type ActiveAuthSessionStatus = Extract<
  AuthSessionStatus,
  "authenticated" | "passwordChangeRequired"
>;

type ActiveAuthSession = {
  passwordChangePreference?: PasswordChangePreference;
  refreshToken?: string;
  status: ActiveAuthSessionStatus;
  token: string;
  user: AuthSessionUser;
  userId: number;
};

type AuthSessionState =
  | { status: "loading" | "signedOut" }
  | ActiveAuthSession;

type AuthSessionContextValue = {
  login: (
    tokens: AuthSessionTokens,
    passwordChangePreference?: PasswordChangePreference,
  ) => Promise<ActiveAuthSessionStatus>;
  logout: () => Promise<void>;
  passwordChangePreference?: PasswordChangePreference;
  refreshToken?: string;
  replaceSessionTokens: (tokens: AuthSessionTokens) => Promise<void>;
  status: AuthSessionStatus;
  token?: string;
  userId?: number;
  user?: AuthSessionUser;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

type AuthSessionProviderProps = PropsWithChildren;

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSessionState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function initializeSession() {
      try {
        await clearStoredSession();
      } catch {
        // Legacy tokens must never prevent the current process from starting signed out.
      } finally {
        if (!active) return;

        queryClient.clear();
        setSession({ status: "signedOut" });
      }
    }

    void initializeSession();

    return () => {
      active = false;
    };
  }, [queryClient]);

  const login = useCallback(async (
    tokens: AuthSessionTokens,
    passwordChangePreference?: PasswordChangePreference,
  ) => {
    const nextSession = createActiveSession(tokens);
    if (!nextSession) {
      throw new Error("O servidor retornou um token de sessão inválido.");
    }

    setSession({
      ...nextSession,
      passwordChangePreference:
        nextSession.status === "passwordChangeRequired"
          ? passwordChangePreference
          : undefined,
    });

    return nextSession.status;
  }, []);

  const logout = useCallback(async () => {
    try {
      await clearStoredSession();
    } finally {
      setSession({ status: "signedOut" });
      queryClient.clear();
    }
  }, [queryClient]);

  const replaceSessionTokens = useCallback(async (tokens: AuthSessionTokens) => {
    const nextSession = createActiveSession(tokens);
    if (!nextSession || nextSession.status !== "authenticated") {
      throw new Error("O servidor retornou um token de sessão inválido.");
    }

    setSession(nextSession);
  }, []);

  const activeSession = isActiveSession(session) ? session : undefined;

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      login,
      logout,
      passwordChangePreference: activeSession?.passwordChangePreference,
      refreshToken: activeSession?.refreshToken,
      replaceSessionTokens,
      status: session.status,
      token: activeSession?.token,
      user: activeSession?.user,
      userId: activeSession?.userId,
    }),
    [activeSession, login, logout, replaceSessionTokens, session.status],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }

  return context;
}

async function removeStoredSessionItem(key: string) {
  return SecureStore.deleteItemAsync(key);
}

async function clearStoredSession() {
  await Promise.all([
    removeStoredSessionItem(AUTH_TOKEN_STORAGE_KEY),
    removeStoredSessionItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
  ]);
}

function isActiveSession(session: AuthSessionState): session is ActiveAuthSession {
  return session.status === "authenticated" || session.status === "passwordChangeRequired";
}

function createActiveSession(tokens: AuthSessionTokens): ActiveAuthSession | null {
  const user = getUserFromToken(tokens.token);
  if (!user) return null;

  const normalizedUserId = typeof user.id === "string" ? Number(user.id) : user.id;

  if (!Number.isInteger(normalizedUserId)) return null;

  return {
    refreshToken: tokens.refreshToken,
    status: user.resetPassword ? "passwordChangeRequired" : "authenticated",
    token: tokens.token,
    user,
    userId: normalizedUserId,
  };
}

function getUserFromToken(token: string): AuthSessionUser | null {
  const claims = decodeJwtPayload(token);
  if (!isRecord(claims) || !isRecord(claims.payload)) return null;

  const expiresAt = claims.exp;
  if (
    typeof expiresAt !== "number" ||
    !Number.isFinite(expiresAt) ||
    expiresAt * 1000 <= Date.now()
  ) {
    return null;
  }

  const userId = claims.payload.id;
  const resetPassword = claims.payload.resetPassword;
  const normalizedUserId = typeof userId === "string" ? Number(userId) : userId;

  if (
    !Number.isInteger(normalizedUserId) ||
    (typeof userId === "string" && !userId.trim()) ||
    typeof resetPassword !== "boolean"
  ) {
    return null;
  }

  if (typeof userId !== "number" && typeof userId !== "string") return null;

  return {
    ...claims.payload,
    id: userId,
    resetPassword,
  };
}

function decodeJwtPayload(token: string): unknown {
  const tokenParts = token.split(".");
  if (
    tokenParts.length !== 3 ||
    tokenParts.some(part => !part) ||
    typeof globalThis.atob !== "function"
  ) {
    return null;
  }

  const encodedPayload = tokenParts[1];

  try {
    const base64 = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");

    return JSON.parse(globalThis.atob(base64));
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
