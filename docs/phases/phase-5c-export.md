# Phase 5c — Export

## Status: Not Started

## Goal
Add PNG, SVG, and JSON export/import for diagrams and workspaces.

## Prerequisites
- Phase 4c (Block Browser & Install) — complete

## Tasks
- [ ] PNG export: SVG → PNG via `sharp` or `resvg`
- [ ] SVG export: direct canvas SVG export
- [ ] JSON workspace export (all elements, relationships, diagrams)
- [ ] JSON workspace import (validate + create entities)
- [ ] Export dialog with format selection
- [ ] Export options (resolution for PNG, include grid, etc.)

## Key Files
- `src/lib/export/png.ts` — PNG conversion
- `src/lib/export/svg.ts` — SVG export
- `src/lib/export/json.ts` — workspace JSON export/import
- `src/components/export/export-dialog.tsx` — export UI

## Verification
- [ ] PNG export produces valid image
- [ ] SVG export produces valid SVG
- [ ] JSON export captures full workspace
- [ ] JSON import restores workspace correctly
- [ ] `pnpm dev` and `pnpm build` succeed
