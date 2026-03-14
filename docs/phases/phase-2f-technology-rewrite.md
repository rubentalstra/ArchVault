# Phase 2f — Technology Rewrite

## Status: Not Started

## Goal

Rewrite the technology system to match IcePanel's model: a **workspace-scoped technology catalog** that can be attached
to both **elements AND connections**. Technologies are reusable across the workspace — users pick from the catalog (or
create new entries inline). Each element/connection can designate one technology as its **display icon** for diagrams.

### Key principles

- Technologies are **workspace-level model objects**, not ad-hoc per-element strings.
- Elements AND connections reference technologies from the same catalog.
- One technology per element/connection can be the **icon technology** (shown on canvas nodes/edges).
- Technologies have: name, description, website, docs URL, icon slug.
- A management page lets users browse, create, edit, and delete technologies.

## Prerequisites

- Phase 2a (Model Objects) — complete
- Phase 2b (Connections) — complete

## Current State & Problems

### What exists today

1. **`technology` table** — workspace-scoped, has name/description/website/iconSlug. ✅ Solid base.
2. **`elementTechnology` junction** — many-to-many with sortOrder. ✅ Keep.
3. **`connection.technology`** — plain text string field, NOT linked to technology table. ❌ Needs migration.
4. **Dual creation paths** — `element.functions.addTechnology` creates ad-hoc tech per element;
   `technology.functions.addElementTechnology` links existing workspace tech. UI only uses the ad-hoc path. ❌ Confusing.
5. **No technology picker** — element form creates techs inline by name. No "select from catalog" experience. ❌ Missing.
6. **No connection-technology junction** — connections can't reference multiple technologies or use the catalog. ❌
   Missing.
7. **No icon technology** — no way to designate which technology is the display icon for an element/connection. ❌
   Missing.
8. **No management route** — no `/technologies` page in workspace sidebar. ❌ Missing.

### What to keep

- `technology` table schema (extend it, don't replace)
- `elementTechnology` junction table with sortOrder
- `technology.functions.ts` CRUD + assignment functions (extend)
- `technology.validators.ts` schemas (extend)
- i18n keys for technology management

### What to remove/replace

- `element.functions.ts` → `addTechnology` and `removeTechnology` (ad-hoc creation path)
- `element.validators.ts` → `addTechnologySchema` and `removeTechnologySchema`
- Inline tech creation in element-form-dialog.tsx and element-properties.tsx
- `connection.technology` text field → replace with `connectionTechnology` junction table

---

## Step 1: Database Schema Changes

### 1a. Extend `technology` table (`src/lib/schema/element-technologies.ts`)

Add columns:
| Column | Type | Notes |
|--------|------|-------|
| `docsUrl` | text, nullable | Documentation URL |
| `updatesUrl` | text, nullable | Changelog/updates URL |

Rename file to `src/lib/schema/technologies.ts` for clarity (update barrel export).

### 1b. Add `iconTechnologyId` to `element` table

| Column             | Type                                | Notes                                              |
|--------------------|-------------------------------------|----------------------------------------------------|
| `iconTechnologyId` | FK → technology, nullable, set null | The technology whose icon appears on diagram nodes |

### 1c. Create `connectionTechnology` junction table

| Column         | Type                     | Notes        |
|----------------|--------------------------|--------------|
| `connectionId` | FK → connection, cascade | Composite PK |
| `technologyId` | FK → technology, cascade | Composite PK |
| `sortOrder`    | integer, default 0       | Ordering     |

Index on `technologyId`.

### 1d. Add `iconTechnologyId` to `connection` table

| Column             | Type                                | Notes                                              |
|--------------------|-------------------------------------|----------------------------------------------------|
| `iconTechnologyId` | FK → technology, nullable, set null | The technology whose icon appears on diagram edges |

### 1e. Migrate `connection.technology` text field data

Write a migration that:

1. For each connection with a non-null `technology` text value:
    - Find or create a `technology` row in the same workspace with that name
    - Insert a `connectionTechnology` junction row
2. Drop the `connection.technology` column

**Note:** This is a data migration — use `drizzle-kit generate` for the schema, but handle data migration in a custom
script or SQL.

### 1f. Update relations (`src/lib/schema/relations.ts`)

Add:

- `connection.technologies` → many-to-many via `connectionTechnology`
- `technology.connections` → many-to-many via `connectionTechnology` (reverse)
- `element.iconTechnology` → one (optional)
- `connection.iconTechnology` → one (optional)

### Files to modify

- **Rename** `src/lib/schema/element-technologies.ts` → `src/lib/schema/technologies.ts`
- **Edit** `src/lib/schema/technologies.ts` — add `docsUrl`, `updatesUrl` to technology; add `connectionTechnology`
  table
- **Edit** `src/lib/schema/elements.ts` — add `iconTechnologyId`
- **Edit** `src/lib/schema/connections.ts` — add `iconTechnologyId`, remove `technology` text field
- **Edit** `src/lib/schema/index.ts` — update export path
- **Edit** `src/lib/schema/relations.ts` — add new relations

Then: `pnpm drizzle-kit generate` + `pnpm drizzle-kit migrate`

---

## Step 2: Validators (`src/lib/technology.validators.ts`)

### Extend existing schemas

- `createTechnologySchema` — add optional `docsUrl` (url), `updatesUrl` (url)
- `updateTechnologySchema` — add optional nullable `docsUrl`, `updatesUrl`

### Add new schemas

- `addConnectionTechnologySchema` — connectionId, technologyId, sortOrder?
- `removeConnectionTechnologySchema` — connectionId, technologyId
- `reorderConnectionTechnologiesSchema` — connectionId, orderedTechnologyIds[]
- `setElementIconTechnologySchema` — elementId, technologyId (nullable)
- `setConnectionIconTechnologySchema` — connectionId, technologyId (nullable)

### Remove from `element.validators.ts`

- `addTechnologySchema` (ad-hoc creation)
- `removeTechnologySchema` (ad-hoc deletion)

---

## Step 3: Server Functions (`src/lib/technology.functions.ts`)

### Keep and extend

- `getTechnologies` — already good (returns assignedCount)
- `createTechnology` — add docsUrl/updatesUrl support
- `updateTechnology` — add docsUrl/updatesUrl support
- `deleteTechnology` — keep
- `addElementTechnology` — keep
- `removeElementTechnology` — keep
- `reorderElementTechnologies` — keep

### Add new functions

| Function                        | Method | Roles              | Notes                                        |
|---------------------------------|--------|--------------------|----------------------------------------------|
| `addConnectionTechnology`       | POST   | owner/admin/editor | Link tech to connection, onConflictDoNothing |
| `removeConnectionTechnology`    | POST   | owner/admin/editor | Unlink tech from connection                  |
| `reorderConnectionTechnologies` | POST   | owner/admin/editor | Reorder by array index                       |
| `setElementIconTechnology`      | POST   | owner/admin/editor | Set/clear iconTechnologyId on element        |
| `setConnectionIconTechnology`   | POST   | owner/admin/editor | Set/clear iconTechnologyId on connection     |

### Remove from `element.functions.ts`

- `addTechnology` — replaced by `createTechnology` + `addElementTechnology` flow
- `removeTechnology` — replaced by `removeElementTechnology` (doesn't delete the tech itself)

Update `getElements` and `getElementById` to include `iconTechnologyId` in response.

### Update `connection.functions.ts`

- `getConnections` — join connectionTechnology to return technologies array
- `getConnectionById` — include technologies
- Remove `technology` text field from create/update connection handlers

### Update `diagram.functions.ts`

- `getDiagramData` — include `iconTechnologyId` + icon tech slug in element/connection response for canvas rendering

---

## Step 4: UI Components

### 4a. `src/components/technologies/technology-picker.tsx` (new)

Popover component for selecting technologies from workspace catalog:

- Search input to filter
- List of workspace technologies with icon + name
- Checkmark for already-assigned techs
- Toggle assignment on click
- "Create new" button at bottom → opens inline creation or links to management page
- Pattern: follows `tag-picker.tsx`

### 4b. `src/components/technologies/technology-badge.tsx` (new)

Display component:

- Icon (from slug via simpleicons or similar) + name
- Optional "star" indicator if it's the icon technology
- Remove button (optional, for editable contexts)
- Pattern: follows `tag-badge.tsx`

### 4c. `src/components/technologies/technology-form-dialog.tsx` (new)

Create/edit dialog:

- Name input (required)
- Description textarea
- Website URL input
- Docs URL input
- Updates URL input
- Icon slug input (with preview)
- Pattern: follows `group-form-dialog.tsx`

### 4d. `src/components/technologies/delete-technology-dialog.tsx` (new)

Confirmation AlertDialog showing assigned count warning.
Pattern: follows `delete-group-dialog.tsx`.

---

## Step 5: Technology Management Route

### Create `src/routes/_protected/_onboarded/workspace/$workspaceSlug/technologies.tsx`

Pattern from `tags.tsx` / `groups.tsx`:

- TanStack Table with columns: icon + name, description, website, assigned count, updated
- Create/edit/delete dialogs
- Search filter
- Show how many elements + connections use each technology

### Edit `src/routes/_protected/_onboarded/workspace/$workspaceSlug.tsx`

Add sidebar nav item:

```
{ to: "/workspace/$workspaceSlug/technologies", icon: Cpu, label: () => m.technology_nav_title() }
```

Position after Groups.

---

## Step 6: Element Integration

### 6a. Update `element-properties.tsx`

Replace `TechnologiesSection`:

- Fetch workspace technologies via `getTechnologies`
- Use `TechnologyPicker` to add/remove from catalog (not inline creation)
- Show assigned techs as `TechnologyBadge` with "set as icon" action
- Star icon next to the current icon technology
- Remove = `removeElementTechnology` (unlinks, doesn't delete tech)

### 6b. Update `element-form-dialog.tsx`

Replace inline tech creation:

- Use `TechnologyPicker` component
- Track `localTechnologyIds` state (IDs from workspace catalog)
- On submit: diff existing vs local, call `addElementTechnology`/`removeElementTechnology`
- Remove inline name+icon input fields
- Add icon technology selector (dropdown of assigned techs)

---

## Step 7: Connection Integration

### 7a. Update `connection-form-dialog.tsx` (or wherever connections are edited)

- Replace `technology` text input with `TechnologyPicker`
- Track assigned technology IDs
- On submit: sync `connectionTechnology` junction rows
- Add icon technology selector

### 7b. Update connection properties panel (if exists in editor)

- Show assigned technologies with badges
- Add/remove via picker
- Set icon technology

---

## Step 8: Canvas Integration

### 8a. Update diagram node rendering

- If element has `iconTechnologyId`, resolve the icon slug
- Display technology icon on the canvas node (top-left corner or similar)
- Pass icon data through `getDiagramData` response

### 8b. Update diagram edge rendering

- If connection has `iconTechnologyId`, resolve the icon slug
- Display on edge label area

---

## Step 9: i18n Keys

Add to both `messages/en.json` and `messages/nl.json`:

| Key                                  | EN                            | NL                             |
|--------------------------------------|-------------------------------|--------------------------------|
| `technology_nav_title`               | Technologies                  | Technologieën                  |
| `technology_page_title`              | Technologies                  | Technologieën                  |
| `technology_label_website`           | Website                       | Website                        |
| `technology_label_docs_url`          | Documentation URL             | Documentatie-URL               |
| `technology_label_updates_url`       | Updates URL                   | Updates-URL                    |
| `technology_placeholder_docs_url`    | https://docs.example.com      | https://docs.voorbeeld.nl      |
| `technology_placeholder_updates_url` | https://example.com/changelog | https://voorbeeld.nl/changelog |
| `technology_column_assigned`         | Assigned                      | Toegewezen                     |
| `technology_set_as_icon`             | Set as icon                   | Als pictogram instellen        |
| `technology_clear_icon`              | Clear icon                    | Pictogram wissen               |
| `technology_icon_label`              | Display Icon                  | Weergavepictogram              |
| `technology_create_inline`           | Create new technology         | Nieuwe technologie aanmaken    |

**Note:** Many technology i18n keys already exist from the earlier implementation. Only add what's missing.

---

## File Change Summary

| Type                  | Count | Files                                                                                                                           |
|-----------------------|-------|---------------------------------------------------------------------------------------------------------------------------------|
| **Renamed**           | 1     | element-technologies.ts → technologies.ts                                                                                       |
| **New files**         | 5     | technology-picker.tsx, technology-badge.tsx, technology-form-dialog.tsx, delete-technology-dialog.tsx, technologies.tsx (route) |
| **Edited schema**     | 4     | technologies.ts, elements.ts, connections.ts, relations.ts                                                                      |
| **Edited functions**  | 4     | technology.functions.ts, element.functions.ts, connection.functions.ts, diagram.functions.ts                                    |
| **Edited validators** | 2     | technology.validators.ts, element.validators.ts                                                                                 |
| **Edited UI**         | 3+    | element-properties.tsx, element-form-dialog.tsx, connection form, $workspaceSlug.tsx                                            |
| **i18n**              | 2     | en.json, nl.json                                                                                                                |

**Total: ~20 files**

---

## Migration Strategy

Because we're modifying existing tables with live data:

1. **Schema additions first** — add new columns/tables (non-breaking)
2. **Data migration** — move `connection.technology` text → `connectionTechnology` junction rows
3. **Code update** — switch all code to use new paths
4. **Column removal** — drop `connection.technology` text field
5. **Remove dead code** — delete ad-hoc `addTechnology`/`removeTechnology` from element.functions

Steps 1-2 can be one migration. Steps 3-5 happen in code. Step 4 is a second migration after code is updated.

---

## Verification

1. `pnpm drizzle-kit generate` — generates clean migration
2. `pnpm drizzle-kit migrate` — applies successfully
3. `pnpm build` — production build succeeds, no TS errors
4. Manual: create technologies in management page
5. Manual: assign technologies to elements via picker (not inline)
6. Manual: assign technologies to connections via picker
7. Manual: set icon technology on element → shows on canvas
8. Manual: set icon technology on connection → shows on edge
9. Manual: delete technology removes all assignments
10. Manual: existing connection technology data migrated correctly
11. Manual: sidebar shows "Technologies" nav, route works
12. Manual: technology assigned count updates correctly

---

## Out of Scope (Future Phases)

- **Technology catalog / registry** — global catalog of popular technologies (Phase 7b)
- **AI-powered technology detection** — auto-suggest from URLs (Phase 7b)
- **Private vs public technologies** — org-level visibility control (Phase 7b)
- **Technology filtering on diagrams** — filter canvas by technology (Phase 5a)
