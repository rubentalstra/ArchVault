# Phase 3a — Diagram CRUD & Schema

## Status: Not Started

## Goal
Create diagram database schemas, CRUD operations, and scope validation.

## Prerequisites
- Phase 2a (Elements) — complete

## Tasks
- [ ] Drizzle schemas: `diagrams`, `diagram_revisions`, `diagram_elements`, `diagram_relationships`
- [ ] Run migrations
- [ ] Diagram CRUD server functions with scope validation:
  - Context diagram: can contain Persons, Systems; scope = null or System
  - Container diagram: can contain Persons, Systems, Containers; scope must be a System
  - Component diagram: can contain Persons, Systems, Containers, Components; scope must be a Container
- [ ] Diagram list page with TanStack Table (name, level, status, revision count, actions)
- [ ] Create diagram form (TanStack Form — level, name, description, scope element picker)
- [ ] Edit diagram settings form (name, description, grid options, snap settings)

## CLI Commands
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `src/lib/schema/diagrams.ts` — diagrams table
- `src/lib/schema/diagram-revisions.ts` — revisions table
- `src/lib/schema/diagram-elements.ts` — diagram element positions
- `src/lib/schema/diagram-relationships.ts` — diagram relationship rendering
- `src/lib/server/diagrams.ts` — server functions
- `src/lib/validators/diagram-scope.ts` — scope validation
- `src/routes/_protected/workspace/$workspaceSlug/diagrams.tsx` — diagram list
- `src/components/diagrams/create-diagram-dialog.tsx` — creation form

## Verification
- [ ] Create diagrams at all 3 levels (context, container, component)
- [ ] Scope validation enforced (e.g., container diagram requires system scope)
- [ ] Diagram list shows all diagrams with correct metadata
- [ ] `pnpm dev` and `pnpm build` succeed
