import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import { fetchRecepMascotaFormCatalogs } from '../../src/modules/recepcionista/services/recepMascotasService.ts'

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

// S20: el catálogo del modal no debe llamar GET /api/Users
test('fetchRecepMascotaFormCatalogs usa client.fullName y no llama /api/Users', async () => {
  const urls: string[] = []

  globalThis.fetch = async (input: RequestInfo | URL) => {
    const urlStr = String(input)
    urls.push(urlStr)

    if (urlStr.includes('/api/Species')) {
      return Response.json([{ id: 's1', name: 'Perro' }])
    }
    if (urlStr.includes('/api/Races')) {
      return Response.json([{ id: 'r1', name: 'Mestizo', speciesId: 's1' }])
    }
    if (urlStr.includes('/api/Clients')) {
      return Response.json([
        {
          id: 'client-1',
          userId: 'user-1',
          identificationNumber: '111',
          phoneNumber: '300',
          address: null,
          registrationDate: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: null,
          fullName: 'María López',
          email: 'maria@test.com',
          isActive: true,
        },
      ])
    }
    return new Response('Not found', { status: 404 })
  }

  const catalogs = await fetchRecepMascotaFormCatalogs()

  assert.ok(urls.every((u) => !u.includes('/api/Users')))
  assert.equal(catalogs.duenos[0]?.fullName, 'María López')
  assert.equal(catalogs.species.length, 1)
  assert.equal(catalogs.races.length, 1)
})
