# Phase 3b — Canvas Rendering

## Status: Not Started

## Goal
Build the SVG-based canvas with pan, zoom, grid, snap, and element rendering.

## Prerequisites
- Phase 3a (Diagram CRUD & Schema) — complete

## Tasks
- [ ] SVG-based canvas component (`src/components/editor/canvas.tsx`)
- [ ] Pan controls (mouse drag in pan mode, Space+drag)
- [ ] Zoom controls (scroll wheel, +/- keys, reset to fit)
- [ ] Grid rendering (configurable size from diagram settings)
- [ ] Snap-to-grid functionality
- [ ] Element shape rendering per C4 type:
  - Person: stick figure / icon shape
  - System: large rounded rectangle
  - Container: medium rounded rectangle
  - Component: rectangle with component icon
- [ ] Element labels (name, technology, description)
- [ ] Style support via `style_json`
- [ ] Minimap (optional, can defer)

## Key Files
- `src/components/editor/canvas.tsx` — main SVG canvas
- `src/components/editor/canvas-grid.tsx` — grid overlay
- `src/components/editor/element-shape.tsx` — C4 type shape renderer
- `src/components/editor/canvas-controls.tsx` — zoom/pan controls UI
- `src/routes/_protected/workspace/$workspaceSlug/diagram.$diagramId.tsx` — editor page

## Verification
- [ ] Canvas renders with grid
- [ ] Elements display with correct C4 shapes
- [ ] Pan and zoom work smoothly
- [ ] Snap-to-grid aligns elements
- [ ] `pnpm dev` and `pnpm build` succeed
