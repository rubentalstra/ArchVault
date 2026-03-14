# Phase 5c — Export & Import

## Status: Not Started

## Goal

Add diagram export (PNG, SVG, JSON) and workspace import/export for backup and migration.

## Prerequisites

- Phase 4c (Block Browser & Install) — complete

## Tasks

### Diagram Image Export

- [ ] **PNG export:**
    - Use React Flow's `toObject()` to get current flow state
    - Render to a hidden `<canvas>` element or use `html-to-image` library
    - Support resolution options: 1x, 2x, 3x (for retina)
    - Include background grid (optional toggle)
    - Crop to content bounds with padding
- [ ] **SVG export:**
    - Use React Flow's viewport and node bounds to construct SVG
    - Embed node HTML as `<foreignObject>` elements or convert to SVG shapes
    - Include edge paths, labels, and markers
    - Produce a self-contained SVG file (no external dependencies)
- [ ] **PDF export** (stretch goal):
    - Convert SVG to PDF via a server-side library
    - Support page size selection (A4, Letter, custom)

### Export Dialog

- [ ] Export button in editor toolbar → dialog with options:
    - Format: PNG / SVG / JSON
    - For PNG: resolution multiplier (1x / 2x / 3x)
    - Include background grid (checkbox)
    - Include minimap legend (checkbox)
    - Transparent background option (PNG only)
- [ ] Preview thumbnail of what will be exported
- [ ] Download triggers browser file save dialog

### Workspace JSON Export

- [ ] Server function `exportWorkspace(workspaceId)`:
    - Export all elements (with technologies, links)
    - Export all relationships
    - Export all tags + tag assignments
    - Export all diagrams + diagram_elements + diagram_relationships
    - Export block installations
    - Export metadata (workspace name, export date, schema version)
    - Return as a single JSON object
- [ ] JSON export format includes a `schema_version` for future compatibility
- [ ] Download as `{workspace-name}-export-{date}.json`

### Workspace JSON Import

- [ ] Server function `importWorkspace(workspaceId, json)`:
    - Validate import JSON against expected schema
    - Option: merge into existing workspace OR create new workspace
    - ID remapping: generate new UUIDs for all imported entities (avoid collisions)
    - Preserve relationships between imported entities (remap FKs)
    - Report: N elements created, N relationships created, N diagrams created
- [ ] Import dialog:
    - File upload (drag & drop or file picker)
    - Preview: show what will be imported (entity counts)
    - Merge vs. new workspace option
    - Conflict resolution for merges (skip duplicates by name)

### Diagram JSON Export/Import

- [ ] Export single diagram as JSON (diagram + its elements + relationships)
- [ ] Import diagram JSON into a workspace (creates elements if they don't exist)

## Key Files

- `src/lib/export/png-export.ts` — PNG conversion using html-to-image
- `src/lib/export/svg-export.ts` — SVG export from React Flow
- `src/lib/export/workspace-export.ts` — workspace JSON export
- `src/lib/export/workspace-import.ts` — workspace JSON import with ID remapping
- `src/components/export/export-dialog.tsx` — export options UI
- `src/components/export/import-dialog.tsx` — import UI with preview

## Design Notes

- **React Flow's `toObject()`** returns `{ nodes, edges, viewport }` — useful as a starting point for exports.
  For image exports, we need to render the actual visual output, not just the data.
- **`html-to-image` for PNG:** Since React Flow nodes are HTML (not SVG), the cleanest PNG export path is to
  screenshot the canvas DOM. Libraries like `html-to-image` or `dom-to-image-more` handle this.
- **SVG export is harder** because nodes are HTML. Options: (1) use `<foreignObject>` to embed HTML in SVG (works
  in most viewers), or (2) approximate node shapes as pure SVG (more portable but less accurate).
- **Import ID remapping:** All imported entities get fresh UUIDs. A mapping table `{ oldId → newId }` is used to
  remap all foreign keys (parent_element_id, source/target on relationships, diagram_element FKs, etc.).

## Verification

- [ ] PNG export produces a valid image at each resolution
- [ ] SVG export produces a valid, self-contained SVG file
- [ ] Export dialog shows correct options per format
- [ ] Workspace JSON export captures all entities
- [ ] Workspace JSON import creates all entities with correct relationships
- [ ] ID remapping preserves all internal references
- [ ] Import preview shows accurate entity counts
- [ ] Round-trip: export → import produces equivalent workspace
- [ ] `pnpm dev` and `pnpm build` succeed
