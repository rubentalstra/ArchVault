# Phase 7e — Docker Deploy & GHCR Publishing

## Status: Complete

## Goal

Production-ready Docker deployment pipeline so users can self-host ArchVault by pulling a pre-built image from GitHub Container Registry (`ghcr.io/rubentalstra/archvault`). Includes security hardening, OCI metadata, health checks, auto-migration, and CI/CD publishing.

## Prerequisites

- Phase 1b (Database) — complete
- Phase 7a (Import & Export) — complete

## Deliverables

### Infrastructure

- [x] `.dockerignore` — exclude unnecessary files from Docker build context
- [x] `apps/web/Dockerfile` — 4-stage build with non-root user, OCI labels, health check, entrypoint, pinned pnpm
- [x] `apps/web/migrate.mjs` — standalone Drizzle migration script (no drizzle-kit in production)
- [x] `apps/web/docker-entrypoint.sh` — container entrypoint (auto-migrate + start)
- [x] `apps/web/src/routes/api/health.ts` — health check endpoint (`GET /api/health`)

### Deployment

- [x] `compose.prod.yaml` — production Docker Compose (app + PostgreSQL, dedicated network, no exposed DB ports)
- [x] `.env.production.example` — documented env var template for self-hosters

### CI/CD

- [x] `.github/workflows/docker-publish.yml` — GitHub Actions workflow for GHCR publishing
  - Push to `main` → `latest` + SHA tags
  - Push `v*` tag → semver tags (`1.2.3`, `1.2`, `1`, `latest`)
  - PRs → build-only (no push), filtered to relevant paths
  - Multi-platform: `linux/amd64` + `linux/arm64`
  - GHA cache with `mode=max`
  - Concurrency control (cancel in-progress on same ref)

### Documentation

- [x] `apps/docs/.../docker-compose-production.mdx` — full self-hosting guide
- [x] `apps/docs/.../environment-variables.mdx` — complete env var reference
- [x] `apps/docs/.../upgrading.mdx` — upgrade & rollback procedure
- [x] `apps/docs/.../logs-and-health.mdx` — health endpoint & log access docs

## Verification

- [x] `GET /api/health` returns `{ status: "healthy" }` with DB connectivity
- [x] `docker build -f apps/web/Dockerfile .` — image builds successfully
- [x] `docker compose -f compose.prod.yaml up` — full stack starts
- [x] Container runs as non-root user (UID 1001)
- [x] `AUTO_MIGRATE=true` runs migrations on startup
- [x] `AUTO_MIGRATE=false` skips migrations
- [x] Health check passes in Docker (`docker inspect --format='{{.State.Health.Status}}'`)
- [x] Data persists across container restarts (PostgreSQL volume)
- [x] GitHub Actions workflow builds on PR, builds + pushes on main
