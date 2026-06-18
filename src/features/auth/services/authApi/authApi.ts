import { apiPost } from "@shared/services/apiClient";
import { LoginRequest, LoginResponse } from "../../protocol";

export function loginRequest(body: LoginRequest) {
  return apiPost<LoginResponse, LoginRequest>("/auth/login", { body });
}
