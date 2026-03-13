# Phase 1f — Workspaces

## Status: Not Started

## Goal
Add workspace CRUD scoped to the active organization.

## Prerequisites
- Phase 1e (Organizations & Teams) — complete

## Tasks
- [ ] Drizzle schema for `workspaces` table (id, organization_id, name, slug, description, status, icon_emoji, settings_json, created_by, deleted_at, created_at, updated_at)
- [ ] Run migration
- [ ] Server functions: create, read, update, delete workspace (scoped to active org)
- [ ] Workspace list in sidebar (filtered by active org)
- [ ] Create workspace form (TanStack Form — name, slug, description, icon)
- [ ] Workspace settings page (TanStack Form)
- [ ] Workspace dashboard/index page
- [ ] Permission checks on all workspace routes (org role-based)
- [ ] Workspace slug validation (unique within org)

## CLI Commands
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `src/lib/schema/workspaces.ts` — Drizzle schema
- `src/lib/server/workspaces.ts` — server functions
- `src/routes/_protected/workspace/$workspaceSlug/index.tsx` — workspace dashboard
- `src/routes/_protected/workspace/$workspaceSlug/settings.tsx` — workspace settings
- `src/components/workspace/create-workspace-dialog.tsx` — creation form
- `src/components/workspace/workspace-sidebar.tsx` — sidebar list

## Verification
- [ ] Create workspace with name + slug
- [ ] Workspace appears in sidebar
- [ ] Workspace settings save correctly
- [ ] Viewers can read but not modify workspace
- [ ] Workspace slug is unique within org
- [ ] `pnpm dev` and `pnpm build` succeed
