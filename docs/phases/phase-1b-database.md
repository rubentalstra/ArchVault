# Phase 1b — Database & Docker

## Status: Not Started

## Goal
Set up PostgreSQL 16 via Docker Compose, Drizzle ORM, and the initial database connection.

## Prerequisites
- Phase 1a (Project Scaffold) — complete

## Tasks
- [ ] Create `compose.yaml` with app + PostgreSQL 16 services
- [ ] Create `.env.example` with all required environment variables
- [ ] Create `.env` (gitignored) from `.env.example`
- [ ] Install Drizzle: `pnpm add drizzle-orm pg` + `pnpm add -D drizzle-kit @types/pg`
- [ ] Create `src/lib/database.ts` (Drizzle + pg Pool)
- [ ] Create `drizzle.config.ts`
- [ ] Create initial `src/lib/schema/index.ts` barrel export
- [ ] Run first migration to verify database connection
- [ ] Add `Dockerfile` for the app (multi-stage build)

## CLI Commands
```bash
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
docker compose up -d db
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `compose.yaml` — Docker Compose (app + PostgreSQL 16)
- `Dockerfile` — multi-stage app build
- `.env.example` — all environment variables documented
- `src/lib/database.ts` — Drizzle + pg Pool connection
- `drizzle.config.ts` — Drizzle Kit configuration
- `src/lib/schema/index.ts` — schema barrel export

## Verification
- [ ] `docker compose up -d db` → PostgreSQL starts and is reachable
- [ ] Drizzle migration runs successfully
- [ ] `src/lib/database.ts` exports a working `db` instance
- [ ] `pnpm dev` still works
