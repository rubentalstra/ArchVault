# Phase 1d — Platform Admin

## Status: Not Started

## Goal
Build the platform admin dashboard for managing all users.

## Prerequisites
- Phase 1c (Authentication) — complete

## Tasks
- [ ] Create admin route group `src/routes/_protected/admin/`
- [ ] Add admin guard in admin layout (`beforeLoad` checks platform admin role)
- [ ] User list page with TanStack Table + Virtual (search, filter by role/status, sort, pagination)
- [ ] User detail page (`src/routes/_protected/admin/user.$userId.tsx`)
- [ ] Admin actions: ban/unban user (with reason + expiry form)
- [ ] Admin actions: impersonate user
- [ ] Admin actions: revoke user sessions
- [ ] Admin actions: create user (TanStack Form — email, name, password, role)
- [ ] Admin actions: set/change user role
- [ ] Admin actions: remove user

## Key Files
- `src/routes/_protected/admin.tsx` — admin layout with role guard
- `src/routes/_protected/admin/users.tsx` — user list (TanStack Table + Virtual)
- `src/routes/_protected/admin/user.$userId.tsx` — user detail
- `src/components/admin/user-table-columns.tsx` — column definitions
- `src/components/admin/ban-user-dialog.tsx` — ban form
- `src/components/admin/create-user-dialog.tsx` — create user form

## Verification
- [ ] Non-admin users get redirected from admin routes
- [ ] User list loads with search, filter, sort, pagination working
- [ ] Ban/unban toggles user status
- [ ] Impersonate switches to target user session
- [ ] `pnpm dev` and `pnpm build` succeed
