import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import { createFullUser } from '../../src/modules/superadmin/services/superAdminUserService.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() { return store.size },
    clear() { store.clear() },
    getItem(key) { return store.get(key) ?? null },
    key(index) { return [...store.keys()][index] ?? null },
    removeItem(key) { store.delete(key) },
    setItem(key, value) { store.set(key, value) },
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: memoryStorage })
  localStorage.setItem(
    'huellitas_auth_tokens',
    JSON.stringify({
      accessToken: 'test-token',
      accessTokenExpiresAt: '2099-01-01T00:00:00Z',
      refreshToken: 'test-refresh',
    }),
  )
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

// S## (fix): el perfil de veterinario ya no se crea dos veces (una con placeholder
// desde /api/Users, otra con los datos reales desde /api/Veterinarians).
test('createFullUser manda specialtyId y licenseNumber en el mismo POST /api/Users', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Users') && init?.method === 'POST') {
      return Response.json({ id: 'user-vet-1' }, { status: 201 })
    }
    if (urlStr.includes('/api/UserAccounts')) {
      return Response.json({ id: 'account-1' }, { status: 201 })
    }
    if (urlStr.includes('/api/UserCredentials')) {
      return Response.json({ id: 'cred-1' }, { status: 201 })
    }
    return new Response('Not found', { status: 404 })
  }

  const result = await createFullUser({
    fullName: 'Heryn Mendez',
    email: 'heryn@gmail.com',
    password: 'Secreta123!',
    roleId: 'role-vet-1',
    specialtyId: 'specialty-derma',
    licenseNumber: 'CMP-12346',
  })

  assert.equal(result.userId, 'user-vet-1')

  const createUserCall = calls.find((c) => c.url.includes('/api/Users') && c.method === 'POST')
  assert.ok(createUserCall, 'debió llamar a POST /api/Users')
  assert.equal(createUserCall!.body.specialtyId, 'specialty-derma')
  assert.equal(createUserCall!.body.licenseNumber, 'CMP-12346')

  // Nunca debe existir una segunda llamada a /api/Veterinarians: /api/Users ya crea el perfil.
  const veterinarianCalls = calls.filter((c) => c.url.includes('/api/Veterinarians'))
  assert.equal(veterinarianCalls.length, 0)
})

test('createFullUser sin specialtyId/licenseNumber (rol no veterinario) no los manda', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Users') && init?.method === 'POST') {
      return Response.json({ id: 'user-recep-1' }, { status: 201 })
    }
    if (urlStr.includes('/api/UserAccounts')) {
      return Response.json({ id: 'account-2' }, { status: 201 })
    }
    if (urlStr.includes('/api/UserCredentials')) {
      return Response.json({ id: 'cred-2' }, { status: 201 })
    }
    return new Response('Not found', { status: 404 })
  }

  await createFullUser({
    fullName: 'Maria Recepcion',
    email: 'recepcionista@veterinaria.com',
    password: 'Secreta123!',
    roleId: 'role-recep-1',
  })

  const createUserCall = calls.find((c) => c.url.includes('/api/Users') && c.method === 'POST')
  assert.equal(createUserCall!.body.specialtyId, undefined)
  assert.equal(createUserCall!.body.licenseNumber, undefined)
})
