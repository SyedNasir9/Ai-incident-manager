# Incident Manager — Web Console

Next.js 14 (App Router), TypeScript, Tailwind CSS.

## Setup

```bash
cd web
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your Go API origin (no trailing slash), e.g. http://localhost:8081
npm install
npm run dev
```

Next.js loads **`.env.local`** automatically (gitignored). See `.env.example` for all variables.

Open [http://localhost:3000](http://localhost:3000) (redirects to `/incidents`).

## API URL

- Use **`NEXT_PUBLIC_API_URL`** only (must be reachable from the **browser**).
- **`NEXT_PUBLIC_API_BASE_URL`** is an optional deprecated alias.

## Docker

Production image (`next build` + `next start`, multi-stage):

```bash
docker build -f Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:8081 -t incident-manager-web .
```

Run: `docker run -p 3000:3000 incident-manager-web`

See repository root **`DEPLOYMENT.md`** for `docker compose` and production notes.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

## Structure

- `app/` — routes (App Router)
- `components/` — UI (layout under `components/layout/`)
- `lib/` — env + Axios client
- `services/` — API service layer
- `types/` — shared TypeScript types
- `hooks/` — shared React hooks
