import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import {
  createRecepDueno,
  updateRecepDueno,
} from '../../src/modules/recepcionista/services/recepDuenosService.ts'

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

const formData = {
  fullName: 'Ana Pérez',
  documentId: '1234567890',
  phone: '3001234567',
  email: 'ana.perez@test.com',
  address: 'Calle 1 #2-3',
}

test('createRecepDueno llama POST /api/Clients y devuelve solo clientId', async () => {
  const calls: Array<{ url: string; method?: string; body?: Record<string, unknown> }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Clients') && init?.method === 'POST') {
      return Response.json({
        id: 'client-new-1',
        fullName: 'Ana Pérez',
        email: 'ana.perez@test.com',
        identificationNumber: '1234567890',
        phoneNumber: '3001234567',
        address: 'Calle 1 #2-3',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
      }, { status: 201 })
    }
    return new Response('Not found', { status: 404 })
  }

  const result = await createRecepDueno(formData)

  assert.deepEqual(result, { clientId: 'client-new-1' })
  assert.equal(calls.length, 1)
  assert.ok(calls[0].url.includes('/api/Clients'))
  assert.equal(calls[0].method, 'POST')
  assert.equal(calls[0].body?.fullName, 'Ana Pérez')
  assert.equal(calls[0].body?.email, 'ana.perez@test.com')
  assert.equal(calls[0].body?.identificationNumber, '1234567890')
  assert.ok(!calls.some((c) => c.url.includes('register-owner')))
  assert.ok(!('userId' in result))
})

test('createRecepDueno rechaza correo vacío o inválido sin llamar al API', async () => {
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response('should not call', { status: 500 })
  }

  await assert.rejects(
    () => createRecepDueno({ ...formData, email: 'sin-arroba' }),
    /correo/i,
  )
  assert.equal(called, false)
})

test('updateRecepDueno hace un solo PUT /api/Clients/{id} y no llama owner-profile', async () => {
  const calls: Array<{ url: string; method?: string; body?: Record<string, unknown> }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method ?? 'GET', body: bodyParsed })

    if (urlStr.includes('/api/Clients/client-1') && (!init?.method || init.method === 'GET')) {
      return Response.json({
        id: 'client-1',
        fullName: 'Ana Pérez',
        email: 'ana.perez@test.com',
        identificationNumber: '1234567890',
        phoneNumber: '3001234567',
        address: 'Calle vieja',
        isActive: false,
        createdAt: '2026-01-01T00:00:00Z',
      })
    }

    if (urlStr.includes('/api/Clients/client-1') && init?.method === 'PUT') {
      return new Response(null, { status: 204 })
    }

    return new Response('Not found', { status: 404 })
  }

  await updateRecepDueno('client-1', {
    fullName: 'Ana María Pérez',
    documentId: '1234567890',
    phone: '3009998877',
    email: 'ana.nueva@test.com',
    address: 'Calle nueva',
  })

  const putCalls = calls.filter((c) => c.method === 'PUT')
  assert.equal(putCalls.length, 1)
  assert.ok(putCalls[0].url.includes('/api/Clients/client-1'))
  assert.ok(!putCalls[0].url.includes('owner-profile'))
  assert.ok(!calls.some((c) => c.url.includes('owner-profile')))
  assert.equal(putCalls[0].body?.fullName, 'Ana María Pérez')
  assert.equal(putCalls[0].body?.email, 'ana.nueva@test.com')
  assert.equal(putCalls[0].body?.phoneNumber, '3009998877')
  assert.equal(putCalls[0].body?.isActive, false)
  assert.ok(!('userId' in (putCalls[0].body ?? {})))
})
