# Phase 1a — Project Scaffold

## Status: Not Started

## Goal
Bootstrap the Archvault project with TanStack Start, Tailwind CSS v4, and shadcn/ui.

## Prerequisites
None — this is the first phase.

## Tasks
- [ ] Scaffold project: `pnpm create @tanstack/start archvault` (with Better Auth addon)
- [ ] Install TanStack libraries: `pnpm add @tanstack/react-form @tanstack/react-table @tanstack/react-virtual @tanstack/react-pacer @tanstack/react-hotkeys`
- [ ] Install devtools: `pnpm add -D @tanstack/router-devtools @tanstack/query-devtools`
- [ ] Configure Tailwind CSS v4
- [ ] Initialize shadcn/ui: `pnpm dlx shadcn@latest init`
- [ ] Add base shadcn components: Button, Input, Label, Card, Dialog, DropdownMenu, Select, Tabs, Toast, Separator, Badge, Avatar, Sheet, Tooltip
- [ ] Set up `src/routes/__root.tsx` with TanStack Devtools (Router + Query)
- [ ] Verify dev server: `pnpm dev` starts without errors
- [ ] Verify production build: `pnpm build` succeeds

## CLI Commands
```bash
pnpm create @tanstack/start archvault
cd archvault
pnpm add @tanstack/react-form @tanstack/react-table @tanstack/react-virtual @tanstack/react-pacer @tanstack/react-hotkeys
pnpm add -D @tanstack/router-devtools @tanstack/query-devtools
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label card dialog dropdown-menu select tabs toast separator badge avatar sheet tooltip
```

## Key Files
- `package.json` — all dependencies
- `app.config.ts` — TanStack Start config
- `src/routes/__root.tsx` — root layout with providers and devtools
- `src/styles/globals.css` — Tailwind v4 imports
- `components.json` — shadcn/ui config

## Verification
- [ ] `pnpm dev` → app loads at http://localhost:3000
- [ ] `pnpm build` → no errors
- [ ] All shadcn components importable from `@/components/ui/*`
- [ ] TanStack Devtools visible in dev mode
