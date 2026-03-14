# Phase 3b — Canvas Rendering

## Status: Complete

## Goal

Build the diagram canvas using React Flow v12 (`@xyflow/react`) with pan, zoom, grid, snap, dark mode, C4 node types,
sub-flow nesting, and Zustand state management.

## Prerequisites

- Phase 3a (Diagram CRUD & Schema) — complete

## Canvas Library: React Flow v12

Package: `@xyflow/react` (v12.x — NOT the old `reactflow` package).

React Flow provides out of the box:

- Pan and zoom (scroll wheel, trackpad, pinch, controls)
- Node rendering as React components (HTML-based — great for text, icons, badges)
- Edge rendering (SVG) with labels, markers, and custom paths
- Selection (click, shift-click, rubber band selection box)
- Drag to move, NodeResizer for resize, NodeToolbar for context actions
- Sub-flows with `parentId` (child nodes live inside parent nodes)
- MiniMap, Background (dots/lines/cross), Controls, Panel components
- Snap-to-grid, connection validation, edge reconnection
- Built-in dark mode via `colorMode` prop
- Zustand-based internally — seamless integration with external Zustand stores
- Full TypeScript support with generic node/edge types

## React Flow Architecture

```
┌─ ReactFlowProvider ─────────────────────────────────────────────┐
│                                                                  │
│  ┌─ Zustand Store (editor-store.ts) ──────────────────────────┐ │
│  │  nodes: AppNode[]    edges: AppEdge[]    mode, selection... │ │
│  └────────────────────────────────────────────────────────────┘ │
│          ↕ reads/writes                                          │
│  ┌─ ReactFlow ───────────────────────────────────────────────┐  │
│  │  nodeTypes={nodeTypes}  edgeTypes={edgeTypes}             │  │
│  │  colorMode="system"  snapToGrid  fitView                  │  │
│  │                                                            │  │
│  │  ┌─ Background (dots) ┐  ┌─ MiniMap ┐  ┌─ Controls ┐    │  │
│  │  └────────────────────┘  └──────────┘  └───────────┘    │  │
│  │  ┌─ Panel (toolbar) ─────────────────────────────────┐    │  │
│  │  └───────────────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Properties Panel (outside ReactFlow) ─────────────────────┐ │
│  │  Reads selection from store, edits element/relationship     │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Tasks

### Setup & Infrastructure

- [x] Install `@xyflow/react` package (`pnpm add @xyflow/react`)
- [x] Import base styles: `@xyflow/react/dist/base.css` (base only — we use Tailwind for theming)
- [x] Create editor page route (`diagram.$diagramId.tsx`) wrapped in `<ReactFlowProvider>`
- [x] Editor page layout: toolbar (top) + canvas (center) + side panel placeholder (right)

### TypeScript Types

- [x] Define typed node union using React Flow generics:
    ```ts
    type PersonNode = Node<PersonNodeData, 'person'>;
    type SystemNode = Node<SystemNodeData, 'system'>;
    type ContainerNode = Node<ContainerNodeData, 'container'>;
    type ComponentNode = Node<ComponentNodeData, 'component'>;
    type GroupNode = Node<GroupNodeData, 'group'>;
    type AppNode = PersonNode | SystemNode | ContainerNode | ComponentNode | GroupNode;
    ```
- [x] Define typed edge union:
    ```ts
    type CurvedEdge = Edge<RelationshipEdgeData, 'curved'>;
    type StraightEdge = Edge<RelationshipEdgeData, 'straight'>;
    type OrthogonalEdge = Edge<RelationshipEdgeData, 'orthogonal'>;
    type AppEdge = CurvedEdge | StraightEdge | OrthogonalEdge;
    ```
- [ ] Pass generics to hooks: `useReactFlow<AppNode, AppEdge>()` *(deferred — not needed until Phase 3c when canvas interactions require typed hook access)*

### Zustand Editor Store

- [x] Create `src/stores/editor-store.ts` with:
    ```ts
    {
      // React Flow state
      nodes: AppNode[],
      edges: AppEdge[],
      onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
      onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
      onConnect: (connection) => set({ edges: addEdge(connection, get().edges) }),

      // Editor state
      mode: 'select' | 'pan' | 'add_element' | 'add_relationship',
      addElementType: ElementType | null,
      selectedNodeIds: string[],
      selectedEdgeIds: string[],
      sidePanel: 'properties' | 'tree' | null,
      diagramSettings: { gridSize, snapToGrid },

      // Actions
      setNodes, setEdges, updateNodeData, updateNodePosition,
      setMode, setSelection, ...
    }
    ```
- [x] Connect store to `<ReactFlow>` via selectors (nodes, edges, onNodesChange, onEdgesChange, onConnect)

### React Flow Canvas Component

- [x] Create `<DiagramCanvas>` wrapper component with these props on `<ReactFlow>`:
    ```tsx
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
      onNodeDragStop={onNodeDragStop}    // persist position to server
      colorMode="system"                  // dark mode support
      snapToGrid={diagramSettings.snapToGrid}
      snapGrid={[gridSize, gridSize]}
      fitView
      selectNodesOnDrag={false}
      selectionMode={SelectionMode.Partial}
      panOnDrag={mode === 'pan' ? true : [1]}  // middle mouse or pan mode
      selectionOnDrag={mode === 'select'}
      deleteKeyCode="Backspace"
      selectionKeyCode="Shift"
      panActivationKeyCode="Space"
      connectionMode={ConnectionMode.Loose}
      defaultEdgeOptions={{ animated: false, type: 'curved' }}
    >
      <Background variant={BackgroundVariant.Dots} gap={gridSize} />
      <Controls showInteractive={false} />
      <MiniMap nodeColor={getNodeColor} zoomable pannable />
      <Panel position="top-center">{/* Editor toolbar */}</Panel>
    </ReactFlow>
    ```

### Custom C4 Node Types

- [x] Define `nodeTypes` object **outside** the component (prevents re-renders):
    ```ts
    const nodeTypes = {
      person: PersonNode,
      system: SystemNode,
      container: ContainerNode,
      component: ComponentNode,
      group: GroupNode,    // scope element rendered as resizable group
    } satisfies NodeTypes;
    ```
- [x] **PersonNode** — rounded card with person icon (Lucide `User`), name, display description
- [x] **SystemNode** — large rounded rectangle, name, display description, technology badges, status dot
- [x] **ContainerNode** — medium rounded rectangle, technology label, status dot
- [x] **ComponentNode** — rectangle with component icon (Lucide `Cpu`), technology label
- [x] **GroupNode** — scope element that acts as a parent container (thin border, label at top, resizable)
- [x] All custom nodes include:
    - `<Handle>` components for connections (type="source" and type="target" on all 4 sides)
    - `<NodeResizer>` for resize support (min/max dimensions per type)
    - ~~`<NodeToolbar>` (delete, duplicate, edit — shown on hover/selection)~~ *(deferred to Phase 3c)*
    - Status badge (planned=blue dot, live=green dot, deprecated=red dot)
    - External indicator (dashed border + subtle background tint when `external=true`)
    - ~~`className="nodrag"` on any interactive elements (inputs, buttons)~~ *(no interactive elements yet)*
    - Tailwind dark mode support via shadcn CSS variables
- [x] Use `memo()` on all custom node components for performance

### Sub-Flow / Parent-Child Nesting

- [x] On Container diagrams: scope element (System) renders as `GroupNode`, child Containers get `parentId`
- [x] On Component diagrams: scope element (Container) renders as `GroupNode`, child Components get `parentId`
- [x] Child nodes use `extent: 'parent'` to constrain movement within parent bounds
- [x] Parent nodes must appear before children in the nodes array
- [x] Moving a parent automatically moves all children (React Flow built-in)

### Data Loading & Persistence

- [x] Server function: `getDiagramData(diagramId)` — returns diagram + diagram_elements + diagram_relationships
  joined with their core element/relationship data
- [x] Converter: `toFlowNodes → AppNode[]` — maps DB rows to React Flow nodes with correct parentId,
  position, dimensions, data, and type
- [x] Converter: `toFlowEdges → AppEdge[]` — maps DB rows to React Flow edges with correct type,
  markers, labels, and style
- [x] `onNodeDragStop` handler: persist position to server via `updateDiagramElement`
- [x] `onNodesDelete` / `onEdgesDelete` handlers: remove via server functions

### Dark Mode

- [x] Use `colorMode="system"` on `<ReactFlow>` (reads OS preference)
- [x] Import `@xyflow/react/dist/base.css` only (not full styles) — custom theme via Tailwind
- [x] Override React Flow CSS variables in `src/styles.css` for both light and dark themes:
    ```css
    .react-flow {
      --xy-node-border-default: var(--border);
      --xy-edge-stroke-default: var(--muted-foreground);
      /* etc. */
    }
    ```
- [x] All custom nodes use shadcn CSS variables (auto dark mode via `bg-card`, `text-card-foreground`, etc.)

### Diagram List Navigation

- [x] Diagram name column in table renders as `<Link>` to editor page
- [x] `workspaceSlug` passed to column actions for link generation

### i18n

- [x] Canvas keys added to `messages/en.json` and `messages/nl.json`

## Key Files

- `src/stores/editor-store.ts` — Zustand store for React Flow state + editor state
- `src/lib/types/diagram-nodes.ts` — AppNode, AppEdge type definitions
- `src/lib/converters/diagram-to-flow.ts` — DB → React Flow node/edge converters
- `src/lib/converters/flow-to-diagram.ts` — React Flow → DB converters for persistence
- `src/components/editor/diagram-canvas.tsx` — React Flow wrapper component
- `src/components/editor/nodes/person-node.tsx` — Person custom node
- `src/components/editor/nodes/system-node.tsx` — System custom node
- `src/components/editor/nodes/container-node.tsx` — Container custom node
- `src/components/editor/nodes/component-node.tsx` — Component custom node
- `src/components/editor/nodes/group-node.tsx` — Scope/parent group node
- `src/components/editor/nodes/status-dot.tsx` — Shared status indicator component
- `src/components/editor/nodes/index.ts` — nodeTypes registry
- `src/routes/_protected/_onboarded/workspace/$workspaceSlug/diagram.$diagramId.tsx` — editor page

## Design Notes

- **Controlled flow with Zustand:** We use a controlled `<ReactFlow>` where nodes/edges live in our Zustand store.
  React Flow's `onNodesChange`/`onEdgesChange` apply changes via `applyNodeChanges`/`applyEdgeChanges`. This gives us
  full control for undo/redo (phase 3e) and keeps the store as single source of truth.
- **`nodeTypes` and `edgeTypes` must be stable references** — defined outside the component or via `useMemo`. If they
  change identity, React Flow re-mounts all nodes/edges (performance disaster).
- **Import base.css, not style.css:** We import only `@xyflow/react/dist/base.css` (required for functionality) and
  handle all visual theming through Tailwind + CSS variables. This avoids conflicts with our design system.
- **Node dimensions:** Use `initialWidth`/`initialHeight` on nodes for default sizes. React Flow measures actual
  dimensions via `node.measured.width/height`. Don't set `width`/`height` directly (those override measurement).
- **Performance:** `memo()` all custom nodes. Use Zustand selectors to avoid re-rendering the entire tree on every
  state change. For large diagrams (50+ nodes), consider `useStore()` with fine-grained selectors.

## Verification

- [x] Canvas renders with dot grid background (light and dark mode)
- [x] All 4 C4 node types render distinctly with correct shapes and content
- [x] Group node renders for scope element with children nested inside
- [x] Pan (Space+drag, middle mouse) and zoom (scroll, pinch, +/- controls) work smoothly
- [x] Snap-to-grid aligns elements when dragging
- [x] MiniMap shows element positions with type-based colors
- [x] Node positions and sizes persist after page reload
- [x] Dark mode switches correctly (nodes, edges, grid, minimap, controls)
- [x] External elements render with dashed border
- [x] Status badges show correct colors
- [x] `pnpm build` succeeds
