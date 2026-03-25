import axios, { type AxiosError, type AxiosInstance } from "axios";

import { getApiBaseUrl } from "@/lib/env";
import { type ApiErrorBody, toApiError } from "@/lib/api-error";

/**
 * Shared Axios instance for backend API calls.
 * Base URL comes from NEXT_PUBLIC_API_URL (see `.env.example` / Docker build args).
 */
function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30_000,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => {
      return Promise.reject(toApiError(error));
    },
  );

  return instance;
}

let client: AxiosInstance | null = null;

/**
 * Lazy singleton so missing env fails at first request, not import time in tests.
 */
export function getApiClient(): AxiosInstance {
  if (!client) {
    client = createApiClient();
  }
  return client;
}

/** Reset singleton (useful in tests). */
export function resetApiClient(): void {
  client = null;
}

export { ApiError, getUserFacingErrorMessage, isApiError, toApiError } from "@/lib/api-error";
export type { ApiErrorBody } from "@/lib/api-error";
