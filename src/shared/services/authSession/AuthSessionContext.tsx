import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { useNetworkState } from "@shared/services/network";
import type {
  AuthRevalidationReason,
  AuthSessionMode,
  AuthSessionRecord,
  AuthUser,
} from "./authSession.protocol";
import { registerAuthenticatedRequestRejectedHandler } from "./authSessionEvents";
import { getAuthTokenExpiresAt, isAuthTokenExpired } from "./authToken";
import {
  clearOfflineAuthBlock,
  isOfflineAuthBlocked,
} from "./offlineAuthBlock";

const ACTIVE_SESSION_STORAGE_KEY = "apollo.activeAuthSession";
const LEGACY_AUTH_TOKEN_STORAGE_KEY = "valorlog.authToken";
const LEGACY_AUTH_REFRESH_TOKEN_STORAGE_KEY = "valorlog.refreshToken";
const MAX_OFFLINE_AUTH_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

type PersistedAuthSession = AuthSessionRecord & {
  version: 1;
};

type AuthSessionContextValue = {
  canUseRemoteApi: boolean;
  forgetCurrentUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (session: AuthSessionRecord) => Promise<void>;
  logout: () => Promise<void>;
  offlineValidUntil?: number;
  refreshToken?: string;
  revalidationEmail?: string;
  revalidationReason?: AuthRevalidationReason;
  sessionMode?: AuthSessionMode;
  token?: string;
  user?: AuthUser;
  userId?: number;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

type AuthSessionProviderProps = PropsWithChildren<{
  onForgetOfflineUser: (userId: number) => Promise<void>;
  onInvalidateOfflineUser: (userId: number) => Promise<void>;
}>;

export function AuthSessionProvider({
  children,
  onForgetOfflineUser,
  onInvalidateOfflineUser,
}: AuthSessionProviderProps) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkState();
  const [isLoading, setIsLoading] = useState(true);
  const [revalidationEmail, setRevalidationEmail] = useState<string | undefined>();
  const [revalidationReason, setRevalidationReason] = useState<AuthRevalidationReason | undefined>();
  const [session, setSession] = useState<AuthSessionRecord | undefined>();
  const [timeReference, setTimeReference] = useState(() => Date.now());
  const sessionRef = useRef<AuthSessionRecord | undefined>(undefined);

  const updateSession = useCallback((nextSession?: AuthSessionRecord) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
  }, []);

  const requireRevalidation = useCallback(async (
    reason: AuthRevalidationReason,
    rejectedToken?: string,
  ) => {
    const currentSession = sessionRef.current;
    if (!currentSession || (rejectedToken && currentSession.tokens.token !== rejectedToken)) return;

    setRevalidationEmail(currentSession.user.email);
    setRevalidationReason(reason);
    updateSession(undefined);
    queryClient.clear();

    try {
      await onInvalidateOfflineUser(currentSession.user.id);
    } finally {
      await removeActiveSessionIfTokenMatches(currentSession.tokens.token).catch(() => undefined);
    }
  }, [onInvalidateOfflineUser, queryClient, updateSession]);

  useEffect(() => {
    let active = true;

    async function loadStoredSession() {
      try {
        const serialized = await SecureStore.getItemAsync(ACTIVE_SESSION_STORAGE_KEY);
        const storedSession = parsePersistedAuthSession(serialized);

        if (!active) return;

        const storedSessionIsBlocked = storedSession
          ? await isOfflineAuthBlocked(storedSession.user.id)
          : false;

        if (!active) return;

        if (storedSession && storedSessionIsBlocked) {
          setRevalidationEmail(storedSession.user.email);
          setRevalidationReason("server_rejected_session");
          await SecureStore.deleteItemAsync(ACTIVE_SESSION_STORAGE_KEY).catch(() => undefined);
        } else if (storedSession && isWithinOfflineWindow(storedSession, Date.now())) {
          updateSession(storedSession);
        } else if (storedSession) {
          setRevalidationEmail(storedSession.user.email);
          setRevalidationReason("offline_access_expired");
          await onInvalidateOfflineUser(storedSession.user.id).catch(() => undefined);
          await SecureStore.deleteItemAsync(ACTIVE_SESSION_STORAGE_KEY).catch(() => undefined);
        } else if (serialized) {
          await SecureStore.deleteItemAsync(ACTIVE_SESSION_STORAGE_KEY).catch(() => undefined);
        }

        await removeLegacySession().catch(() => undefined);
      } catch {
        if (active) updateSession(undefined);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadStoredSession();

    return () => {
      active = false;
    };
  }, [onInvalidateOfflineUser, updateSession]);

  useEffect(() => {
    if (!session) return;

    const remaining = session.offlineValidUntil - Date.now();
    if (remaining <= 0) {
      void requireRevalidation("offline_access_expired").catch(() => undefined);
      return;
    }

    const timeout = setTimeout(() => {
      void requireRevalidation("offline_access_expired").catch(() => undefined);
    }, remaining);

    return () => clearTimeout(timeout);
  }, [requireRevalidation, session]);

  useEffect(() => {
    const token = session?.tokens.token;
    if (!token) return;

    const expiresAt = getAuthTokenExpiresAt(token);
    if (!expiresAt) return;

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      setTimeReference(Date.now());
      return;
    }

    const timeout = setTimeout(() => setTimeReference(Date.now()), remaining);
    return () => clearTimeout(timeout);
  }, [session?.tokens.token]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextState => {
      const currentSession = sessionRef.current;
      setTimeReference(Date.now());
      if (
        nextState === "active" &&
        currentSession &&
        !isWithinOfflineWindow(currentSession, Date.now())
      ) {
        void requireRevalidation("offline_access_expired").catch(() => undefined);
      }
    });

    return () => subscription.remove();
  }, [requireRevalidation]);

  useEffect(
    () => registerAuthenticatedRequestRejectedHandler(rejectedToken => {
      void requireRevalidation("server_rejected_session", rejectedToken).catch(() => undefined);
    }),
    [requireRevalidation],
  );

  const login = useCallback(async (nextSession: AuthSessionRecord) => {
    if (Date.now() >= nextSession.offlineValidUntil) {
      throw new Error("A autorização offline recebida já está expirada.");
    }

    const previousSession = sessionRef.current;
    sessionRef.current = nextSession;

    try {
      const persistedSession: PersistedAuthSession = {
        ...nextSession,
        version: 1,
      };
      await SecureStore.setItemAsync(
        ACTIVE_SESSION_STORAGE_KEY,
        JSON.stringify(persistedSession),
        { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
      );
      if (nextSession.mode === "online") {
        await clearOfflineAuthBlock(nextSession.user.id);
      }
    } catch (error) {
      await removeActiveSessionIfTokenMatches(nextSession.tokens.token).catch(() => undefined);
      sessionRef.current = previousSession;
      throw error;
    }

    setRevalidationEmail(undefined);
    setRevalidationReason(undefined);
    setTimeReference(Date.now());
    queryClient.clear();
    updateSession(nextSession);
  }, [queryClient, updateSession]);

  const logout = useCallback(async () => {
    const previousSession = sessionRef.current;
    sessionRef.current = undefined;

    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACTIVE_SESSION_STORAGE_KEY),
        removeLegacySession(),
      ]);
    } catch (error) {
      sessionRef.current = previousSession;
      throw error;
    }

    setSession(undefined);
    setRevalidationEmail(undefined);
    setRevalidationReason(undefined);
    queryClient.clear();
  }, [queryClient]);

  const forgetCurrentUser = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;

    let forgetError: unknown;
    try {
      await onForgetOfflineUser(currentSession.user.id);
      await clearOfflineAuthBlock(currentSession.user.id);
    } catch (error) {
      forgetError = error;
    }

    await logout();
    if (forgetError) throw forgetError;
  }, [logout, onForgetOfflineUser]);

  const canUseRemoteApi = Boolean(
    session &&
    isOnline &&
    !isAuthTokenExpired(session.tokens.token, timeReference),
  );
  const value = useMemo<AuthSessionContextValue>(
    () => ({
      canUseRemoteApi,
      forgetCurrentUser,
      isAuthenticated: Boolean(session),
      isLoading,
      login,
      logout,
      offlineValidUntil: session?.offlineValidUntil,
      refreshToken: session?.tokens.refreshToken,
      revalidationEmail,
      revalidationReason,
      sessionMode: session ? (canUseRemoteApi ? "online" : "offline") : undefined,
      token: session?.tokens.token,
      user: session?.user,
      userId: session?.user.id,
    }),
    [canUseRemoteApi, forgetCurrentUser, isLoading, login, logout, revalidationEmail, revalidationReason, session],
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

function parsePersistedAuthSession(serialized: string | null): AuthSessionRecord | null {
  if (!serialized) return null;

  try {
    const value = JSON.parse(serialized) as Partial<PersistedAuthSession>;
    if (
      value.version !== 1 ||
      typeof value.lastOnlineValidatedAt !== "number" ||
      typeof value.offlineValidUntil !== "number" ||
      value.offlineValidUntil <= value.lastOnlineValidatedAt ||
      value.offlineValidUntil - value.lastOnlineValidatedAt > MAX_OFFLINE_AUTH_DURATION_MS ||
      (value.mode !== "offline" && value.mode !== "online") ||
      !isAuthUser(value.user) ||
      !isAuthTokens(value.tokens)
    ) {
      return null;
    }

    return {
      lastOnlineValidatedAt: value.lastOnlineValidatedAt,
      mode: value.mode,
      offlineValidUntil: value.offlineValidUntil,
      tokens: value.tokens,
      user: value.user,
    };
  } catch {
    return null;
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!isRecord(value)) return false;
  return typeof value.id === "number" && Number.isInteger(value.id) && value.id > 0;
}

function isAuthTokens(value: unknown): value is AuthSessionRecord["tokens"] {
  if (!isRecord(value) || typeof value.token !== "string" || !value.token) return false;
  return value.refreshToken == null || typeof value.refreshToken === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWithinOfflineWindow(session: AuthSessionRecord, now: number) {
  return now + MAX_CLOCK_SKEW_MS >= session.lastOnlineValidatedAt && now < session.offlineValidUntil;
}

async function removeLegacySession() {
  await Promise.all([
    SecureStore.deleteItemAsync(LEGACY_AUTH_TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(LEGACY_AUTH_REFRESH_TOKEN_STORAGE_KEY),
  ]);
}

async function removeActiveSessionIfTokenMatches(expectedToken: string) {
  const serialized = await SecureStore.getItemAsync(ACTIVE_SESSION_STORAGE_KEY);
  const storedSession = parsePersistedAuthSession(serialized);
  if (!storedSession || storedSession.tokens.token === expectedToken) {
    await SecureStore.deleteItemAsync(ACTIVE_SESSION_STORAGE_KEY);
  }
}
