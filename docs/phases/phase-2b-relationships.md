# Phase 2b — Relationships

## Status: Not Started

## Goal
Implement relationships between C4 elements with CRUD and table view.

## Prerequisites
- Phase 2a (Elements) — complete

## Tasks
- [ ] Drizzle schema for `relationships` table (id, workspace_id, source_element_id, target_element_id, description, technology, source_block_installation_id, created_by, updated_by, deleted_at, created_at, updated_at)
- [ ] Run migration
- [ ] Server functions: relationship CRUD with Zod validation
- [ ] Validate source and target elements exist and belong to same workspace
- [ ] Relationship CRUD forms with TanStack Form (source picker, target picker, description, technology)
- [ ] Relationships table with TanStack Table (source, target, description, technology, actions)
- [ ] Permission checks (org role-based)

## CLI Commands
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `src/lib/schema/relationships.ts` — Drizzle schema
- `src/lib/server/relationships.ts` — server functions
- `src/routes/_protected/workspace/$workspaceSlug/relationships.tsx` — relationships page (or tab on elements page)
- `src/components/relationships/relationship-form.tsx` — create/edit form
- `src/components/tables/relationship-columns.tsx` — table column definitions

## Verification
- [ ] Create relationship between two elements
- [ ] Source/target validation works (same workspace, elements exist)
- [ ] Table view shows all relationships with sorting/filtering
- [ ] `pnpm dev` and `pnpm build` succeed
