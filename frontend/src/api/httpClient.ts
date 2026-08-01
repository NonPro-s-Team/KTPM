import axios, { AxiosError } from "axios";
import {
  AUTH_SESSION_CLEARED_EVENT,
  clearStoredSession,
  readStoredSession,
} from "../store/authSession";
import type {
  ApiError,
  ApiProblemDetails,
  ValidationProblemDetails,
} from "../types/api";

const DEFAULT_ERROR_TITLE = "Không thể hoàn tất yêu cầu";
const DEFAULT_ERROR_DETAIL =
  "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.";

export class ApiClientError extends Error {
  readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.detail);
    this.name = "ApiClientError";
    this.apiError = apiError;
  }
}

function isProblemDetails(value: unknown): value is ValidationProblemDetails {
  return typeof value === "object" && value !== null;
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiClientError) return error.apiError;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiProblemDetails>;
    const problem = isProblemDetails(axiosError.response?.data)
      ? axiosError.response?.data
      : undefined;

    return {
      status: problem?.status ?? axiosError.response?.status,
      title: problem?.title || DEFAULT_ERROR_TITLE,
      detail:
        problem?.detail ||
        (axiosError.response
          ? "Máy chủ từ chối yêu cầu. Vui lòng kiểm tra thông tin và thử lại."
          : DEFAULT_ERROR_DETAIL),
      code: problem?.code,
      traceId: problem?.traceId,
      fieldErrors: problem?.errors,
    };
  }

  if (error instanceof Error) {
    return {
      title: DEFAULT_ERROR_TITLE,
      detail: error.message || DEFAULT_ERROR_DETAIL,
    };
  }

  return { title: DEFAULT_ERROR_TITLE, detail: DEFAULT_ERROR_DETAIL };
}

const PUBLIC_ENDPOINT_PATTERNS = [
  /^auth\/login$/,
  /^auth\/forgot-password$/,
  /^auth\/reset-password$/,
  /^invitations\/accept$/,
  /^invitations\/[^/]+$/,
];

function isPublicEndpoint(url?: string) {
  const path = url?.replace(/^\//, "") ?? "";
  return PUBLIC_ENDPOINT_PATTERNS.some((pattern) => pattern.test(path));
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

httpClient.interceptors.request.use((config) => {
  const session = readStoredSession();
  if (session?.accessToken && !isPublicEndpoint(config.url)) {
    config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error);
    const axiosError = axios.isAxiosError(error) ? error : undefined;

    if (normalized.status === 401 && !isPublicEndpoint(axiosError?.config?.url)) {
      clearStoredSession();
      window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(new ApiClientError(normalized));
  },
);
