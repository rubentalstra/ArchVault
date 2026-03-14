# Phase 6b — Trash UI & Permanent Delete

## Status: Not Started

## Goal

Build the trash management UI and permanent delete with retention policy. Note: soft delete filtering
(`WHERE deleted_at IS NULL`) is already implemented in phase 2 base queries — this phase adds the UI and
cleanup logic.

## Prerequisites

- Phases 5a, 5b, 5c — complete

## Foundational (already done in phase 2)

The following should already be in place from phase 2a/2b onwards:

- All entity tables have `deleted_at` timestamp column
- All list/query server functions filter `WHERE deleted_at IS NULL` by default
- Delete server functions set `deleted_at = NOW()` (soft delete, not hard delete)
- Cascade soft delete: deleting a workspace soft-deletes its elements, which soft-deletes their relationships

## Tasks

### Trash Page

- [ ] Trash page route (`/workspace/$slug/trash`)
- [ ] Trash table with TanStack Table + Virtual:
    - Columns: entity type icon, name, deleted by (user), deleted at (relative time), actions
    - Sort by deleted_at (newest first by default)
    - Filter by entity type (elements, relationships, diagrams)
- [ ] Sidebar badge: trash item count (only shown when > 0)

### Restore

- [ ] Server function `restoreFromTrash(entityType, entityId)`:
    - Set `deleted_at = NULL` on the entity
    - Cascade restore: restoring an element also restores its child elements and relationships
    - Validate: parent entity must exist and not be deleted (can't restore a container if its system is deleted)
- [ ] "Restore" button on each trash item
- [ ] Bulk restore: select multiple items → "Restore selected" button
- [ ] Toast notification: "Restored {name}" with undo option (re-delete within 10s)

### Permanent Delete

- [ ] Server function `permanentlyDelete(entityType, entityId)`:
    - Hard delete the entity and all cascade-deleted children
    - Remove from `diagram_elements` / `diagram_relationships` (clean up orphaned references)
    - Remove from `element_tags` / `relationship_tags`
    - Remove from `block_installations.created_element_ids` / `created_relationship_ids`
- [ ] "Delete permanently" button on each trash item (with confirmation dialog)
- [ ] Bulk permanent delete: select multiple → "Delete permanently" button
- [ ] Confirmation dialog: "This cannot be undone. N items will be permanently deleted."

### Auto-Cleanup

- [ ] Configurable retention period (default: 30 days)
- [ ] Server function `cleanupTrash(workspaceId)`:
    - Find all entities where `deleted_at < NOW() - retention_period`
    - Permanently delete them
- [ ] Run cleanup on a schedule (cron job or on-demand trigger)
- [ ] Trash page shows warning: "Items older than 30 days are automatically removed"

### Empty Trash

- [ ] "Empty trash" button (permanently deletes ALL trashed items)
- [ ] Confirmation: "This will permanently delete N items. This cannot be undone."
- [ ] Only workspace owners/admins can empty trash

## Key Files

- `src/lib/server/trash.ts` — trash query, restore, permanent delete, cleanup
- `src/routes/_protected/workspace/$workspaceSlug/trash.tsx` — trash page
- `src/components/trash/trash-table.tsx` — deleted items list with actions
- `src/components/trash/restore-toast.tsx` — restore with undo notification

## Design Notes

- **Soft delete is foundational, trash UI is phase 6:** The `deleted_at` filtering in all queries is critical and
  must be implemented from phase 2 onwards. This phase only adds the trash page, restore flow, and cleanup logic.
- **Cascade restore validation:** You can't restore a Container if its parent System is still in trash. The UI should
  show a warning: "Restore the parent System first" or offer to restore both.
- **Permanent delete is destructive:** Once permanently deleted, data is gone. This is the only truly destructive
  operation in the system. Activity log should record permanent deletes.

## Verification

- [ ] Trash page lists all soft-deleted items
- [ ] Restore brings items back (visible in normal queries again)
- [ ] Cascade restore works (restoring a system restores its children)
- [ ] Permanent delete removes items from database
- [ ] Permanent delete cleans up all references
- [ ] Auto-cleanup removes items older than retention period
- [ ] Empty trash removes all items (admin only)
- [ ] Sidebar badge shows correct trash count
- [ ] `pnpm dev` and `pnpm build` succeed
