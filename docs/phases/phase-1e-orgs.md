# Phase 1e — Organizations & Teams

## Status: Not Started

## Goal
Enable organization creation, member management, and team support.

## Prerequisites
- Phase 1c (Authentication) — complete

## Tasks
- [ ] Create org route group `src/routes/_protected/org/`
- [ ] Onboarding flow: create first org after sign-up (`src/routes/_protected/onboarding.tsx`)
- [ ] Org settings page with TanStack Form (name, slug, logo, metadata)
- [ ] Invite member dialog (email + role picker)
- [ ] Members list with TanStack Table (columns: name, email, role, joined date, actions)
- [ ] Role management: change member role, remove member
- [ ] Team creation form (TanStack Form)
- [ ] Team membership management
- [ ] Active org switcher in sidebar/header
- [ ] Set `activeOrganizationId` on session when switching

## Key Files
- `src/routes/_protected/onboarding.tsx` — first-org creation flow
- `src/routes/_protected/org/settings.tsx` — org settings
- `src/routes/_protected/org/members.tsx` — members list (TanStack Table)
- `src/routes/_protected/org/teams.tsx` — team management
- `src/components/org/invite-member-dialog.tsx` — invite form
- `src/components/org/org-switcher.tsx` — org switcher component

## Verification
- [ ] New user is guided to create an org on first login
- [ ] Org settings save correctly
- [ ] Invitations send (or log in dev) and show correct role
- [ ] Members table shows all org members with role management
- [ ] Team CRUD works
- [ ] Org switcher updates active org in session
- [ ] `pnpm dev` and `pnpm build` succeed
