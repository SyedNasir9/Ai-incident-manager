# Deployment notes

## Environment variables (web)

| Variable | Where | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | `.env.local` (dev) or **Docker build-arg** | API base for Axios: absolute URL **or** path `/api/backend` (compose proxy). |
| `NEXT_PUBLIC_API_BASE_URL` | Optional | Deprecated alias of `NEXT_PUBLIC_API_URL`. |
| `BACKEND_INTERNAL_URL` | **Docker build-arg** (optional) | e.g. `http://api:8080` — enables Next rewrites from `/api/backend/*` to the API **service name** (baked at build). |

- **Local dev:** `cd web && cp .env.example .env.local` and set `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8081`).
- **Docker Compose:** `frontend` build uses `NEXT_PUBLIC_API_URL=/api/backend` and `BACKEND_INTERNAL_URL=http://api:8080` so the **browser** stays same-origin while the **Next server** proxies to `api`.
- **Docker:** `NEXT_PUBLIC_*` and rewrite config are embedded at **image build** time. Rebuild `frontend` when these change.

## Docker

### API only (existing root `Dockerfile`)

```bash
docker build -t incident-manager-api .
docker run -p 8081:8081 incident-manager-api
```

### API + frontend (`docker-compose.yml`)

```bash
docker compose up --build
```

- **frontend:** http://localhost:3000  
- **api:** http://localhost:8081 (direct from host)

The **frontend** image is built so the UI calls `/api/backend/...` on the same host/port; Next.js rewrites those requests to **`http://api:8080/...`** inside the compose network.

If users reach the UI from another hostname, you may need a public API URL or a reverse proxy instead of this pattern.

### Web image alone

```bash
docker build -f web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t incident-manager-web web
docker run -p 3000:3000 incident-manager-web
```

## No hardcoded API hosts

All HTTP calls go through `getApiClient()` → `getApiBaseUrl()` in `web/lib/env.ts`, which reads only `NEXT_PUBLIC_API_URL` (or the legacy alias).
