import { isApiError } from "@/lib/api-error";

const MAX_ATTEMPTS = 3;

/**
 * Retry transient failures; skip client errors that won’t succeed on repeat.
 */
export function queryShouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_ATTEMPTS) {
    return false;
  }

  if (isApiError(error)) {
    const s = error.status;
    if (s === 404 || s === 401 || s === 403) {
      return false;
    }
    if (s != null && s >= 400 && s < 500 && s !== 408 && s !== 429) {
      return false;
    }
  }

  return true;
}

export function queryRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 8_000);
}
