# Phase 4c — Block Browser & Install

## Status: Not Started

## Goal

Build the block browser UI with search/filtering, a dynamic install wizard that generates forms from block inputs,
and installation tracking.

## Prerequisites

- Phase 4a (Block Schemas & Validation) — complete

## Data Model

**`block_installations`** (tracks what blocks have been installed in a workspace):

| Column                     | Type                                      | Notes                                                  |
|----------------------------|-------------------------------------------|--------------------------------------------------------|
| `id`                       | uuid, PK                                  |                                                        |
| `workspace_id`             | FK → workspaces                           |                                                        |
| `block_source`             | enum: `official` / `community` / `custom` | Where the block came from                              |
| `block_identifier`         | text                                      | Block file path or registry ID                         |
| `block_version`            | text                                      | Version at time of install                             |
| `block_name`               | text                                      | Block name (denormalized for display)                  |
| `inputs_json`              | jsonb                                     | User-provided input values at install time             |
| `created_element_ids`      | uuid[]                                    | Array of element IDs created by this installation      |
| `created_relationship_ids` | uuid[]                                    | Array of relationship IDs created                      |
| `parent_element_id`        | FK → elements, nullable                   | Target system/container for container/component blocks |
| `installed_by`             | FK → users                                |                                                        |
| `installed_at`             | timestamp                                 |                                                        |

## Tasks

### Block Browser Page

- [ ] Block browser page route (`/workspace/$slug/blocks`)
- [ ] TanStack Table with type-safe search params:
    - Filter by type: system / container / component (tabs or dropdown)
    - Filter by category (backend, frontend, infrastructure, etc.)
    - Search by name/description (client-side filter for now)
    - Pagination
- [ ] Block card component: icon, name, summary, type badge, category, "Install" button
- [ ] Block detail dialog/page: full description, input list preview, element preview diagram

### Install Wizard

- [ ] "Install" button opens install wizard dialog (multi-step):
    - **Step 1 (container/component blocks only):** Pick target parent element
        - Container blocks: show system picker (elements where type=system)
        - Component blocks: show container picker (elements where type=container)
    - **Step 2:** Dynamic form generated from `block.inputs[]`:
        - `text` input → text field with default value
        - `select` input → dropdown with options
        - `boolean` input → switch/checkbox
    - **Step 3:** Preview — show what will be created (element list + relationship list)
    - **Install button:** resolve template → create elements + relationships → track installation
- [ ] Use TanStack Form for the dynamic install form
- [ ] Validation: required inputs must be filled, parent element must be valid

### Install Execution

- [ ] Server function `installBlock(workspaceId, blockJson, inputs, parentElementId?)`:
    1. Resolve template: `resolveBlock(block, inputs)` → resolved elements + relationships
    2. Create elements with `parent_element_id` set correctly:
        - System blocks: no parent
        - Container blocks: parent = selected system
        - Component blocks: parent = selected container
    3. Create relationships between resolved elements
    4. Set `source_block_installation_id` on all created elements + relationships
    5. Create `block_installations` record with element/relationship IDs
    6. Return created entities
- [ ] Server function `listInstallations(workspaceId)` — list installed blocks
- [ ] Server function `getInstallation(installationId)` — get details with element/relationship status

### Uninstall

- [ ] Server function `uninstallBlock(installationId)`:
    - Soft-delete all elements + relationships created by the installation
    - Delete the `block_installations` record (or mark as uninstalled)
- [ ] Confirmation dialog: "This will remove N elements and N relationships"
- [ ] Warning if any created elements have been manually modified since installation

### Drizzle Migration

- [ ] Drizzle schema for `block_installations` table
- [ ] Run migration

## CLI Commands

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files

- `src/lib/schema/block-installations.ts` — Drizzle schema
- `src/lib/server/blocks.ts` — install/uninstall/list server functions
- `src/routes/_protected/workspace/$workspaceSlug/blocks.tsx` — block browser page
- `src/components/blocks/block-browser.tsx` — browser with filters and cards
- `src/components/blocks/block-card.tsx` — individual block card
- `src/components/blocks/block-detail.tsx` — block detail view
- `src/components/blocks/install-wizard.tsx` — multi-step install dialog
- `src/components/blocks/install-preview.tsx` — preview of what will be created
- `src/components/blocks/element-picker.tsx` — parent element picker for container/component blocks

## Design Notes

- **`source_block_installation_id`:** Elements and relationships created by a block have this FK set, linking them
  back to the installation. This enables the uninstall flow and lets the UI show "Created by block: REST API +
  Postgres".
- **Uninstall is soft-delete:** Uninstalling a block soft-deletes its elements/relationships (sets `deleted_at`).
  They go to trash and can be restored.
- **Post-install editing:** Users can freely edit elements created by a block. They're normal elements. The block
  installation is just a record of how they were created.

## Verification

- [ ] Block browser lists all official blocks with filtering by type and category
- [ ] Search filters blocks by name/description
- [ ] Install wizard renders correct form inputs per block
- [ ] Container/component blocks show parent element picker
- [ ] Preview step shows accurate list of what will be created
- [ ] Installing a block creates correct elements + relationships
- [ ] Installation is tracked in `block_installations`
- [ ] Uninstall soft-deletes created elements + relationships
- [ ] `pnpm dev` and `pnpm build` succeed
