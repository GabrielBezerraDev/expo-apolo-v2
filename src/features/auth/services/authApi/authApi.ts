import { useMemo } from "react";
import { apiPost, useApiClient } from "@shared/services/apiClient";
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
} from "../../protocol";

export function loginRequest(body: LoginRequest) {
  return apiPost<LoginResponse, LoginRequest>("/auth/login", { body });
}

export function useAuthApi() {
  const apiClient = useApiClient();

  return useMemo(
    () => ({
      changePassword: (body: ChangePasswordRequest) =>
        apiClient.patch<ChangePasswordResponse, ChangePasswordRequest>(
          "/auth/change-password",
          { body },
        ),
    }),
    [apiClient],
  );
}
