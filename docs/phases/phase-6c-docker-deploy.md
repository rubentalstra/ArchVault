# Phase 6c — Docker Deployment

## Status: Not Started

## Goal

Finalize Docker configuration for production self-hosted deployment with proper security, monitoring, and backup.

## Prerequisites

- Phases 5a, 5b, 5c — complete

## Tasks

### Dockerfile

- [ ] Multi-stage build:
    - **Stage 1 (deps):** Install pnpm dependencies
    - **Stage 2 (build):** Build the app (`pnpm build`)
    - **Stage 3 (runtime):** Copy built output to minimal Node.js image (e.g., `node:22-alpine`)
- [ ] Non-root user in runtime stage (`USER node`)
- [ ] `.dockerignore` to exclude node_modules, .git, tests, docs
- [ ] Target image size < 200MB

### Docker Compose (Production)

- [ ] `compose.yaml` with services:
    - **app:** The Archvault application (Nitro server)
    - **db:** PostgreSQL 16 with named volume for data persistence
    - **caddy** (optional): Reverse proxy with automatic HTTPS via Let's Encrypt
- [ ] Health check on app service (`/api/health` endpoint)
- [ ] Health check on db service (`pg_isready`)
- [ ] Restart policy: `unless-stopped` for all services
- [ ] Resource limits (memory, CPU) as comments/examples
- [ ] Network: internal network for app↔db, exposed network for caddy↔app

### Health Check Endpoints

- [ ] `GET /api/health` — basic liveness check (returns 200)
- [ ] `GET /api/health/ready` — readiness check (verifies DB connection)
- [ ] Response format: `{ status: "ok", version: "x.y.z", uptime: 123 }`

### Environment Configuration

- [ ] `.env.example` with all required and optional variables:
    ```env
    # Required
    DATABASE_URL=postgresql://archvault:password@db:5432/archvault
    BETTER_AUTH_SECRET=<generate-with-openssl-rand>
    BETTER_AUTH_URL=https://your-domain.com

    # Optional
    GITHUB_CLIENT_ID=           # For GitHub OAuth
    GITHUB_CLIENT_SECRET=
    GOOGLE_CLIENT_ID=           # For Google OAuth
    GOOGLE_CLIENT_SECRET=
    SMTP_HOST=                  # For email (OTP, invitations)
    SMTP_PORT=587
    SMTP_USER=
    SMTP_PASS=
    SMTP_FROM=noreply@your-domain.com
    ```
- [ ] Document each variable with description and how to generate secrets

### Database Management

- [ ] Named volume for PostgreSQL data (`archvault-db-data`)
- [ ] Backup script: `scripts/backup-db.sh` (pg_dump to timestamped file)
- [ ] Restore script: `scripts/restore-db.sh` (pg_restore from backup file)
- [ ] Migration on startup: app runs `drizzle-kit migrate` before starting the server

### Monitoring & Logging

- [ ] Structured JSON logging in production (not pretty-printed)
- [ ] Log levels configurable via `LOG_LEVEL` env var
- [ ] Request logging with timing (Nitro middleware)
- [ ] Error tracking: unhandled exceptions logged with stack trace

## Key Files

- `Dockerfile` — multi-stage production build
- `compose.yaml` — production Docker Compose
- `.env.example` — documented environment variables
- `scripts/backup-db.sh` — database backup script
- `scripts/restore-db.sh` — database restore script
- `src/routes/api/health.ts` — health check endpoint

## Verification

- [ ] `docker compose build` succeeds (image < 200MB)
- [ ] `docker compose up` starts app + database from clean state
- [ ] Health checks pass (`/api/health` and `/api/health/ready`)
- [ ] App accessible at configured port
- [ ] Data persists across container restarts (PostgreSQL volume)
- [ ] Migrations run automatically on startup
- [ ] Backup script produces valid dump file
- [ ] Restore script successfully restores from backup
- [ ] Structured logs output in production
