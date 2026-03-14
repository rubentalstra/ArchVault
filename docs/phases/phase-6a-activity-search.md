# Phase 6a — Activity Log & Search

## Status: Not Started

## Goal

Add activity logging for all CRUD operations and full-text search across workspace entities.

## Prerequisites

- Phases 5a, 5b, 5c — complete

## Data Model

**`activity_log`** (workspace-scoped audit trail):

| Column         | Type            | Notes                                                                  |
|----------------|-----------------|------------------------------------------------------------------------|
| `id`           | uuid, PK        |                                                                        |
| `workspace_id` | FK → workspaces |                                                                        |
| `user_id`      | FK → users      | Who performed the action                                               |
| `action`       | enum            | See action types below                                                 |
| `entity_type`  | enum            | `element` / `relationship` / `diagram` / `workspace` / `block` / `tag` |
| `entity_id`    | uuid            | ID of the affected entity                                              |
| `entity_name`  | text            | Name at time of action (denormalized)                                  |
| `details_json` | jsonb, nullable | Extra context (old/new values for updates)                             |
| `created_at`   | timestamp       |                                                                        |

### Action Types

| Action              | Description                     |
|---------------------|---------------------------------|
| `created`           | Entity was created              |
| `updated`           | Entity was modified             |
| `deleted`           | Entity was soft-deleted         |
| `restored`          | Entity was restored from trash  |
| `block_installed`   | A block was installed           |
| `block_uninstalled` | A block was uninstalled         |
| `revision_created`  | A diagram revision was created  |
| `revision_restored` | A diagram revision was restored |

### Search Index

**`search_index`** (materialized search data using PostgreSQL full-text search):

| Column         | Type            | Notes                                  |
|----------------|-----------------|----------------------------------------|
| `id`           | uuid, PK        |                                        |
| `workspace_id` | FK → workspaces |                                        |
| `entity_type`  | enum            | element / relationship / diagram / tag |
| `entity_id`    | uuid            | FK to the source entity                |
| `search_text`  | text            | Concatenated searchable text           |
| `tsv`          | tsvector        | Auto-generated from search_text        |

GIN index on `tsv` column for fast full-text search.

## Tasks

### Activity Logging

- [ ] Drizzle schema for `activity_log` table + action enum + entity_type enum
- [ ] Run migration
- [ ] Helper function `logActivity(workspaceId, userId, action, entityType, entityId, entityName, details?)`:
    - Inserts activity log entry
    - Fire-and-forget (don't block the main operation)
- [ ] Add `logActivity()` calls to all existing server functions:
    - Element CRUD (create, update, delete, restore)
    - Relationship CRUD
    - Diagram CRUD
    - Tag CRUD + assignments
    - Block install/uninstall
    - Revision create/restore
- [ ] `details_json` for updates: store `{ field: "name", old: "API", new: "REST API" }` for key changes

### Activity Log UI

- [ ] Activity page route (`/workspace/$slug/activity`)
- [ ] Activity table with TanStack Table + Virtual (scrollable):
    - Columns: user avatar + name, action badge, entity type icon + name, timestamp (relative)
    - Click entity name → navigate to that entity
- [ ] Filters:
    - By user (multi-select)
    - By action type (multi-select)
    - By entity type (multi-select)
    - By date range (date picker)
- [ ] Real-time: new activities appear at the top (poll every 30s or use TanStack Query refetchInterval)

### Full-Text Search

- [ ] Drizzle schema for `search_index` table with GIN index on `tsv`
- [ ] Run migration
- [ ] Trigger/function to auto-populate `search_index` when entities change:
    - Elements: name + display_description + description + technology names
    - Relationships: description + technology
    - Diagrams: name + description
    - Tags: name
- [ ] Server function `search(workspaceId, query)`:
    - Use PostgreSQL `plainto_tsquery()` for user input → tsquery conversion
    - Rank results with `ts_rank()`
    - Return: entity_type, entity_id, entity_name, headline (highlighted snippet)
- [ ] Global search UI:
    - Command palette style (Cmd+K to open)
    - Debounced input (300ms)
    - Results grouped by entity type
    - Click result → navigate to entity
    - Recent searches (stored in localStorage)

## Key Files

- `src/lib/schema/activity-log.ts` — Drizzle schema + enums
- `src/lib/schema/search-index.ts` — Drizzle schema + GIN index
- `src/lib/server/activity.ts` — logging + query server functions
- `src/lib/server/search.ts` — full-text search server functions
- `src/routes/_protected/workspace/$workspaceSlug/activity.tsx` — activity page
- `src/components/activity/activity-table.tsx` — activity list with filters
- `src/components/search/command-palette.tsx` — Cmd+K search UI

## Verification

- [ ] All CRUD operations create activity log entries
- [ ] Activity table shows entries with correct details
- [ ] Filters work (by user, action, entity type, date range)
- [ ] Full-text search returns relevant results ranked by relevance
- [ ] Search highlights matching terms in results
- [ ] Cmd+K opens command palette
- [ ] Search debounce works (300ms)
- [ ] `pnpm dev` and `pnpm build` succeed
