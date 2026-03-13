# Phase 6b — Soft Delete & Trash

## Status: Not Started

## Goal
Implement soft delete with trash UI for recovering deleted items.

## Prerequisites
- Phases 5a, 5b, 5c — complete

## Tasks
- [ ] Ensure all queries filter `WHERE deleted_at IS NULL` by default
- [ ] Soft delete for: elements, relationships, diagrams, workspaces
- [ ] Cascade soft delete (e.g., deleting workspace soft-deletes its elements)
- [ ] Trash UI page listing all soft-deleted items
- [ ] Restore from trash (set `deleted_at = NULL`)
- [ ] Permanent delete after retention period (configurable)
- [ ] Trash count badge in sidebar

## Key Files
- `src/lib/server/trash.ts` — trash server functions
- `src/routes/_protected/workspace/$workspaceSlug/trash.tsx` — trash page
- `src/components/trash/trash-list.tsx` — deleted items list

## Verification
- [ ] Deleting an item sets `deleted_at`, doesn't remove row
- [ ] Deleted items don't appear in normal queries
- [ ] Trash page lists all deleted items
- [ ] Restore brings items back
- [ ] `pnpm dev` and `pnpm build` succeed
