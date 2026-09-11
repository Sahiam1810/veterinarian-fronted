import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test, { beforeEach } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  clearStoredUser,
  getAccessToken,
  getStoredUser,
  loginRequest,
  setStoredUser,
} from '../../src/modules/auth/services/authService.ts'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length(): number { return this.values.size }
  clear(): void { this.values.clear() }
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null }
  removeItem(key: string): void { this.values.delete(key) }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}

const AUTH_USER_KEY = 'huellitas_auth_user'
const AUTH_TOKENS_KEY = 'huellitas_auth_tokens'
const originalFetch = globalThis.fetch

const staffUser = {
  id: 'person-1',
  name: 'Staff User',
  email: 'staff@huellitas.test',
  role: 'admin' as const,
  roleName: 'Administrador',
  roleId: '11111111-1111-1111-1111-111111111111',
  accessToken: 'access-session',
  refreshToken: 'refresh-session',
}

const staffTokens = {
  accessToken: 'access-session',
  accessTokenExpiresAt: '2026-09-04T18:15:00Z',
  refreshToken: 'refresh-session',
  refreshTokenExpiresAt: '2026-09-11T18:00:00Z',
}

function accessToken(payload: Record<string, unknown>): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: new MemoryStorage() })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: new MemoryStorage() })
  globalThis.fetch = originalFetch
})

test('F1: tokens and user seeded only in localStorage are ignored', () => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(staffUser))
  localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(staffTokens))

  assert.equal(getStoredUser(), null)
  assert.equal(getAccessToken(), null)
})

test('F2: tokens and user in sessionStorage are restored', () => {
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(staffUser))
  sessionStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(staffTokens))

  const restored = getStoredUser()
  assert.equal(restored?.email, staffUser.email)
  assert.equal(restored?.accessToken, staffUser.accessToken)
  assert.equal(getAccessToken(), staffTokens.accessToken)
})

test('F3: login persists auth only in sessionStorage, never localStorage', async () => {
  const issuedAccess = accessToken({
    role_id: staffUser.roleId,
    role: 'Administrador',
    email: staffUser.email,
  })

  globalThis.fetch = async (input) => {
    const url = String(input)
    if (url.endsWith('/api/auth/login')) {
      return Response.json({
        accessToken: issuedAccess,
        accessTokenExpiresAt: '2026-09-04T18:15:00Z',
        refreshToken: 'refresh-login',
        refreshTokenExpiresAt: '2026-09-11T18:00:00Z',
      })
    }

    if (url.endsWith('/api/auth/me')) {
      return Response.json({
        personId: staffUser.id,
        userAccountId: 'account-1',
        fullName: staffUser.name,
        initials: 'SU',
        userName: 'staff',
        email: staffUser.email,
        role: 'Administrador',
        accountStatus: 'Activo',
      })
    }

    throw new Error(`Unexpected fetch: ${url}`)
  }

  const user = await loginRequest({
    email: staffUser.email,
    password: 'Huellitas2026!',
  })

  assert.equal(user.email, staffUser.email)
  assert.ok(sessionStorage.getItem(AUTH_USER_KEY))
  assert.ok(sessionStorage.getItem(AUTH_TOKENS_KEY))
  assert.equal(localStorage.getItem(AUTH_USER_KEY), null)
  assert.equal(localStorage.getItem(AUTH_TOKENS_KEY), null)
})

test('F4: remount with preserved sessionStorage restores the session (F5 reload)', () => {
  setStoredUser(staffUser)
  sessionStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(staffTokens))

  // Simulate remount by reading again with the same sessionStorage instance.
  const restored = getStoredUser()
  assert.equal(restored?.id, staffUser.id)
  assert.equal(getAccessToken(), staffTokens.accessToken)
})

test('F5: remount with empty sessionStorage does not restore a session (tab close)', () => {
  setStoredUser(staffUser)
  sessionStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(staffTokens))
  clearStoredUser()
  sessionStorage.clear()

  assert.equal(getStoredUser(), null)
  assert.equal(getAccessToken(), null)
})

test('F6: LoginPage and auth call sites no longer expose remember', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const loginPage = readFileSync(join(here, '../../src/modules/auth/pages/LoginPage.tsx'), 'utf8')
  const authTypes = readFileSync(join(here, '../../src/modules/auth/types/auth.ts'), 'utf8')
  const useAuth = readFileSync(join(here, '../../src/modules/auth/hooks/useAuth.ts'), 'utf8')
  const authService = readFileSync(join(here, '../../src/modules/auth/services/authService.ts'), 'utf8')

  assert.doesNotMatch(loginPage, /remember|Recordarme|PawCheckbox/)
  assert.doesNotMatch(authTypes, /remember/)
  assert.doesNotMatch(useAuth, /remember/)
  assert.doesNotMatch(authService, /remember|localStorage/)
})
