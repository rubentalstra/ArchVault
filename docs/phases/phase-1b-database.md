# Phase 1b — Database & Docker

## Status: Complete

## Goal
Set up PostgreSQL 16 via Docker Compose, Drizzle ORM, and the initial database connection.

## Prerequisites
- Phase 1a (Project Scaffold) — complete

## Tasks
- [x]Create `compose.yaml` with app + PostgreSQL 16 services
- [x]Create `.env.example` with all required environment variables
- [x]Create `.env` (gitignored) from `.env.example`
- [x]Install Drizzle: `pnpm add drizzle-orm pg` + `pnpm add -D drizzle-kit @types/pg`
- [x]Create `src/lib/database.ts` (Drizzle + pg Pool)
- [x]Create `drizzle.config.ts`
- [x]Create initial `src/lib/schema/index.ts` barrel export
- [x]Run first migration to verify database connection
- [x]Add `Dockerfile` for the app (multi-stage build)

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
- [x]`docker compose up -d db` → PostgreSQL starts and is reachable
- [x]Drizzle migration runs successfully
- [x]`src/lib/database.ts` exports a working `db` instance
- [x]`pnpm dev` still works
