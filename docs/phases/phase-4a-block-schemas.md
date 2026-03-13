# Phase 4a — Block Schemas & Validation

## Status: Not Started

## Goal
Define JSON Schemas and Zod validators for the block system.

## Prerequisites
- Phase 3f (Revisions & Lifecycle) — complete

## Tasks
- [ ] Create JSON Schema: `block.base.schema.json` — shared structures (inputs, elements, relationships)
- [ ] Create JSON Schema: `system.block.schema.json` — person/system/container/component, no element_ref
- [ ] Create JSON Schema: `container.block.schema.json` — container/component, requires system element_ref
- [ ] Create JSON Schema: `component.block.schema.json` — component only, requires container element_ref
- [ ] Create matching Zod schemas in `src/lib/blocks/schemas/`
- [ ] `parseBlock()` dispatcher — route to correct schema by `block_type`
- [ ] Template validation (`{{input_key}}` syntax, valid references)
- [ ] Hierarchy validation (element types match block type rules)
- [ ] Reference validation (`parent_template_key`, relationship source/target)
- [ ] `conditional_on` validation (references valid boolean input)
- [ ] Template resolution engine — resolve `{{input_key}}` with user inputs, handle `conditional_on`

## Key Files
- `src/lib/blocks/schemas/base.schema.json`
- `src/lib/blocks/schemas/system.block.schema.json`
- `src/lib/blocks/schemas/container.block.schema.json`
- `src/lib/blocks/schemas/component.block.schema.json`
- `src/lib/blocks/schemas/base.ts` — Zod base schemas
- `src/lib/blocks/schemas/system.ts` — Zod system block schema
- `src/lib/blocks/schemas/container.ts` — Zod container block schema
- `src/lib/blocks/schemas/component.ts` — Zod component block schema
- `src/lib/blocks/parse-block.ts` — dispatcher
- `src/lib/blocks/resolve-template.ts` — template resolution engine

## Verification
- [ ] Valid blocks parse without errors
- [ ] Invalid blocks produce clear validation errors
- [ ] Template resolution replaces all `{{placeholders}}`
- [ ] `conditional_on` correctly includes/excludes elements
- [ ] `pnpm dev` and `pnpm build` succeed
