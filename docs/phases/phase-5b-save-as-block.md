# Phase 5b — Save as Block

## Status: Not Started

## Goal
Allow users to export diagram selections as reusable block files.

## Prerequisites
- Phase 4c (Block Browser & Install) — complete

## Tasks
- [ ] Select elements on diagram → detect block type based on selection
- [ ] "Save as Block" button (visible when elements selected)
- [ ] TanStack Form modal: name, summary, description, icon, tags
- [ ] Generate `block.json` from selected elements + relationships
- [ ] Auto-generate template keys from element names
- [ ] Extract configurable inputs from element properties
- [ ] Download generated `block.json` file
- [ ] Validate generated block against schema before download

## Key Files
- `src/lib/blocks/generate-block.ts` — block generation logic
- `src/components/blocks/save-as-block-dialog.tsx` — export form
- `src/components/blocks/block-preview.tsx` — preview generated JSON

## Verification
- [ ] Selecting elements enables "Save as Block"
- [ ] Block type correctly detected from selection
- [ ] Generated block passes schema validation
- [ ] Downloaded file is valid block JSON
- [ ] `pnpm dev` and `pnpm build` succeed
