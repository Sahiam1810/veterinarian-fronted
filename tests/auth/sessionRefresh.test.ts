import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import {
  getStoredUser,
  refreshSession,
  setStoredUser,
} from '../../src/modules/auth/services/authService.ts'
import { fetchWithSession } from '../../src/services/apiClient.ts'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length(): number { return this.values.size }
  clear(): void { this.values.clear() }
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null }
  removeItem(key: string): void { this.values.delete(key) }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}

const originalFetch = globalThis.fetch

function accessToken(payload: Record<string, unknown>): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

function responseTokens(refreshToken: string) {
  return {
    accessToken: accessToken({
      role_id: '99999999-9999-9999-9999-999999999999',
      role: 'SuperAdmin',
      email: 'admin@huellitas.test',
      permissions: ['perm:Mascotas:View'],
    }),
    accessTokenExpiresAt: '2026-09-04T18:15:00Z',
    refreshToken,
    refreshTokenExpiresAt: '2026-09-11T18:00:00Z',
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: new MemoryStorage() })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: new MemoryStorage() })
  setStoredUser({
    id: 'person-1',
    name: 'Samuel',
    email: 'old@huellitas.test',
    role: 'admin',
    roleName: 'Administrador',
    roleId: '11111111-1111-1111-1111-111111111111',
    accessToken: 'expired-access-token',
    refreshToken: 'refresh-1',
  }, true)
  localStorage.setItem('huellitas_auth_tokens', JSON.stringify({
    accessToken: 'expired-access-token',
    accessTokenExpiresAt: '2026-09-04T18:00:00Z',
    refreshToken: 'refresh-1',
    refreshTokenExpiresAt: '2026-09-11T18:00:00Z',
  }))
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('rotates the tokens and updates the persisted role from the new JWT', async () => {
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.method, 'POST')
    assert.deepEqual(JSON.parse(String(init?.body)), { refreshToken: 'refresh-1' })
    return Response.json(responseTokens('refresh-2'))
  }

  const token = await refreshSession()
  const stored = getStoredUser()

  assert.equal(token, responseTokens('refresh-2').accessToken)
  assert.equal(stored?.refreshToken, 'refresh-2')
  assert.equal(stored?.role, 'superadmin')
  assert.equal(stored?.roleName, 'SuperAdmin')
  assert.equal(stored?.email, 'admin@huellitas.test')
  assert.equal(stored?.isPlatformSuperAdmin, true)
})

test('shares one refresh request between concurrent callers', async () => {
  let refreshCalls = 0
  globalThis.fetch = async () => {
    refreshCalls += 1
    await new Promise((resolve) => setTimeout(resolve, 5))
    return Response.json(responseTokens('refresh-2'))
  }

  const [first, second] = await Promise.all([refreshSession(), refreshSession()])

  assert.equal(refreshCalls, 1)
  assert.equal(first, second)
})

test('retries an unauthorized API request once with the refreshed access token', async () => {
  const refreshedTokens = responseTokens('refresh-2')
  let resourceCalls = 0
  let refreshCalls = 0

  globalThis.fetch = async (input, init) => {
    const url = String(input)
    if (url.endsWith('/api/auth/refresh')) {
      refreshCalls += 1
      return Response.json(refreshedTokens)
    }

    resourceCalls += 1
    const authorization = new Headers(init?.headers).get('Authorization')
    if (resourceCalls === 1) {
      assert.equal(authorization, 'Bearer expired-access-token')
      return Response.json({ detail: 'expired' }, { status: 401 })
    }

    assert.equal(authorization, `Bearer ${refreshedTokens.accessToken}`)
    return Response.json({ ok: true })
  }

  const response = await fetchWithSession('http://localhost:5233/api/pets')

  assert.equal(response.status, 200)
  assert.equal(resourceCalls, 2)
  assert.equal(refreshCalls, 1)
})

test('rejects the refresh when the backend rejects the rotated token', async () => {
  globalThis.fetch = async () => Response.json(
    { detail: 'Invalid refresh token' },
    { status: 401 },
  )

  await assert.rejects(refreshSession(), /sesi/i)
})
