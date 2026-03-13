# Phase 3e — Autosave, Hotkeys, Undo/Redo

## Status: Not Started

## Goal
Add autosave, keyboard shortcuts, undo/redo, and clipboard to the editor.

## Prerequisites
- Phase 3c (Editor Interactions) — complete
- Phase 3d (Canvas Relationships) — complete

## Tasks
- [ ] TanStack Pacer: autosave with 1500ms debounce (trailing)
- [ ] TanStack Pacer: canvas drag throttle at 16ms (60fps)
- [ ] TanStack Pacer: undo snapshot debounce at 300ms
- [ ] Undo/redo stacks in Zustand store
- [ ] Clipboard support: copy/paste selected elements + relationships
- [ ] TanStack Hotkeys integration — all keyboard shortcuts:
  - `Ctrl/Cmd+Z` → Undo
  - `Ctrl/Cmd+Shift+Z` → Redo
  - `Ctrl/Cmd+C` → Copy selected
  - `Ctrl/Cmd+V` → Paste
  - `Ctrl/Cmd+A` → Select all
  - `Delete/Backspace` → Delete selected
  - `Escape` → Deselect / cancel
  - `Ctrl/Cmd+S` → Force save
  - `Ctrl/Cmd+G` → Toggle grid
  - `Ctrl/Cmd+L` → Toggle lock
  - `Space` (hold) → Pan mode
  - `+/-` → Zoom in/out
  - `Ctrl/Cmd+0` → Reset zoom
  - `?` → Show shortcuts overlay
- [ ] Shortcuts overlay dialog
- [ ] Autosave status indicator (saved/saving/error)

## Key Files
- `src/components/editor/autosave.tsx` — autosave hook with Pacer
- `src/components/editor/hotkeys.tsx` — hotkey bindings
- `src/components/editor/shortcuts-overlay.tsx` — shortcuts help dialog
- `src/stores/editor-store.ts` — undo/redo/clipboard actions

## Verification
- [ ] Autosave triggers after 1500ms of inactivity
- [ ] All keyboard shortcuts work
- [ ] Undo/redo restores previous states
- [ ] Copy/paste duplicates elements
- [ ] Shortcuts overlay shows all bindings
- [ ] `pnpm dev` and `pnpm build` succeed
