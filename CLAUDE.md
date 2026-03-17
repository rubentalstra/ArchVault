# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArchVault is a **greenfield** visual C4 architecture platform (Levels 1-3; Level 4 is out of scope). Users model software systems, create diagrams, build reusable architecture blocks, and share them via a community registry. Everything is UI-driven — users never write code.

Phase tracking and specs live in `.github/phase-plans/`. The phase README (`.github/phase-plans/README.md`) has the full dependency graph and current status of each sub-phase.

## Monorepo Structure

Turborepo manages the monorepo with pnpm workspaces.

```
apps/
  web/          # @archvault/web — Main TanStack Start app
  docs/         # @archvault/docs — Astro Starlight documentation
packages/
  shared/       # @archvault/shared — Shared types and schemas
  transactional/# @archvault/transactional — Email templates (React Email)
  typescript-config/ # @archvault/typescript-config — Shared TS configs
  eslint-config/     # @archvault/eslint-config — Shared ESLint configs
```

## Commands

All scripts delegate through Turborepo. Run from repo root:

```bash
pnpm dev              # Start all dev servers (web + docs)
pnpm dev:web          # Start web dev server on http://localhost:3000
pnpm dev:docs         # Start docs dev server
pnpm build            # Build all packages
pnpm build:web        # Build web app only
pnpm build:docs       # Build docs only
pnpm check-types      # Type-check all packages
pnpm lint             # Lint all packages
pnpm lint:fix         # Lint with auto-fix
pnpm test             # Run all tests (vitest)

# Database (available after Phase 1b)
pnpm db:generate            # Generate migration from schema changes
pnpm db:migrate             # Apply migrations
pnpm db:studio              # Open Drizzle Studio
pnpm docker:compose:up      # Start PostgreSQL container

# Email templates
pnpm email:dev              # Start React Email dev server
```

## Documentation

The documentation site lives in `apps/docs/` (Astro Starlight). It deploys to `archvault.dev` via GitHub Pages.

When making changes to the app, always check if the docs need updating:
- New/changed environment variables → update `admin/deployment/environment-variables.mdx`
- Auth changes → update relevant pages in `admin/auth/` and `guide/account/`
- UI/editor changes → update relevant pages in `guide/editor/` or `guide/diagrams/`
- Schema/migration changes → update `admin/database/migrations.mdx` and `architecture/data-model.mdx`
- New keyboard shortcuts → update `guide/editor/keyboard-shortcuts.mdx`
- i18n changes → update `architecture/internationalization.mdx`

## Tech Stack

- **Framework:** TanStack Start (React 19 + Nitro server + file-based routing)
- **Router:** TanStack Router (type-safe, `apps/web/src/routes/` directory)
- **Data:** TanStack Query, TanStack Form, TanStack Table, TanStack Virtual
- **State:** Zustand (client-side editor state)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, no `tailwind.config` — config lives in `apps/web/src/styles.css`)
- **Components:** shadcn/ui (base-nova style, Lucide icons) — components in `apps/web/src/components/ui/`
- **Validation:** Zod v4
- **Auth:** Better Auth (with admin, organization, twoFactor, emailOTP plugins)
- **Database:** PostgreSQL 18 + Drizzle ORM (after Phase 1b)
- **Build:** Vite 8, TypeScript strict mode, Turborepo

## Environment Variables

- Use `BETTER_AUTH_SECRET` for Better Auth secret configuration (see `apps/web/.env.example`).
- `.env` lives in **`apps/web/`** per [Turborepo best practice](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables). Vite, Nitro, and drizzle-kit all load it from their project root (`apps/web/`). Turbo tracks it via the build task's `inputs` for cache invalidation. Docker Compose references it as `apps/web/.env`.

## Architecture

### Path Aliases
Two aliases resolve to `./src/*` within `apps/web/`:
- `#/*` — used in runtime code and shadcn config (Node.js subpath import via `apps/web/package.json` imports field)
- `@/*` — available but `#/*` is the convention

### Routing
TanStack Router with file-based route generation (`apps/web/src/routeTree.gen.ts` is auto-generated — never edit). Routes live in `apps/web/src/routes/`. Layout routes use underscore prefix (e.g., `_protected.tsx` will be the auth guard).

### Root Layout (`apps/web/src/routes/__root.tsx`)
Wraps the app with `TooltipProvider`, `Toaster` (sonner), and TanStack Devtools (Router).

### Server Functions
TanStack Start uses server functions (via Nitro) for API logic — no separate API layer. The exception is `apps/web/src/routes/api/auth/$.ts` which is a raw API route for Better Auth's handler.

### Data Fetching (TanStack Query)
TanStack Query is wired up via `@tanstack/react-router-ssr-query` in `apps/web/src/router.tsx`. The `QueryClient` is created per router instance and available via router context.

**Pattern for client-side data fetching in components:**
```tsx
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

// Wrap server function with useServerFn, then pass to useQuery
const getDataFn = useServerFn(getData);
const { data, isLoading } = useQuery({
  queryKey: ["my-data"],
  queryFn: () => getDataFn(),
});

// Invalidate after mutations
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["my-data"] });
```

**When to use what:**
- **Route `beforeLoad`** — auth guards, redirects, data needed before render. Call server functions directly (no Query).
- **`useQuery`** — client-side data fetching in components. Use `useServerFn()` to wrap server functions.
- **`authClient.use*` hooks** — Better Auth reactive state (`useSession`, `useActiveOrganization`, `useActiveMember`). These are not replaced by Query.
- **Direct calls** — mutations (form submissions, delete actions). These are fire-and-forget, not queries.

### Internationalization (i18n)
Paraglide JS v2 provides compile-time type-safe translations. Source files: `apps/web/messages/*.json` (one flat file per locale with domain-prefixed keys). Auto-generated output: `apps/web/src/paraglide/` (gitignored).

**Usage:** `import { m } from '#/paraglide/messages'` then `m.domain_key()` or `m.domain_key({ param: value })`. Example: `m.auth_sign_in()`, `m.org_create_success()`.

**Locale runtime:** `import { getLocale, setLocale, locales } from '#/paraglide/runtime'`

**URL strategy:** All locales use a URL prefix: English `/en/login`, Dutch `/nl/login`. Unprefixed URLs redirect to the detected locale. Cookie `ARCHVAULT_LOCALE` persists locale.

**Adding a locale:** Add to `apps/web/project.inlang/settings.json` `locales` + add URL pattern to `apps/web/vite.config.ts` `urlPatterns` + create `apps/web/messages/{locale}.json`.

**Key convention:** `{domain}_{context}_{descriptor}` — e.g., `auth_login_title`, `org_create_success`. Domain = JSON filename.

### shadcn/ui
Config in `apps/web/components.json`. Style: `base-nova`. RSC: `false`. Components install to `apps/web/src/components/ui/`. Add new components with `pnpm dlx shadcn@latest add <component> --cwd apps/web`.

## Constraints

- **Greenfield only.** No legacy code, no backwards compatibility, no wrappers, no premature abstractions.
- **No RSC.** TanStack Start does not use React Server Components.
- **Tailwind v4.** No `tailwind.config.ts` — all theme config is CSS-based in `apps/web/src/styles.css` using `@theme inline`.
- **pnpm only.** No npm or yarn.
- **Strict TypeScript.** `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` are all enabled.
- Forms use TanStack Form + Zod. Tables use TanStack Table. Toasts use Sonner.
- Client-side data fetching uses TanStack Query (`useQuery` + `useServerFn`). Never use `useState`/`useEffect` for data fetching.
- All user-facing strings use Paraglide message functions (`import { m } from '#/paraglide/messages'`). Never hardcode user-facing text.
- **Docs must stay in sync.** When changing any user-facing feature, CLI command, environment variable, config option, or API behavior, check whether the corresponding documentation page in `apps/docs/src/content/docs/` needs updating. Outdated docs are worse than no docs.
