type ApiRequestParams = {
  query?: Record<string, unknown>;
  token?: string;
};

type ApiBodyRequestParams<TBody> = ApiRequestParams & {
  body?: TBody;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function apiGet<TResponse>(path: string, params: ApiRequestParams = {}) {
  return apiRequest<TResponse>(path, { method: "GET", query: params.query, token: params.token });
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  params: ApiBodyRequestParams<TBody> = {},
) {
  return apiRequest<TResponse>(path, {
    body: params.body,
    method: "POST",
    query: params.query,
    token: params.token,
  });
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
  params: ApiRequestParams & { body?: unknown; method: "GET" | "POST" },
) {
  const url = buildUrl(path, params.query);
  const token = params.token || API_TOKEN;

  const response = await fetch(url, {
    method: params.method,
    headers: {
      Accept: "application/json",
      ...(params.body == null ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(params.body == null ? {} : { body: JSON.stringify(params.body) }),
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return response.json() as Promise<TResponse>;
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
    return body?.message ?? body?.error ?? "Erro ao carregar dados da API.";
  } catch {
    return "Erro ao carregar dados da API.";
  }
}
