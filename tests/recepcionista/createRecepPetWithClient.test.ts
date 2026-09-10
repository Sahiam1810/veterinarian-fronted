import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import { createRecepPetWithClient } from '../../src/modules/recepcionista/services/recepMascotasService.ts'
import {
  buildRecepMascotaFormDuenos,
  mapRecepUiGenderToApi,
} from '../../src/modules/recepcionista/utils/recepPetMapping.ts'
import type { ApiClientResponse } from '../../src/modules/superadmin/services/superAdminClientsService.ts'

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

function makeClient(overrides: Partial<ApiClientResponse> = {}): ApiClientResponse {
  return {
    id: 'client-1',
    userId: 'user-1',
    identificationNumber: '1234567890',
    phoneNumber: '3001234567',
    address: null,
    registrationDate: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: null,
    fullName: 'Ana Pérez',
    email: 'ana.perez@test.com',
    isActive: true,
    ...overrides,
  }
}

// S20: catálogo del modal no depende de GET /api/Users
test('buildRecepMascotaFormDuenos arma el nombre desde client.fullName', () => {
  const duenos = buildRecepMascotaFormDuenos([
    makeClient({ id: 'c1', fullName: 'Carlos Mendoza' }),
    makeClient({ id: 'c2', fullName: null }),
  ])

  assert.equal(duenos[0]?.fullName, 'Carlos Mendoza')
  assert.equal(duenos[1]?.fullName, 'Cliente Sin Nombre')
  assert.equal(duenos[0]?.documentId, '1234567890')
})

test('mapRecepUiGenderToApi traduce Hembra/Macho a F/M', () => {
  assert.equal(mapRecepUiGenderToApi('Hembra'), 'F')
  assert.equal(mapRecepUiGenderToApi('Macho'), 'M')
  assert.equal(mapRecepUiGenderToApi('hembra'), 'F')
  assert.equal(mapRecepUiGenderToApi('MACHO'), 'M')
})

test('createRecepPetWithClient envía gender M cuando el select es Macho', async () => {
  const calls: Array<{ url: string; method?: string; body?: Record<string, unknown> }> = []

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

  await createRecepPetWithClient({
    name: 'Firulais',
    speciesId: 'spec-canino',
    raceId: 'race-golden',
    age: 3,
    gender: 'Macho',
    weight: 25.5,
    clientId: 'client-789',
  })

  assert.ok(calls[0].url.includes('/api/Pets'))
  assert.equal(calls[0].body?.gender, 'M')
})

test('createRecepPetWithClient envía gender F cuando el select es Hembra', async () => {
  const calls: Array<{ url: string; method?: string; body?: Record<string, unknown> }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Pets')) {
      return Response.json({ id: 'pet-hembra-1' }, { status: 201 })
    }
    return new Response('Not found', { status: 404 })
  }

  await createRecepPetWithClient({
    name: 'Luna',
    speciesId: 'spec-felino',
    raceId: 'race-siames',
    age: 2,
    gender: 'Hembra',
    weight: 4.2,
  })

  assert.ok(calls[0].url.includes('/api/Pets'))
  assert.equal(calls[0].body?.gender, 'F')
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

  assert.ok(calls[0].url.includes('/api/Pets'))
  assert.equal(calls[0].method, 'POST')
  assert.equal(calls[0].body.name, 'Firulais')
  assert.equal(calls[0].body.gender, 'M')

  assert.ok(calls[1].url.includes('/api/ClientsPets'))
  assert.equal(calls[1].body.clientId, 'client-789')
  assert.equal(calls[1].body.petId, 'pet-new-123')
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
