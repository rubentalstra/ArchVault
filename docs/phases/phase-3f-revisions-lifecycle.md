# Phase 3f — Revisions & Lifecycle

## Status: Not Started

## Goal
Add diagram revision history and lifecycle state management.

## Prerequisites
- Phase 3c (Editor Interactions) — complete
- Phase 3d (Canvas Relationships) — complete

## Tasks
- [ ] Revision creation: capture immutable `snapshot_json` of current diagram state
- [ ] Auto-increment `revision_number` per diagram
- [ ] Revision history table with TanStack Table + Virtual (number, note, author, date)
- [ ] View/restore previous revision
- [ ] Revision notes (optional text when creating revision)
- [ ] Diagram lifecycle management:
  - `draft` → `in_review` → `approved` → `archived`
  - Only owner/admin can approve or archive
- [ ] Lifecycle action buttons with permission checks
- [ ] Update `current_revision_id` on diagram when new revision is created

## Key Files
- `src/lib/server/diagram-revisions.ts` — revision server functions
- `src/components/editor/revision-history.tsx` — revision list (TanStack Table + Virtual)
- `src/components/editor/lifecycle-actions.tsx` — status transition buttons
- `src/components/editor/create-revision-dialog.tsx` — revision creation with note

## Verification
- [ ] Creating a revision captures full diagram snapshot
- [ ] Revision history lists all versions
- [ ] Viewing a revision shows historical state
- [ ] Lifecycle transitions work with proper permission checks
- [ ] Only owner/admin can approve/archive
- [ ] `pnpm dev` and `pnpm build` succeed
