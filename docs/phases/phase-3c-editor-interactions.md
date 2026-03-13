# Phase 3c — Editor Interactions

## Status: Not Started

## Goal
Add Zustand editor store with selection, drag, resize, and editor modes.

## Prerequisites
- Phase 3b (Canvas Rendering) — complete

## Tasks
- [ ] Create Zustand editor store (`src/stores/editor-store.ts`) with:
  - `selectedElementIds: Set<string>`
  - `selectedRelationshipIds: Set<string>`
  - `selectionBox: { x, y, w, h } | null`
  - `undoStack / redoStack: DiagramSnapshot[]`
  - `clipboard: { elements, relationships } | null`
  - `mode: "select" | "pan" | "add_element" | "add_relationship"`
  - `addElementType: ElementType | null`
  - `dragState: DragState | null`
- [ ] Click to select element
- [ ] Shift-click for multi-select
- [ ] Selection box (drag on empty canvas area)
- [ ] Drag to move selected elements
- [ ] Resize elements via handles
- [ ] Z-index management (bring to front, send to back)
- [ ] Editor mode toolbar (select, pan, add element, add relationship)
- [ ] Add element mode: click canvas to place new element

## Key Files
- `src/stores/editor-store.ts` — Zustand store
- `src/components/editor/selection-box.tsx` — rubber band selection
- `src/components/editor/resize-handles.tsx` — element resize
- `src/components/editor/editor-toolbar.tsx` — mode toolbar
- `src/components/editor/element-node.tsx` — interactive element wrapper

## Verification
- [ ] Click selects element, shift-click multi-selects
- [ ] Drag moves elements, resize works
- [ ] Selection box selects enclosed elements
- [ ] Mode switching works (select, pan, add)
- [ ] Z-index controls work
- [ ] `pnpm dev` and `pnpm build` succeed
