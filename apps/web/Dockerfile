# Stage 1: Prune the monorepo for just @archvault/web
FROM node:24-alpine AS pruner
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
COPY . .
ENV TURBO_TELEMETRY_DISABLED=1
RUN pnpm dlx turbo prune @archvault/web --docker

# Stage 2: Install dependencies from pruned lockfile
FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Stage 3: Build from full pruned source
FROM node:24-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .
ENV TURBO_TELEMETRY_DISABLED=1
RUN pnpm turbo build --filter=@archvault/web

# Stage 4: Production runner
FROM node:24-alpine AS runner

ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}

LABEL org.opencontainers.image.source="https://github.com/rubentalstra/Archvault"
LABEL org.opencontainers.image.description="ArchVault — Visual C4 architecture platform"
LABEL org.opencontainers.image.licenses="AGPL-3.0"
LABEL org.opencontainers.image.url="https://archvault.dev"

RUN addgroup -g 1001 archvault && adduser -u 1001 -G archvault -s /bin/sh -D archvault

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build --chown=archvault:archvault /app/apps/web/.output ./.output
COPY --from=build --chown=archvault:archvault /app/apps/web/drizzle ./drizzle
COPY --from=build --chown=archvault:archvault /app/apps/web/migrate.mjs ./migrate.mjs
COPY --from=build --chown=archvault:archvault /app/apps/web/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

USER archvault

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/api/health').then(r=>{if(!r.ok)throw 1}).catch(()=>process.exit(1))"]

ENTRYPOINT ["./docker-entrypoint.sh"]
