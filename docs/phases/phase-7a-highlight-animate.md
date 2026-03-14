# Phase 7a — Connection Highlighting & Edge Animation

## Status: Not Started

## Goal

When a user selects an element, highlight all connected elements and their edges. Add animated data flow indicators
on edges to visualize communication direction.

## Prerequisites

- Phase 3e (Autosave, Hotkeys, Undo/Redo) — complete

## Tasks

### Connection Highlighting

- [ ] When a node is selected, find all directly connected nodes and edges:
    - Use `useNodeConnections()` or traverse edges in the store
    - Connected = source or target of any edge involving the selected node
- [ ] Highlight connected nodes: add a subtle glow/ring or brighter border
- [ ] Highlight connected edges: thicker stroke + accent color
- [ ] Dim non-connected elements: reduce opacity to ~30% (fade out)
- [ ] Multi-select: when multiple nodes are selected, highlight the union of all their connections
- [ ] Deselect: restore all elements to full opacity
- [ ] Toggle: button in toolbar to enable/disable highlight mode (some users may find dimming distracting)

### Animated Data Flow on Edges

- [ ] React Flow supports `animated: true` on edges (dashed animation moving along the path)
- [ ] Direction-aware animation:
    - `outgoing`: animation flows from source → target
    - `incoming`: animation flows from target → source
    - `bidirectional`: animation pulses in both directions (alternating or simultaneous)
    - `none`: no animation (static line)
- [ ] Animation toggle: button in toolbar to enable/disable edge animations globally
- [ ] Per-edge animation: ability to toggle animation on individual edges via properties panel
- [ ] Animation speed: configurable (slow for overview, fast for active flows)
- [ ] Animation style: CSS `strokeDasharray` + `strokeDashoffset` animation, or SVG `<animate>` for particles

### Visual Polish

- [ ] Smooth transitions when highlighting/dimming (CSS transition on opacity, ~200ms)
- [ ] Highlighted edges render above non-highlighted edges (z-index boost)
- [ ] Animation respects dark mode (colors adjust)
- [ ] Animation pauses when the editor is not focused (performance)

## Key Files

- `src/hooks/use-connection-highlight.ts` — highlight logic based on selection
- `src/components/editor/edges/animated-edge.tsx` — edge with data flow animation
- `src/stores/editor-store.ts` — highlight mode + animation toggle state

## Verification

- [ ] Selecting a node highlights connected nodes and edges
- [ ] Non-connected elements dim to low opacity
- [ ] Multi-select highlights union of connections
- [ ] Deselecting restores all elements
- [ ] Edge animation flows in the correct direction
- [ ] Animation toggle works globally
- [ ] Animation respects dark mode
- [ ] `pnpm dev` and `pnpm build` succeed
