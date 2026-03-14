# Phase 5b — Save as Block

## Status: Not Started

## Goal

Allow users to select elements on a diagram and export them as a reusable block JSON file. Blocks can be saved
locally (download) or stored in the workspace for team reuse.

## Prerequisites

- Phase 4c (Block Browser & Install) — complete

## Data Model

**`workspace_blocks`** (blocks saved within a workspace for team reuse):

| Column                     | Type            | Notes                          |
|----------------------------|-----------------|--------------------------------|
| `id`                       | uuid, PK        |                                |
| `workspace_id`             | FK → workspaces |                                |
| `block_json`               | jsonb           | The full block JSON content    |
| `name`                     | text            | Block name (from metadata)     |
| `block_type`               | enum            | system / container / component |
| `created_by`               | FK → users      |                                |
| `created_at`, `updated_at` | timestamps      |                                |

## Tasks

### Selection Detection

- [ ] "Save as Block" button appears in toolbar when elements are selected on canvas
- [ ] Detect block type from selection:
    - If selection contains only persons/systems → `system` block
    - If selection is within a single system (all containers) → `container` block
    - If selection is within a single container (all components) → `component` block
    - Mixed/ambiguous selections → show error with guidance

### Block Generation

- [ ] `generateBlock(selectedElements, selectedRelationships)`:
    1. Generate `template_key` for each element (slugified name, deduplicated)
    2. Map element properties → block element entries (name, type, technology, etc.)
    3. Filter relationships to only those between selected elements
    4. Map relationships → block relationship entries (using template_keys as source/target)
    5. Auto-detect configurable inputs:
        - Element names → text inputs (so the user can rename on install)
        - Technologies → select inputs (with the current value as default)
        - Optional elements (user can mark) → boolean inputs with `conditional_on`
    6. Wrap `{{input_key}}` placeholders into element names/technologies
    7. Generate metadata (name, summary from user input, auto-generated description)

### Save as Block Dialog

- [ ] Multi-step dialog:
    - **Step 1 — Metadata:** name, summary, description, icon (Lucide picker), category, tags
    - **Step 2 — Configure inputs:** review auto-generated inputs, add/remove/edit
        - Each input: key, label, type (text/select/boolean), default value
        - Drag to reorder inputs
    - **Step 3 — Preview:** show the generated block JSON (read-only, syntax highlighted)
    - **Step 4 — Save options:** download as `.json` file OR save to workspace
- [ ] Validate generated block against schema before allowing save/download

### Workspace Block Library

- [ ] Drizzle schema for `workspace_blocks` table
- [ ] Server functions: save block to workspace, list workspace blocks, delete workspace block
- [ ] "Workspace" tab in block browser (alongside Official + Community)
- [ ] Workspace blocks can be installed just like official/community blocks
- [ ] Edit workspace block (update the JSON, re-validate)

## CLI Commands

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files

- `src/lib/schema/workspace-blocks.ts` — Drizzle schema
- `src/lib/blocks/generate-block.ts` — block generation from selection
- `src/lib/server/workspace-blocks.ts` — workspace block CRUD
- `src/components/blocks/save-as-block-dialog.tsx` — multi-step export dialog
- `src/components/blocks/input-configurator.tsx` — input editor (step 2)
- `src/components/blocks/block-json-preview.tsx` — syntax-highlighted JSON preview

## Design Notes

- **Auto-detected inputs are a starting point:** The generator makes reasonable guesses about what should be
  configurable (names, technologies). The user can then fine-tune in step 2 — removing inputs that shouldn't be
  configurable, adding new ones, or changing types.
- **Workspace blocks vs. download:** Download gives a `.json` file the user can share manually or submit to the
  community registry. Saving to workspace makes it available to all team members immediately.
- **Block round-trip:** A block generated from "Save as Block" should be installable via the block browser. This
  validates the entire pipeline: generate → validate → install.

## Verification

- [ ] Selecting elements enables "Save as Block" button
- [ ] Block type correctly detected from selection
- [ ] Generated block includes all selected elements and their relationships
- [ ] Auto-generated inputs are reasonable (names, technologies)
- [ ] User can add/remove/edit inputs in the configurator
- [ ] Generated block passes schema validation
- [ ] Downloaded `.json` file is a valid block
- [ ] Workspace blocks appear in the block browser under "Workspace" tab
- [ ] Workspace blocks can be installed by team members
- [ ] `pnpm dev` and `pnpm build` succeed
