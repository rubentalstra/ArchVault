# Phase 3d — Canvas Relationships

## Status: Not Started

## Goal

Render relationships as React Flow custom edges with direction arrows (markers), path types, line styles, labels,
connection creation, and edge reconnection.

## Prerequisites

- Phase 3b (Canvas Rendering) — complete
- Phase 3c (Editor Interactions) — complete (needs selection, toolbar, properties panel)

## Tasks

### Custom Edge Types

- [ ] Define `edgeTypes` object **outside** the component:
    ```ts
    const edgeTypes = {
      curved: CurvedEdge,
      straight: StraightEdge,
      orthogonal: OrthogonalEdge,
    } satisfies EdgeTypes;
    ```
- [ ] **CurvedEdge** — uses `getBezierPath()` + `<BaseEdge>` (default edge type)
- [ ] **StraightEdge** — uses `getStraightPath()` + `<BaseEdge>`
- [ ] **OrthogonalEdge** — uses `getSmoothStepPath()` + `<BaseEdge>` (step-like right-angle paths)
- [ ] All custom edges receive `EdgeProps<AppEdge>` with typed `data` containing:
    ```ts
    type RelationshipEdgeData = {
      description: string | null;
      technology: string | null;
      direction: 'outgoing' | 'incoming' | 'bidirectional' | 'none';
      lineStyle: 'solid' | 'dashed' | 'dotted';
      labelPosition: number;  // 0.0–1.0
    };
    ```
- [ ] Use `memo()` on all custom edge components

### Direction Arrow Markers

- [ ] Map relationship `direction` to React Flow `markerStart` / `markerEnd` props:

    | Direction       | `markerStart`        | `markerEnd`          | Visual          |
    | --------------- | -------------------- | -------------------- | --------------- |
    | `outgoing`      | —                    | `MarkerType.ArrowClosed` | source → target |
    | `incoming`      | `MarkerType.ArrowClosed` | —                | source ← target |
    | `bidirectional` | `MarkerType.ArrowClosed` | `MarkerType.ArrowClosed` | source ↔ target |
    | `none`          | —                    | —                    | source — target |

- [ ] Set marker colors to match edge stroke color (inherits from theme or `style_json`)
- [ ] Arrow markers scale correctly at different zoom levels

### Line Styles

- [ ] Map `lineStyle` to SVG `style` on `<BaseEdge>`:
    - `solid` → default (no dash array)
    - `dashed` → `strokeDasharray: '8 4'`
    - `dotted` → `strokeDasharray: '2 2'`
- [ ] Edge color follows theme (light: gray-400, dark: gray-500) unless overridden by `style_json`

### Edge Labels

- [ ] Use `<EdgeLabelRenderer>` to render labels at the configured `labelPosition` along the path
- [ ] Label content: relationship description (primary) + technology in parentheses (secondary)
- [ ] Label styling: small text, background pill (semi-transparent), dark mode variants
- [ ] Label is clickable — selects the edge
- [ ] Hide labels when zoomed out far (below a threshold zoom level) for readability

### Anchor Points / Handles

- [ ] Custom nodes (from 3b) expose `<Handle>` components on all 4 sides:
    ```tsx
    <Handle type="source" position={Position.Top} id="top" />
    <Handle type="source" position={Position.Bottom} id="bottom" />
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Right} id="right" />
    <Handle type="target" position={Position.Top} id="top" />
    <Handle type="target" position={Position.Bottom} id="bottom" />
    <Handle type="target" position={Position.Left} id="left" />
    <Handle type="target" position={Position.Right} id="right" />
    ```
- [ ] Map `source_anchor` / `target_anchor` from `diagram_relationships` to `sourceHandle` / `targetHandle` on edges
- [ ] `auto` anchor: omit `sourceHandle`/`targetHandle` — React Flow connects to nearest handle automatically
- [ ] Fixed anchors: set `sourceHandle`/`targetHandle` to the handle id (`top`, `bottom`, `left`, `right`)
- [ ] Handles are hidden by default, shown on hover or when in add-relationship mode

### Add Relationship Mode

- [ ] When `mode === 'add_relationship'`:
    - Set `nodesConnectable={true}` on `<ReactFlow>`
    - Handles become visible on all nodes
    - User drags from a source handle to a target handle
    - `onConnect` fires → creates relationship (server) + `diagram_relationships` row + adds edge to store
    - Default direction: `outgoing`, default path type: `curved`
- [ ] Connection line preview while dragging:
    ```tsx
    connectionLineType={ConnectionLineType.Bezier}
    connectionLineStyle={{ stroke: 'var(--xy-edge-stroke-default)', strokeWidth: 2 }}
    ```
- [ ] After connection created, stay in add-relationship mode (user can create multiple)
- [ ] Press Escape to exit add-relationship mode

### Edge Reconnection

- [ ] Enable `edgesReconnectable={true}` on `<ReactFlow>`
- [ ] `onReconnect` handler: update the relationship's source/target (server) + update edge in store
- [ ] Validate reconnection: prevent self-connections, prevent duplicates
- [ ] Visual feedback: edge detaches from original handle and follows cursor to new target

### Edge Selection & Interaction

- [ ] Click to select edge (built-in `elementsSelectable`)
- [ ] Selected edge highlights with thicker stroke + accent color
- [ ] `interactionWidth={20}` on edges for easier click targeting (invisible hit area wider than visible stroke)
- [ ] Delete key removes edge from diagram (with option to delete relationship entirely via context menu)

### Data Loading & Persistence

- [ ] Converter: `diagram_relationships` → React Flow `Edge[]` with correct:
    - `type` (curved/straight/orthogonal from `path_type`)
    - `markerStart`/`markerEnd` (from `direction`)
    - `sourceHandle`/`targetHandle` (from anchors)
    - `label` (from description)
    - `style` (from `line_style` + `style_json`)
    - `data` (full `RelationshipEdgeData` for custom edge component access)
- [ ] Persist visual property changes (path type, line style, anchor changes) via server functions

## Key Files

- `src/components/editor/edges/curved-edge.tsx` — bezier custom edge
- `src/components/editor/edges/straight-edge.tsx` — straight custom edge
- `src/components/editor/edges/orthogonal-edge.tsx` — step/orthogonal custom edge
- `src/components/editor/edges/edge-label.tsx` — styled label component used by all edge types
- `src/lib/converters/relationship-to-edge.ts` — DB → React Flow edge converter
- `src/lib/converters/direction-to-markers.ts` — direction → markerStart/markerEnd mapping

## Design Notes

- **Direction is on the relationship, visual style is per-diagram:** The `direction` field (outgoing/incoming/
  bidirectional/none) comes from the relationship itself (phase 2b) and affects arrow markers. The `path_type`,
  `line_style`, `label_position`, and `anchor` settings are per-diagram (stored in `diagram_relationships`) and
  can differ across diagrams showing the same relationship.
- **Edge type naming:** React Flow's built-in edge types are `default` (bezier), `straight`, `step`, `smoothstep`.
  We register our own types (`curved`, `straight`, `orthogonal`) to match our data model naming and add custom
  rendering (line style, labels, markers).
- **Handle visibility:** Handles are styled to be invisible by default (transparent, small). They become visible
  (colored dots) on node hover or when in add-relationship mode. This keeps the canvas clean while making connections
  discoverable.
- **`interactionWidth`:** React Flow edges are thin SVG paths that are hard to click. Setting `interactionWidth={20}`
  adds an invisible wider hit area around each edge for easier selection.

## Verification

- [ ] Relationships render between elements with correct path types (curved, straight, orthogonal)
- [ ] Direction arrows render correctly for all 4 direction types
- [ ] Line styles render correctly (solid, dashed, dotted)
- [ ] Labels show at correct positions along the edge with description text
- [ ] Labels hide at low zoom levels
- [ ] Add relationship mode: drag from handle to handle creates a connection
- [ ] Edge reconnection: drag endpoint to reconnect to a different node
- [ ] Connection validation prevents self-connections and duplicates
- [ ] Anchor points work (auto connects to nearest side, fixed connects to specific side)
- [ ] Click selects an edge, selected edge highlights
- [ ] Delete key removes edge from diagram
- [ ] All edge rendering works in dark mode
- [ ] `pnpm dev` and `pnpm build` succeed
