# Stage 1: Prune the monorepo for just @archvault/web
FROM node:24-alpine AS pruner
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm add -g turbo
WORKDIR /app
COPY . .
RUN turbo prune @archvault/web --docker

# Stage 2: Install dependencies from pruned lockfile
FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Stage 3: Build from full pruned source
FROM node:24-alpine AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@archvault/web

# Stage 4: Production runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
