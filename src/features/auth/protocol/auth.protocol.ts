export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthTokenResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
};

export type LoginResponse = AuthTokenResponse;

export type AuthTokens = {
  refreshToken?: string;
  token: string;
};

export function normalizeAuthTokens(response: AuthTokenResponse): AuthTokens {
  const token = response.token ?? response.accessToken;

  if (!token) {
    throw new Error("Resposta de login sem token.");
  }

  return {
    refreshToken: response.refreshToken,
    token,
  };
}
