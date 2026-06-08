export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
};

export type AuthTokens = {
  refreshToken?: string;
  token: string;
};

export function normalizeAuthTokens(response: LoginResponse): AuthTokens {
  const token = response.token ?? response.accessToken;

  if (!token) {
    throw new Error("Resposta de login sem token.");
  }

  return {
    refreshToken: response.refreshToken,
    token,
  };
}
