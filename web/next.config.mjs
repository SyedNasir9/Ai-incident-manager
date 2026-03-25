function stripTrailingSlash(s) {
  return s.replace(/\/$/, "");
}

/**
 * Upstream Go API from inside the Docker network (e.g. http://api:8080).
 * Set at **build** time when using the compose proxy pattern so rewrites are baked into the build.
 */
const backendInternalUrl = process.env.BACKEND_INTERNAL_URL?.trim()
  ? stripTrailingSlash(process.env.BACKEND_INTERNAL_URL.trim())
  : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (!backendInternalUrl) {
      return [];
    }
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
