/**
 * Typed access to public environment variables (NEXT_PUBLIC_*).
 * In the browser these are inlined at **build** time — set them in `.env.local` (dev)
 * or Docker build args / CI for production images.
 */

const rawPublicApiUrl = (): string =>
  (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    ""
  );

export const env = {
  /**
   * Backend API origin (no path suffix). Prefer `NEXT_PUBLIC_API_URL`.
   * `NEXT_PUBLIC_API_BASE_URL` is supported as a deprecated alias.
   */
  get publicApiUrl(): string {
    return rawPublicApiUrl();
  },
} as const;

/**
 * API base for Axios `baseURL`:
 * - Absolute URL (e.g. `http://localhost:8080`) — browser calls API directly.
 * - Root-relative path (e.g. `/api/backend`) — same-origin; Next rewrites to `BACKEND_INTERNAL_URL` (Docker).
 */
export function getApiBaseUrl(): string {
  const url = rawPublicApiUrl();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. For local dev: copy web/.env.example to web/.env.local. " +
        "For Docker Compose: use build-arg NEXT_PUBLIC_API_URL=/api/backend and BACKEND_INTERNAL_URL=http://api:8081.",
    );
  }
  if (url.startsWith("/")) {
    return url === "/" ? url : url.replace(/\/$/, "");
  }
  return url.replace(/\/$/, "");
}
