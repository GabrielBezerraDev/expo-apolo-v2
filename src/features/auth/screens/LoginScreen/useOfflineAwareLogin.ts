import { useCallback } from "react";
import { isApiNetworkError } from "@shared/services/apiClient";
import { getAuthUserFromToken, useAuthSession } from "@shared/services/authSession";
import { useNetworkState } from "@shared/services/network";
import type { LoginFormData } from "../../protocol";
import { normalizeAuthTokens } from "../../protocol";
import {
  authenticateOfflineUser,
  cacheOnlineAuthUser,
  clearRememberedCredentials,
  OfflineAuthError,
  saveRememberedCredentials,
} from "../../services";
import { useLoginMutation } from "./useLoginMutation";

export function useOfflineAwareLogin() {
  const { hasCheckedNetwork, isOnline } = useNetworkState();
  const {
    login,
    revalidationEmail,
    revalidationReason,
  } = useAuthSession();
  const loginMutation = useLoginMutation();
  const { isPending, mutateAsync } = loginMutation;

  const authenticate = useCallback(async (data: LoginFormData) => {
    const email = data.email.trim().toLowerCase();
    let session;

    if (!hasCheckedNetwork || isOnline) {
      let response;
      try {
        response = await mutateAsync({
          email,
          password: data.password,
        });
      } catch (error) {
        if (!isApiNetworkError(error)) throw error;
        assertOfflineFallbackAllowed(revalidationReason);
        session = await authenticateOfflineUser({ email, password: data.password });
      }

      if (response) {
        const tokens = normalizeAuthTokens(response);
        const user = getAuthUserFromToken(tokens.token, email);
        session = await cacheOnlineAuthUser({
          email,
          password: data.password,
          tokens,
          user,
        });
      }
    } else {
      assertOfflineFallbackAllowed(revalidationReason);
      session = await authenticateOfflineUser({ email, password: data.password });
    }

    if (!session) {
      throw new Error("Não foi possível iniciar a sessão do usuário.");
    }

    await persistRememberedCredentialsPreference({
      email,
      password: data.password,
      remember: data.remember,
    }).catch(() => undefined);
    await login(session);
  }, [hasCheckedNetwork, isOnline, login, mutateAsync, revalidationReason]);

  return {
    authenticate,
    isPending,
    revalidationEmail,
    revalidationReason,
  };
}

function assertOfflineFallbackAllowed(revalidationReason?: string) {
  if (!revalidationReason) return;

  throw new OfflineAuthError(
    "offline_access_expired",
    "Este usuário precisa fazer login novamente com acesso à internet.",
  );
}

async function persistRememberedCredentialsPreference({
  email,
  password,
  remember,
}: {
  email: string;
  password: string;
  remember: boolean;
}) {
  if (remember) {
    await saveRememberedCredentials({ email, password });
    return;
  }

  await clearRememberedCredentials();
}
