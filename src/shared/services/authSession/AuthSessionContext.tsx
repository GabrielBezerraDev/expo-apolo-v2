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

type AuthSessionTokens = {
  refreshToken?: string;
  token: string;
};

type AuthSessionContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthSessionTokens) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken?: string;
  token?: string;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

type AuthSessionProviderProps = PropsWithChildren;

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    let active = true;

    async function loadStoredSession() {
      try {
        const storedToken = await getStoredSessionItem(AUTH_TOKEN_STORAGE_KEY);
        const storedRefreshToken = await getStoredSessionItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);

        if (!active) return;

        setToken(storedToken ?? undefined);
        setRefreshToken(storedRefreshToken || undefined);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadStoredSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (tokens: AuthSessionTokens) => {
    await setStoredSessionItem(AUTH_TOKEN_STORAGE_KEY, tokens.token);

    if (tokens.refreshToken) {
      await setStoredSessionItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    } else {
      await removeStoredSessionItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
    }

    setToken(tokens.token);
    setRefreshToken(tokens.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    await removeStoredSessionItem(AUTH_TOKEN_STORAGE_KEY);
    await removeStoredSessionItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);

    setToken(undefined);
    setRefreshToken(undefined);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      refreshToken,
      token,
    }),
    [isLoading, login, logout, refreshToken, token],
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

async function getStoredSessionItem(key: string) {
  return SecureStore.getItemAsync(key);
}

async function setStoredSessionItem(key: string, value: string) {
  return SecureStore.setItemAsync(key, value);
}

async function removeStoredSessionItem(key: string) {
  return SecureStore.deleteItemAsync(key);
}
