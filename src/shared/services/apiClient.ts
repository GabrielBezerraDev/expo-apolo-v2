import { useMemo } from "react";
import { useAuthSession } from "@shared/services/authSession";
import { getCurrentDevicePushToken } from "@shared/services/pushNotifications/devicePushToken";

type ApiRequestParams = {
  query?: Record<string, unknown>;
};

type ApiBodyRequestParams<TBody> = ApiRequestParams & {
  body?: TBody;
};

type ApiRequestOptions = ApiRequestParams & {
  authToken?: string;
  body?: unknown;
  method: "DELETE" | "GET" | "POST";
};

export type ApiClient = {
  delete: <TResponse, TBody = unknown>(
    path: string,
    params?: ApiBodyRequestParams<TBody>,
  ) => Promise<TResponse>;
  get: <TResponse>(path: string, params?: ApiRequestParams) => Promise<TResponse>;
  hasAuthToken: boolean;
  post: <TResponse, TBody = unknown>(
    path: string,
    params?: ApiBodyRequestParams<TBody>,
  ) => Promise<TResponse>;
  postFormData: <TResponse>(
    path: string,
    params?: ApiBodyRequestParams<FormData>,
  ) => Promise<TResponse>;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const DEFAULT_API_TIMEOUT_MS = 20_000;
const FORM_DATA_API_TIMEOUT_MS = 180_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function isApiTimeoutError(error: unknown) {
  return error instanceof ApiError && error.status === 408;
}

export function isApiValidationError(error: unknown) {
  return error instanceof ApiError && [400, 409, 422].includes(error.status);
}

export function isApiNetworkError(error: unknown) {
  if (isApiTimeoutError(error)) return true;
  if (error instanceof ApiError) return error.status === 0;

  return error instanceof TypeError;
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  params: ApiBodyRequestParams<TBody> = {},
) {
  return apiRequest<TResponse>(path, {
    body: params.body,
    method: "POST",
    query: params.query,
  });
}

export function useApiClient(): ApiClient {
  const { token } = useAuthSession();

  return useMemo(
    () => ({
      delete: <TResponse, TBody = unknown>(
        path: string,
        params: ApiBodyRequestParams<TBody> = {},
      ) =>
        apiRequest<TResponse>(path, {
          authToken: token,
          body: params.body,
          method: "DELETE",
          query: params.query,
        }),
      get: <TResponse>(path: string, params: ApiRequestParams = {}) =>
        apiRequest<TResponse>(path, {
          authToken: token,
          method: "GET",
          query: params.query,
        }),
      hasAuthToken: Boolean(token),
      post: <TResponse, TBody = unknown>(
        path: string,
        params: ApiBodyRequestParams<TBody> = {},
      ) =>
        apiRequest<TResponse>(path, {
          authToken: token,
          body: params.body,
          method: "POST",
          query: params.query,
        }),
      postFormData: <TResponse>(
        path: string,
        params: ApiBodyRequestParams<FormData> = {},
      ) =>
        apiRequest<TResponse>(path, {
          authToken: token,
          body: params.body,
          method: "POST",
          query: params.query,
        }),
    }),
    [token],
  );
}

export function hasApiBaseUrl() {
  return API_BASE_URL.trim().length > 0;
}

function buildUrl(path: string, query?: Record<string, unknown>) {
  if (!hasApiBaseUrl()) {
    throw new ApiError("Configure EXPO_PUBLIC_API_URL para carregar os dados da API.", 0);
  }
 
  const url = `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const queryString = buildQueryString(query);
  return queryString ? `${url}?${queryString}` : url;
}

async function apiRequest<TResponse>(
  path: string,
  params: ApiRequestOptions,
) {
  const url = buildUrl(path, params.query);
  const isFormData = isFormDataBody(params.body);
  const requestBody = buildRequestBody(params.body);
  const devicePushToken = getCurrentDevicePushToken();
  const controller = new AbortController();
  const timeoutMs = isFormData ? FORM_DATA_API_TIMEOUT_MS : DEFAULT_API_TIMEOUT_MS;
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method: params.method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(params.body == null || isFormData ? {} : { "Content-Type": "application/json" }),
        ...(params.authToken ? { Authorization: `Bearer ${params.authToken}` } : {}),
        ...(devicePushToken ? { "X-Device-Token": devicePushToken } : {}),
      },
      ...(requestBody == null ? {} : { body: requestBody }),
    });

    if (!response.ok) {
      throw new ApiError(await getErrorMessage(response), response.status);
    }

    return response.json() as Promise<TResponse>;
  } catch (error) {
    if (didTimeout) {
      throw new ApiError("Tempo limite da requisição excedido.", 408);
    }

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildRequestBody(body: unknown): BodyInit | undefined {
  if (body == null) return undefined;
  if (isFormDataBody(body)) return body;

  return JSON.stringify(body);
}

function buildQueryString(query?: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    appendQueryParam(params, key, value);
  });

  return params.toString();
}

function appendQueryParam(params: URLSearchParams, key: string, value: unknown) {
  if (value == null || value === "") return;

  if (Array.isArray(value)) {
    if (value.length === 0) return;
    params.append(key, value.join(","));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
      appendQueryParam(params, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  params.append(key, String(value));
}

async function getErrorMessage(response: Response) {
  try {
    const body = await response.json();
    const message = body?.message ?? body?.error;

    if (Array.isArray(message)) {
      return message
        .filter((item): item is string => typeof item === "string")
        .map(translateLegacyApiMessage)
        .join("\n") || "Não foi possível processar a solicitação.";
    }

    return typeof message === "string"
      ? translateLegacyApiMessage(message)
      : "Erro ao carregar dados da API.";
  } catch {
    return "Erro ao carregar dados da API.";
  }
}

function translateLegacyApiMessage(message: string) {
  const translations: Record<string, string> = {
    "Internal server error": "Erro interno do servidor.",
    "Server error": "Erro interno do servidor.",
    "Unauthorized": "Não autorizado.",
    "User does not exist": "E-mail ou senha inválidos.",
  };

  const normalizedMessage = message.trim();
  return translations[normalizedMessage] ?? normalizedMessage;
}
