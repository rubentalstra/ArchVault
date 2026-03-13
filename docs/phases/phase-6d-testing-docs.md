# Phase 6d — Testing & Docs

## Status: Not Started

## Goal
Add test coverage and documentation.

## Prerequisites
- Phases 5a, 5b, 5c — complete

## Tasks
- [ ] API tests for server functions (elements, relationships, diagrams, workspaces)
- [ ] Block validation tests (all block types, valid + invalid cases)
- [ ] Permission tests (all roles: owner, admin, editor, viewer)
- [ ] Editor flow tests (selection, drag, undo/redo)
- [ ] Hierarchy validation tests
- [ ] Diagram scope validation tests
- [ ] README with project overview, setup instructions, screenshots
- [ ] Block format specification document
- [ ] Contributing guide

## Key Files
- `tests/server/*.test.ts` — server function tests
- `tests/blocks/*.test.ts` — block validation tests
- `tests/permissions/*.test.ts` — RBAC tests
- `tests/editor/*.test.ts` — editor interaction tests
- `README.md` — project documentation
- `docs/block-format.md` — block specification
- `docs/contributing.md` — contributor guide

## Verification
- [ ] All tests pass
- [ ] Test coverage meets target
- [ ] README is complete and accurate
- [ ] Block format spec covers all block types
- [ ] `pnpm dev` and `pnpm build` succeed
