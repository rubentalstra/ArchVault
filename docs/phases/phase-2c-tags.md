# Phase 2c — Tags

## Status: Not Started

## Goal
Add a tag system for categorizing elements and relationships.

## Prerequisites
- Phase 2b (Relationships) — complete

## Tasks
- [ ] Drizzle schemas for `tags`, `element_tags`, `relationship_tags` (many-to-many)
- [ ] Run migration
- [ ] Tag CRUD server functions (scoped to workspace)
- [ ] Tag assignment to elements (add/remove tags)
- [ ] Tag assignment to relationships (add/remove tags)
- [ ] Tag filtering in elements table
- [ ] Tag filtering in relationships table
- [ ] Tag management UI (create, rename, delete tags)
- [ ] Tag badges on element and relationship rows

## CLI Commands
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `src/lib/schema/tags.ts` — Drizzle schemas (tags, element_tags, relationship_tags)
- `src/lib/server/tags.ts` — server functions
- `src/components/tags/tag-picker.tsx` — tag assignment component
- `src/components/tags/tag-manager.tsx` — tag CRUD UI

## Verification
- [ ] Create, rename, delete tags
- [ ] Assign tags to elements and relationships
- [ ] Filter tables by tags
- [ ] Tag badges render correctly
- [ ] `pnpm dev` and `pnpm build` succeed
