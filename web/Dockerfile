# Production image: `next build` + `next start` (multi-stage, slim runtime).
#
# Build args:
#   NEXT_PUBLIC_API_URL — required (e.g. http://localhost:8081 or /api/backend for compose proxy)
#   BACKEND_INTERNAL_URL — optional; when set, enables /api/backend → upstream rewrite (e.g. http://api:8081)
#
# Examples:
#   docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8081 -t incident-manager-web ./web
#   docker compose build frontend

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- dependencies (full install for build tools) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG BACKEND_INTERNAL_URL
ENV BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL}

RUN test -n "$NEXT_PUBLIC_API_URL" \
  || (echo "ERROR: build-arg NEXT_PUBLIC_API_URL is required" >&2 && exit 1)

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- production runtime (prod deps only + build output) ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./

RUN chown -R nextjs:nodejs /app/node_modules /app/package.json /app/package-lock.json

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Bind on all interfaces for Docker; `next start` uses PORT
CMD ["./node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
