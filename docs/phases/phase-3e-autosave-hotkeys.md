# Phase 3e — Autosave, Hotkeys, Undo/Redo

## Status: Not Started

## Goal

Add autosave with debounce, keyboard shortcuts, undo/redo with snapshot stack, and clipboard (copy/paste) to the
diagram editor.

## Prerequisites

- Phase 3c (Editor Interactions) — complete
- Phase 3d (Canvas Relationships) — complete

## Tasks

### Autosave

- [ ] Track dirty state in Zustand store: `isDirty: boolean`, `lastSavedAt: Date | null`
- [ ] Debounced autosave (~1500ms trailing): saves all pending changes (positions, sizes, properties) to server
- [ ] Throttle position updates during drag (~16ms / 60fps) — use `onNodeDrag` for live preview,
  `onNodeDragStop` for persistence
- [ ] Autosave status indicator in toolbar:
    - Saved (check icon + "Saved" text)
    - Saving (spinner icon + "Saving...")
    - Error (warning icon + "Save failed" with retry button)
- [ ] Force save on `Ctrl/Cmd+S` (prevents browser default save dialog)
- [ ] Save before navigating away (via `beforeunload` event + router `beforeLoad` guard)

### Undo/Redo

- [ ] Add to Zustand store:
    ```ts
    undoStack: DiagramSnapshot[],
    redoStack: DiagramSnapshot[],
    pushSnapshot: () => void,    // capture current state before a change
    undo: () => void,            // pop undoStack, push current to redoStack
    redo: () => void,            // pop redoStack, push current to undoStack
    ```
- [ ] `DiagramSnapshot` captures: `{ nodes: AppNode[], edges: AppEdge[] }` (positions + data)
- [ ] Push snapshot before: node move, node resize, element add/delete, edge add/delete, property changes
- [ ] Debounce snapshot capture (~300ms) to batch rapid sequential changes (e.g., typing in a field)
- [ ] Stack size limit: 50 snapshots max (drop oldest when full)
- [ ] Undo/redo restores both local state and triggers server sync
- [ ] Toolbar buttons: undo (disabled when stack empty), redo (disabled when stack empty)

### Clipboard

- [ ] Copy (`Ctrl/Cmd+C`): serialize selected nodes + connected edges to clipboard in Zustand store
- [ ] Paste (`Ctrl/Cmd+V`):
    - Deep-copy selected nodes with new UUIDs
    - Offset position by +20px, +20px to avoid stacking on originals
    - Create new elements (server) + `diagram_elements` rows
    - Re-create edges between pasted nodes (with new relationship IDs)
    - Select pasted nodes after paste
- [ ] Cut (`Ctrl/Cmd+X`): copy + delete originals from diagram
- [ ] Duplicate (`Ctrl/Cmd+D`): copy + immediate paste (shortcut for copy+paste)

### Keyboard Shortcuts

- [ ] Keyboard shortcut system using React Flow's built-in key codes + custom handler:

    | Shortcut             | Action                          | Notes                                |
    | -------------------- | ------------------------------- | ------------------------------------ |
    | `Ctrl/Cmd+Z`         | Undo                            |                                      |
    | `Ctrl/Cmd+Shift+Z`   | Redo                            |                                      |
    | `Ctrl/Cmd+C`         | Copy selected                   |                                      |
    | `Ctrl/Cmd+V`         | Paste                           |                                      |
    | `Ctrl/Cmd+X`         | Cut selected                    |                                      |
    | `Ctrl/Cmd+D`         | Duplicate selected              |                                      |
    | `Ctrl/Cmd+A`         | Select all nodes                | `useReactFlow().getNodes()` → select |
    | `Delete/Backspace`   | Remove selected from diagram    | React Flow built-in `deleteKeyCode`  |
    | `Escape`             | Deselect all / cancel mode      | Reset to select mode                 |
    | `Ctrl/Cmd+S`         | Force save                      | Prevent browser default              |
    | `Ctrl/Cmd+G`         | Toggle grid visibility          |                                      |
    | `Space` (hold)       | Pan mode while held             | React Flow `panActivationKeyCode`    |
    | `+` / `=`            | Zoom in                         | `useReactFlow().zoomIn()`            |
    | `-`                  | Zoom out                        | `useReactFlow().zoomOut()`           |
    | `Ctrl/Cmd+0`         | Fit view (reset zoom)           | `useReactFlow().fitView()`           |
    | `1`                  | Select mode                     |                                      |
    | `2`                  | Pan mode                        |                                      |
    | `3`                  | Add element mode                |                                      |
    | `4`                  | Add relationship mode           |                                      |
    | `?`                  | Show shortcuts overlay          |                                      |

- [ ] Shortcuts **disabled** when focus is in:
    - Text inputs, textareas, contenteditable (properties panel, description editor)
    - Dialogs/modals
    - Use `event.target.tagName` check or React Flow's `noDragClassName` pattern
- [ ] Use React Flow's `useKeyPress()` hook for simple key detection where appropriate

### Shortcuts Overlay

- [ ] Modal dialog listing all keyboard shortcuts (triggered by `?` key)
- [ ] Organized by category: General, Navigation, Selection, Editing
- [ ] Shows platform-appropriate modifier (Cmd on Mac, Ctrl on Windows/Linux)

## Key Files

- `src/hooks/use-autosave.ts` — autosave hook with debounce + dirty tracking
- `src/hooks/use-editor-hotkeys.ts` — keyboard shortcut bindings
- `src/stores/editor-store.ts` — undo/redo/clipboard slices added to existing store
- `src/components/editor/autosave-indicator.tsx` — save status badge in toolbar
- `src/components/editor/shortcuts-overlay.tsx` — shortcuts help dialog

## Design Notes

- **Autosave is debounced, drag sync is throttled:** During a drag, `onNodeDrag` updates local state at 60fps for
  smooth visual feedback. `onNodeDragStop` triggers a save. Autosave catches any other pending changes after 1.5s
  of inactivity. These are complementary, not conflicting.
- **Snapshot-based undo:** We capture full state snapshots rather than operation-based undo. This is simpler to
  implement and works well for diagram editors where operations are coarse-grained (move, resize, add, delete).
  The tradeoff is higher memory usage — mitigated by the 50-snapshot limit.
- **Delete = remove from diagram, not delete element:** The `Delete` key removes the node from the current diagram
  only (deletes the `diagram_elements` row). The element still exists in the workspace and on other diagrams.
  To permanently delete an element, use the context menu or properties panel "Delete element" action with a
  confirmation dialog.
- **Copy/paste across diagrams:** The clipboard stores element data, not diagram_element references. This means
  paste creates new elements. Cross-diagram copy/paste is possible because the clipboard is in the Zustand store
  (persists across route navigations within the same session).

## Verification

- [ ] Autosave triggers after 1.5s of inactivity
- [ ] Autosave indicator shows correct state (saved/saving/error)
- [ ] Force save works with Ctrl/Cmd+S
- [ ] Undo reverses last action, redo re-applies it
- [ ] Undo/redo buttons in toolbar are disabled when stack is empty
- [ ] Copy/paste duplicates selected elements at offset position
- [ ] Cut removes originals after copying
- [ ] Duplicate creates an immediate copy
- [ ] All keyboard shortcuts work correctly
- [ ] Shortcuts do NOT fire when typing in text inputs or description editor
- [ ] Shortcuts overlay shows all bindings with correct platform modifiers
- [ ] Number keys (1-4) switch editor modes
- [ ] `pnpm dev` and `pnpm build` succeed
