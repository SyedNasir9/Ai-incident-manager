import type { AxiosError } from "axios";

import { friendlyMessageForHttpStatus } from "@/lib/friendly-errors";

/** Common error payload from Gin handlers (`gin.H{"error": "..."}`) — not shown to users. */
export interface ApiErrorBody {
  error?: string;
  message?: string;
}

/**
 * Thrown for failed API calls. `message` is always a sanitized, user-safe string.
 * `body` may contain raw response data for logging only — do not render in UI.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  const ax = err as AxiosError<ApiErrorBody>;
  if (ax?.isAxiosError) {
    const status = ax.response?.status;
    const data = ax.response?.data;
    const code = ax.code;
    const friendly = friendlyMessageForHttpStatus(status, code);
    return new ApiError(friendly, status, data, ax);
  }

  if (err instanceof Error) {
    return new ApiError(safeNonApiErrorMessage(err), undefined, undefined, err);
  }

  return new ApiError("Something unexpected happened. Please try again.", undefined, undefined, err);
}

function safeNonApiErrorMessage(err: Error): string {
  if (err.name === "AbortError") {
    return "The request was cancelled.";
  }
  return "Something unexpected happened. Please try again.";
}

/** Use for React Query `error`, error boundaries, etc. Never prints raw backend text. */
export function getUserFacingErrorMessage(err: unknown): string {
  if (isApiError(err)) {
    return err.message;
  }
  if (err instanceof Error) {
    return safeNonApiErrorMessage(err);
  }
  return "Something unexpected happened. Please try again.";
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
