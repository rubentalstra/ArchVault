# Phase 6a — Activity Log & Search

## Status: Not Started

## Goal
Add activity logging and full-text search across the platform.

## Prerequisites
- Phases 5a, 5b, 5c — complete

## Tasks
- [ ] Drizzle schema for `activity_log` table
- [ ] Run migration
- [ ] Activity logging on all CRUD operations (elements, relationships, diagrams, workspaces, blocks)
- [ ] Activity log page with TanStack Table + Virtual (user, action, entity, timestamp)
- [ ] Activity filters (by user, action type, entity type, date range)
- [ ] Full-text search using PostgreSQL `tsvector`
- [ ] Search input with TanStack Pacer debounce (300ms)
- [ ] Search results page

## CLI Commands
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `src/lib/schema/activity-log.ts` — Drizzle schema
- `src/lib/server/activity.ts` — logging + query server functions
- `src/routes/_protected/workspace/$workspaceSlug/activity.tsx` — activity page
- `src/components/activity/activity-table.tsx` — activity list
- `src/components/search/global-search.tsx` — search component

## Verification
- [ ] CRUD operations create activity log entries
- [ ] Activity table shows entries with filtering
- [ ] Full-text search returns relevant results
- [ ] Search debounce works (300ms)
- [ ] `pnpm dev` and `pnpm build` succeed
