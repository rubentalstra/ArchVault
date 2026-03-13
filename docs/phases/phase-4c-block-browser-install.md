# Phase 4c — Block Browser & Install

## Status: Not Started

## Goal
Build the block browser UI and dynamic install flow.

## Prerequisites
- Phase 4a (Block Schemas & Validation) — complete

## Tasks
- [ ] Block browser page with TanStack Table + type-safe search params (type, category, search, page)
- [ ] Block detail view (name, summary, description, inputs, preview)
- [ ] Install flow: dynamic TanStack Form generated from `block.json` inputs
- [ ] Element pickers for container blocks (pick target system)
- [ ] Element pickers for component blocks (pick target container)
- [ ] Template resolution on install (resolve inputs → create elements + relationships)
- [ ] Drizzle schema for `block_installations` table
- [ ] Server functions: track installations, list installed blocks
- [ ] Uninstall flow (remove created elements + relationships)

## CLI Commands
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `src/lib/schema/block-installations.ts` — Drizzle schema
- `src/lib/server/blocks.ts` — server functions
- `src/routes/_protected/workspace/$workspaceSlug/blocks.tsx` — block browser
- `src/components/blocks/block-browser.tsx` — browser with filters
- `src/components/blocks/block-install-form.tsx` — dynamic install form
- `src/components/blocks/element-picker.tsx` — element ref picker

## Verification
- [ ] Block browser lists all official blocks with filtering
- [ ] Install form renders correct inputs per block type
- [ ] Element pickers show valid targets
- [ ] Installing a block creates elements + relationships
- [ ] Installation tracked in `block_installations`
- [ ] `pnpm dev` and `pnpm build` succeed
