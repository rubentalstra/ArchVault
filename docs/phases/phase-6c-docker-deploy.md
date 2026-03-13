# Phase 6c — Docker Deployment

## Status: Not Started

## Goal
Finalize Docker configuration for production deployment.

## Prerequisites
- Phases 5a, 5b, 5c — complete

## Tasks
- [ ] Finalize `Dockerfile` with multi-stage build (deps → build → runtime)
- [ ] Finalize `compose.yaml` with production config
- [ ] Add health check endpoints
- [ ] Configure volumes for PostgreSQL data persistence
- [ ] Environment variable documentation
- [ ] Production `.env.example` with all required vars
- [ ] Test full `docker compose up` from clean state

## Key Files
- `Dockerfile` — multi-stage production build
- `compose.yaml` — production Docker Compose
- `.env.example` — documented env vars

## Verification
- [ ] `docker compose build` succeeds
- [ ] `docker compose up` starts app + database
- [ ] App accessible at configured port
- [ ] Health checks pass
- [ ] Data persists across restarts (PostgreSQL volume)
