import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import { createRecepPetWithClient } from '../../src/modules/recepcionista/services/recepMascotasService.ts'

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

test('createRecepPetWithClient llama createRecepPet y luego createClientPet en orden vinculando al dueño', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Pets')) {
      return Response.json({ id: 'pet-new-123' }, { status: 201 })
    }
    if (urlStr.includes('/api/ClientsPets')) {
      return Response.json({ id: 'cp-link-456' }, { status: 201 })
    }
    return new Response('Not found', { status: 404 })
  }

  const result = await createRecepPetWithClient({
    name: 'Firulais',
    speciesId: 'spec-canino',
    raceId: 'race-golden',
    age: 3,
    gender: 'Macho',
    weight: 25.5,
    clientId: 'client-789',
    observations: 'Ninguna alergia',
  })

  assert.equal(result.id, 'pet-new-123')
  assert.equal(calls.length, 2)

  // 1ra llamada: POST /api/Pets
  assert.ok(calls[0].url.includes('/api/Pets'))
  assert.equal(calls[0].method, 'POST')
  assert.equal(calls[0].body.name, 'Firulais')
  assert.equal(calls[0].body.speciesId, 'spec-canino')
  assert.equal(calls[0].body.raceId, 'race-golden')
  assert.equal(calls[0].body.age, 3)
  assert.equal(calls[0].body.weight, 25.5)

  // 2da llamada: POST /api/ClientsPets
  assert.ok(calls[1].url.includes('/api/ClientsPets'))
  assert.equal(calls[1].method, 'POST')
  assert.equal(calls[1].body.clientId, 'client-789')
  assert.equal(calls[1].body.petId, 'pet-new-123')
  assert.equal(calls[1].body.isPrimaryOwner, true)
})

test('createRecepPetWithClient no intenta crear vínculo si la creación de mascota falla', async () => {
  const calls: Array<{ url: string; method?: string }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    calls.push({ url: urlStr, method: init?.method })

    if (urlStr.includes('/api/Pets')) {
      return new Response(JSON.stringify({ message: 'Error de validación en mascota' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response('Not found', { status: 404 })
  }

  await assert.rejects(
    async () => {
      await createRecepPetWithClient({
        name: 'Mascota Inválida',
        speciesId: 'spec-1',
        raceId: 'race-1',
        age: -1,
        gender: 'Hembra',
        weight: 0,
        clientId: 'client-123',
      })
    },
    (err: any) => {
      assert.ok(err)
      return true
    },
  )

  // Solo se intentó la primera llamada a /api/Pets
  assert.equal(calls.length, 1)
  assert.ok(calls[0].url.includes('/api/Pets'))
})

test('createRecepPetWithClient no llama a ClientsPets si no se especifica clientId', async () => {
  const calls: Array<{ url: string; method?: string }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    calls.push({ url: urlStr, method: init?.method })

    if (urlStr.includes('/api/Pets')) {
      return Response.json({ id: 'pet-orphan-999' }, { status: 201 })
    }
    return new Response('Not found', { status: 404 })
  }

  const result = await createRecepPetWithClient({
    name: 'Sin Dueño',
    speciesId: 'spec-felino',
    raceId: 'race-siames',
    age: 2,
    gender: 'Hembra',
    weight: 4.2,
  })

  assert.equal(result.id, 'pet-orphan-999')
  assert.equal(calls.length, 1)
  assert.ok(calls[0].url.includes('/api/Pets'))
})
