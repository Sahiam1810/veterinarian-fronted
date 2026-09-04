# Persisted SuperAdmin Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the frontend recognize and present the persisted SuperAdmin contract emitted by the backend.

**Architecture:** A pure auth utility owns the canonical role identifier. Login and stored-session recovery consume that utility, while the existing `isPlatformSuperAdmin` field remains as a compatibility boundary for the administrative shell. Profile behavior is aligned with persisted identity without changing API authority.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Node 22 native test runner.

## Global Constraints

- Work directly on `fix/persisted-superadmin-frontend`; do not use a worktree.
- Do not restore or trust the legacy `super_admin=true` claim.
- Do not change visual layout or backend contracts.
- Add only focused tests and keep existing module boundaries.

---

### Task 1: Canonical role identity

**Files:**
- Create: `src/modules/auth/utils/systemRoles.ts`
- Create: `tests/auth/systemRoles.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `SUPERADMIN_ROLE_ID: string`
- Produces: `isPersistedSuperAdminRole(roleId: string | undefined | null): boolean`

- [ ] **Step 1: Write a failing native Node test**

Cover the canonical identifier, uppercase input, an ordinary role ID, `undefined`, and the removed `super_admin` concept not being an input.

- [ ] **Step 2: Run the focused test and observe RED**

Run: `pnpm test:auth`

Expected: failure because `src/modules/auth/utils/systemRoles.ts` does not exist.

- [ ] **Step 3: Implement the minimal role utility**

Export the canonical lowercase GUID and compare trimmed, lowercased role IDs without accepting names or legacy claims.

- [ ] **Step 4: Run the focused test and observe GREEN**

Run: `pnpm test:auth`

Expected: all role identity cases pass.

### Task 2: Login and stored-session normalization

**Files:**
- Modify: `src/modules/auth/services/authService.ts`
- Modify: `src/modules/auth/types/auth.ts`

**Interfaces:**
- Consumes: `isPersistedSuperAdminRole(roleId)` from Task 1.
- Produces: an `AuthUser` whose navigation role and compatibility indicator reflect the canonical `role_id`.

- [ ] **Step 1: Remove the legacy claim reader**

Delete `readPlatformSuperAdminClaim` and its `payload.super_admin` checks.

- [ ] **Step 2: Resolve login identity from `role_id`**

Read the JWT role ID once and compute `isPlatformSuperAdmin` through the canonical utility. For a match, set navigation role to `superadmin` while preserving the persisted profile role as its display name.

- [ ] **Step 3: Normalize stored sessions**

When `getStoredUser()` parses a stored value, recompute `isPlatformSuperAdmin` and `role` from its `roleId` so sessions written during the transition recover automatically.

- [ ] **Step 4: Update comments**

Describe the field as compatibility state derived from the persisted canonical role, not from a special JWT claim.

### Task 3: Persisted profile behavior

**Files:**
- Modify: `src/modules/superadmin/hooks/usePerfilSuperAdmin.ts`
- Modify: `src/modules/superadmin/pages/perfilSuperAdmin/PerfilSuperAdmin.tsx`

**Interfaces:**
- Consumes: normalized `AuthUser.isPlatformSuperAdmin`.
- Produces: accurate profile guidance and normal password self-service.

- [ ] **Step 1: Replace legacy profile copy**

State that identifying fields are protected by backend security rules rather than configured in `.env`.

- [ ] **Step 2: Preserve safe profile behavior**

Keep phone/photo extras local for SuperAdmin and do not send protected name/email edits through the administrative user endpoint.

- [ ] **Step 3: Enable password self-service**

Remove the SuperAdmin early return so `changeMyPassword` calls `/api/auth/me/password` for this role too.

### Task 4: Verification and handoff

**Files:**
- Verify all files above.

- [ ] **Step 1: Run focused behavior tests**

Run: `pnpm test:auth`

- [ ] **Step 2: Run TypeScript and production build checks**

Run: `pnpm lint` and `pnpm build`.

- [ ] **Step 3: Scan for legacy production behavior**

Run: `rg -n "payload\.super_admin|SuperAdmin__PasswordHash|vienen del \.env" src`.

Expected: no matches.

- [ ] **Step 4: Review diff and commit**

Use conventional commits with the bug-fix emoji and leave the branch ready for integration.
