# Phase 5a — Community Registry

## Status: Not Started

## Goal
Integrate community block registry via GitHub API.

## Prerequisites
- Phase 4c (Block Browser & Install) — complete

## Tasks
- [ ] Define registry repo structure (`your-org/block-registry`)
- [ ] CI validation workflow for submitted blocks
- [ ] GitHub API client with TanStack Pacer rate limiting
- [ ] Fetch + cache `index.json` from registry repo (15-min TTL)
- [ ] Combined block browser: official + community tabs
- [ ] Community block detail view with author info
- [ ] Install flow for community blocks (same as official)

## Key Files
- `src/lib/blocks/github-client.ts` — GitHub API with rate limiting
- `src/lib/blocks/registry.ts` — registry fetching + caching
- `src/components/blocks/community-tab.tsx` — community browser tab

## Verification
- [ ] Registry `index.json` fetches and caches correctly
- [ ] Community blocks appear in browser
- [ ] Rate limiting prevents API abuse
- [ ] Community blocks can be installed
- [ ] `pnpm dev` and `pnpm build` succeed
