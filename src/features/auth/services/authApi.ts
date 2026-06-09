import { apiPost } from "@shared/services/apiClient";
import { LoginRequest, LoginResponse } from "../types/authTypes";

export function loginRequest(body: LoginRequest) {
  return apiPost<LoginResponse, LoginRequest>("/auth/login", { body });
}
