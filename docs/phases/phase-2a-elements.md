# Phase 2a — Elements

## Status: Not Started

## Goal
Implement C4 element CRUD with hierarchy validation, tree view, and table view.

## Prerequisites
- Phase 1f (Workspaces) — complete

## Tasks
- [ ] Drizzle schema for `elements` table (id, workspace_id, parent_element_id, element_type, name, description, technology, external, metadata_json, source_block_installation_id, created_by, updated_by, deleted_at, created_at, updated_at)
- [ ] Run migration
- [ ] Server functions: element CRUD with Zod validation
- [ ] `validateElementHierarchy()` — enforce C4 parent rules:
  - Person → no parent
  - System → no parent (or parent is another System)
  - Container → parent must be a System
  - Component → parent must be a Container
- [ ] Element tree sidebar with TanStack Virtual (nested, collapsible)
- [ ] Element CRUD forms with TanStack Form + shadcn/ui
- [ ] Elements table view with TanStack Table (name, type, technology, parent, actions)
- [ ] Permission checks (org role-based: viewer = read only)

## CLI Commands
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `src/lib/schema/elements.ts` — Drizzle schema
- `src/lib/server/elements.ts` — server functions with Zod validation
- `src/lib/validators/element-hierarchy.ts` — hierarchy validation
- `src/routes/_protected/workspace/$workspaceSlug/elements.tsx` — elements page
- `src/components/elements/element-tree.tsx` — virtual tree sidebar
- `src/components/elements/element-form.tsx` — create/edit form
- `src/components/tables/element-columns.tsx` — table column definitions

## Verification
- [ ] Create elements of all 4 types (person, system, container, component)
- [ ] Hierarchy rules enforced (e.g., container without system parent fails)
- [ ] Element tree renders with nesting and collapse
- [ ] Table view shows all elements with sorting/filtering
- [ ] `pnpm dev` and `pnpm build` succeed
