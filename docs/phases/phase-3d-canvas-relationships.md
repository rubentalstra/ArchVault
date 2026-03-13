# Phase 3d — Canvas Relationships

## Status: Not Started

## Goal
Render and interact with relationships on the canvas.

## Prerequisites
- Phase 3b (Canvas Rendering) — complete

## Tasks
- [ ] Relationship rendering: straight, curved, orthogonal path types
- [ ] Line styles: solid, dashed, dotted
- [ ] Animation support (animated flag, animation_type, animation_speed)
- [ ] Anchor points: top, bottom, left, right, auto (nearest)
- [ ] Labels with position options (start, center, end)
- [ ] Control points for custom paths (`control_points_json`)
- [ ] Click to select relationship
- [ ] Add relationship mode: click source → click target → create
- [ ] Relationship style editing panel
- [ ] Arrow heads / markers

## Key Files
- `src/components/editor/relationship-path.tsx` — SVG path rendering
- `src/components/editor/relationship-label.tsx` — label positioning
- `src/components/editor/relationship-anchors.tsx` — anchor point calculation
- `src/components/editor/add-relationship-mode.tsx` — creation interaction

## Verification
- [ ] Relationships render between elements with correct paths
- [ ] All 3 path types work (straight, curved, orthogonal)
- [ ] Line styles render correctly
- [ ] Labels show at correct positions
- [ ] Add relationship mode creates connections
- [ ] `pnpm dev` and `pnpm build` succeed
