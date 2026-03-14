# Phase 3c — Editor Interactions & Properties Panel

## Status: Not Started

## Goal

Add editor modes, element placement, resize, z-index management, context menus, connection validation, and the
IcePanel-style element/relationship properties side panel.

## Prerequisites

- Phase 3b (Canvas Rendering) — complete

## Tasks

### Selection & Interaction (built into React Flow)

- [ ] Click to select node (built-in `elementsSelectable`)
- [ ] Shift-click for multi-select (built-in `multiSelectionKeyCode`)
- [ ] Selection box / rubber band (built-in `selectionOnDrag` when in select mode)
- [ ] `SelectionMode.Partial` — elements partially inside the box are selected
- [ ] Drag to move selected nodes (built-in `nodesDraggable`)
- [ ] Resize nodes via `<NodeResizer>` (already in custom nodes from 3b)
- [ ] Sync React Flow selection → Zustand store via `onSelectionChange` callback:
    ```ts
    onSelectionChange={({ nodes, edges }) => {
      store.setSelection(nodes.map(n => n.id), edges.map(e => e.id));
    }}
    ```

### Z-Index Management

- [ ] Right-click context menu on nodes (via `onNodeContextMenu`):
    - Bring to front (set highest z-index)
    - Send to back (set lowest z-index)
    - Duplicate element
    - Remove from diagram
    - Delete element (with confirmation)
- [ ] Right-click context menu on edges (via `onEdgeContextMenu`):
    - Edit properties
    - Remove from diagram
    - Delete relationship (with confirmation)
- [ ] Right-click on canvas pane (via `onPaneContextMenu`):
    - Add element (submenu by type)
    - Paste (if clipboard has content)
    - Fit view
    - Toggle grid
- [ ] Use `elevateEdgesOnSelect={true}` to raise selected edges above nodes

### Editor Toolbar

- [ ] Editor mode toolbar (`<Panel position="top-center">`) with:
    - **Select mode** (pointer icon) — default. Click to select, drag to rubber-band select
    - **Pan mode** (hand icon) — drag to pan. Also activated by holding Space
    - **Add element** dropdown button (Plus icon → submenu: Person / System / Container / Component)
    - **Add relationship** mode (arrow icon) — click source → click target to connect
    - Separator
    - **Zoom controls**: zoom in, zoom out, fit view (`useReactFlow().fitView()`)
    - **Grid toggle**: show/hide background grid
    - **Minimap toggle**: show/hide minimap
- [ ] Mode state drives React Flow props:
    ```ts
    panOnDrag={mode === 'pan' ? true : [1]}     // pan mode or middle-click
    selectionOnDrag={mode === 'select'}           // rubber band in select mode
    nodesDraggable={mode === 'select'}            // only drag in select mode
    nodesConnectable={mode === 'add_relationship'} // connect mode
    ```

### Add Element Mode

- [ ] Click canvas in add mode → use `screenToFlowPosition()` to get canvas coordinates
- [ ] Create new element (server function) + create `diagram_elements` row at click position
- [ ] On sub-flow diagrams: if click is inside a group node, set the new element's `parent_element_id`
  to the group's element
- [ ] Scope validation: gray out element types not valid for the current diagram C4 level
- [ ] After placing, switch back to select mode and select the new node

### Connection Validation

- [ ] `isValidConnection` callback on `<ReactFlow>` to validate new connections:
    - Prevent self-connections (source === target)
    - Prevent duplicate edges (same source + target already exists)
    - Optionally validate based on C4 rules (e.g., Person can't contain Components)
- [ ] `connectionMode={ConnectionMode.Loose}` — allow connecting to any handle, not just matching types

### Properties Side Panel

- [ ] Collapsible side panel (right side of editor, 320px width):
    - Opens when a single node or edge is selected
    - Closes on deselect or multi-select (multi-select shows count only)
    - **Details tab** and **Connections tab** toggle (like IcePanel)
- [ ] **Element properties panel** (Details tab — matches IcePanel layout):
    - Name (inline editable text)
    - Display description (editable, max 120 chars)
    - Type (read-only badge: Person / System / Container / Component)
    - Scope (Internal / External toggle)
    - Belongs to (parent element — read-only link, click to navigate)
    - Status selector (planned / live / deprecated with colored dots)
    - Contains (child count — read-only, click to expand)
    - Technologies list (add/remove/reorder)
    - Tags (tag picker — renders if phase 2c complete, gracefully hidden otherwise)
    - Links (add/remove external URLs)
    - In N diagrams (read-only count with list popover)
    - Detailed description (Tiptap rich text editor)
- [ ] **Element connections tab**:
    - List of relationships involving this element (as source or target)
    - Each row shows: direction arrow, connected element name, description
    - Click a connection to select its edge on canvas
- [ ] **Relationship properties panel** (when an edge is selected):
    - Source element (read-only link, click to select source node)
    - Target element (read-only link, click to select target node)
    - Direction selector (outgoing / incoming / bidirectional / none)
    - Description (editable text)
    - Technology (editable text)
    - Status (planned / live / deprecated)
    - Per-diagram visual properties: path type, line style, label position slider
    - Tags (if phase 2c complete)
- [ ] **Empty state** (nothing selected): show diagram settings (name, description, grid size, snap toggle)
- [ ] **Multi-select state**: show count of selected elements, bulk actions (delete, change status)
- [ ] All property changes use `useServerFn()` + `useQueryClient().invalidateQueries()` to persist and sync

### Navigate Between Diagrams

- [ ] "View lower" link on elements that have a child diagram (like IcePanel's "View lower" button)
- [ ] Double-click a System node on a Context diagram → navigate to its Container diagram (if one exists)

## Key Files

- `src/components/editor/editor-toolbar.tsx` — mode toolbar with all controls
- `src/components/editor/context-menu.tsx` — right-click context menus (node, edge, pane)
- `src/components/editor/properties-panel.tsx` — side panel wrapper with tabs
- `src/components/editor/panels/element-properties.tsx` — element detail/edit panel
- `src/components/editor/panels/element-connections.tsx` — connections list tab
- `src/components/editor/panels/relationship-properties.tsx` — relationship detail/edit panel
- `src/components/editor/panels/diagram-settings.tsx` — diagram settings (empty state)
- `src/components/editor/add-element-mode.tsx` — element placement interaction

## Design Notes

- **React Flow handles the heavy lifting:** Selection, drag, multi-select, rubber band, resize, connection creation,
  and edge reconnection are all built into React Flow. Our code mainly handles: (1) editor mode state driving React
  Flow props, (2) the properties panel reading/writing to our data model, (3) context menus, (4) connection validation.
- **Properties panel updates core data:** Changes in the properties panel update the phase 2 tables (elements,
  relationships), not just diagram-level visual properties. This means renaming an element in the panel renames it
  across all diagrams.
- **Scope validation on add:** The toolbar disables element types not valid for the current diagram level. On a Context
  diagram, Container and Component are grayed out. On a Container diagram scoped to System X, only types allowed
  within that system are enabled.
- **`nodrag` / `nopan` / `nowheel` classes:** Use these on interactive elements inside nodes and on the properties
  panel to prevent React Flow from intercepting mouse events meant for form inputs, sliders, etc.

## Verification

- [ ] Click selects element, shift-click multi-selects
- [ ] Rubber band selection works in select mode
- [ ] Drag moves elements, resize works with NodeResizer
- [ ] Mode switching works (select, pan, add element, add relationship)
- [ ] Add element mode places new elements at click position
- [ ] Context menus appear on right-click (node, edge, pane)
- [ ] Connection validation prevents self-connections and duplicates
- [ ] Properties panel shows element details when a node is selected
- [ ] Properties panel shows relationship details when an edge is selected
- [ ] Editing properties in the panel persists changes to the server
- [ ] Connections tab lists all relationships for the selected element
- [ ] Z-index controls work (bring to front, send to back)
- [ ] Double-click navigates to child diagram
- [ ] Dark mode renders correctly for all panels and menus
- [ ] `pnpm dev` and `pnpm build` succeed
