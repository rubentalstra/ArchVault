# Phase 1c — Authentication

## Status: Not Started

## Goal
Integrate Better Auth with all plugins, create auth pages, and protect routes.

## Prerequisites
- Phase 1b (Database & Docker) — complete

## Tasks
- [ ] Install Better Auth: `pnpm add better-auth`
- [ ] Create `src/lib/auth.ts` — server config with all plugins (admin, organization, twoFactor, emailOTP, haveibeenpwned, lastLoginMethod, tanstackStartCookies)
- [ ] Create `src/lib/auth-client.ts` — client config with matching plugins
- [ ] Create `src/lib/auth.server.ts` — `getSession` and `ensureSession` server functions
- [ ] Create `src/lib/permissions.ts` — platform AC + org AC with all roles (owner, admin, editor, viewer)
- [ ] Create `src/routes/api/auth/$.ts` — Better Auth route handler
- [ ] Generate Better Auth tables: `pnpm dlx @better-auth/cli generate` → Drizzle migration
- [ ] Create `src/routes/_protected.tsx` — auth guard layout with `beforeLoad`
- [ ] Build sign-up page (`src/routes/signup.tsx`) — email/password + social providers (GitHub, Microsoft, Google)
- [ ] Build sign-in page (`src/routes/login.tsx`) — email/password + social + Email OTP
- [ ] Build email verification page (`src/routes/verify-email.tsx`)
- [ ] Build password reset page (`src/routes/reset-password.tsx`)
- [ ] Build 2FA setup page (TOTP enrollment)
- [ ] Build 2FA challenge page (TOTP verification)
- [ ] All forms use TanStack Form + shadcn/ui

## CLI Commands
```bash
pnpm add better-auth
pnpm dlx @better-auth/cli generate
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files
- `src/lib/auth.ts` — Better Auth server config
- `src/lib/auth-client.ts` — Better Auth client config
- `src/lib/auth.server.ts` — session helpers (getSession, ensureSession)
- `src/lib/permissions.ts` — RBAC definitions (platform + org)
- `src/routes/api/auth/$.ts` — auth API route handler
- `src/routes/_protected.tsx` — auth guard layout
- `src/routes/signup.tsx` — sign-up page
- `src/routes/login.tsx` — sign-in page
- `src/routes/verify-email.tsx` — email verification
- `src/routes/reset-password.tsx` — password reset
- `src/routes/_protected/settings.tsx` — 2FA setup

## Verification
- [ ] Sign up with email/password creates user in database
- [ ] Sign in returns valid session
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Social provider buttons render (full OAuth flow depends on provider config)
- [ ] `pnpm dev` and `pnpm build` succeed
