import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthTokens } from "@features/auth/protocol";

const AUTH_TOKEN_STORAGE_KEY = "@valorlog:authToken";
const AUTH_REFRESH_TOKEN_STORAGE_KEY = "@valorlog:refreshToken";

type AuthSessionContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken?: string;
  token?: string;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

type AuthSessionProviderProps = PropsWithChildren;

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    let active = true;

    async function loadStoredSession() {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        const storedRefreshToken = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);

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

  const login = useCallback(async (tokens: AuthTokens) => {
    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, tokens.token);

    if (tokens.refreshToken) {
      await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    } else {
      await AsyncStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
    }

    setToken(tokens.token);
    setRefreshToken(tokens.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);

    setToken(undefined);
    setRefreshToken(undefined);
  }, []);

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
