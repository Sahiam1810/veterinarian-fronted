import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import {
  buildPendingClientEmail,
  buildPendingClientDocument,
  isOwnerContactPending,
  isPetExamPending,
  findMestizoRaceId,
  sanitizePhoneNumber,
} from '../../src/modules/recepcionista/utils/recepQuickBookingUtils.ts'
import {
  fetchClientByPhone,
  createQuickRecepDueno,
} from '../../src/modules/recepcionista/services/recepDuenosService.ts'
import {
  createQuickRecepPet,
} from '../../src/modules/recepcionista/services/recepMascotasService.ts'

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

// --- Tests de Utilidades Puras ---

test('buildPendingClientEmail genera formato único pendiente-<tel>@huellitas.local', () => {
  assert.equal(buildPendingClientEmail('3001234567'), 'pendiente-3001234567@huellitas.local')
  assert.equal(buildPendingClientEmail(' +57 300 123 4567 '), 'pendiente-+573001234567@huellitas.local')
})

test('buildPendingClientDocument genera formato PEND-<tel> truncado a 20 caracteres', () => {
  assert.equal(buildPendingClientDocument('3001234567'), 'PEND-3001234567')
  const longPhone = '3001234567890123456789'
  const doc = buildPendingClientDocument(longPhone)
  assert.ok(doc.length <= 20)
  assert.equal(doc.startsWith('PEND-'), true)
})

test('isOwnerContactPending detecta correos pendientes', () => {
  assert.equal(isOwnerContactPending('pendiente-3001234567@huellitas.local'), true)
  assert.equal(isOwnerContactPending('PENDIENTE-3001234567@huellitas.local'), true)
  assert.equal(isOwnerContactPending('juan.perez@gmail.com'), false)
  assert.equal(isOwnerContactPending(''), false)
  assert.equal(isOwnerContactPending(null), false)
  assert.equal(isOwnerContactPending(undefined), false)
})

test('isPetExamPending detecta edad 0 y peso 0.01 como pendiente de examen', () => {
  assert.equal(isPetExamPending(0, 0.01), true)
  assert.equal(isPetExamPending('0', '0.01'), true)
  assert.equal(isPetExamPending('0 años', '0.01 kg'), true)

  // No pendientes si ya fueron examinados
  assert.equal(isPetExamPending(2, 5.5), false)
  assert.equal(isPetExamPending(0, 5.0), false)
  assert.equal(isPetExamPending(2, 0.01), false)
  assert.equal(isPetExamPending(null, null), false)
})

test('findMestizoRaceId encuentra la raza Mestizo para la especie o devuelve el primer fallback', () => {
  const races = [
    { id: 'race-lab', name: 'Labrador Retriever', speciesId: 'sp-dog' },
    { id: 'race-mest-dog', name: 'Mestizo', speciesId: 'sp-dog' },
    { id: 'race-siames', name: 'Siamés', speciesId: 'sp-cat' },
    { id: 'race-mest-cat', name: 'Mestizo', speciesId: 'sp-cat' },
  ]

  assert.equal(findMestizoRaceId(races, 'sp-dog'), 'race-mest-dog')
  assert.equal(findMestizoRaceId(races, 'sp-cat'), 'race-mest-cat')

  // Si no hay Mestizo en esa especie, toma la primera raza de esa especie
  const customRaces = [
    { id: 'race-custom-1', name: 'Poodle', speciesId: 'sp-dog' },
  ]
  assert.equal(findMestizoRaceId(customRaces, 'sp-dog'), 'race-custom-1')

  // Lista vacía
  assert.equal(findMestizoRaceId([], 'sp-dog'), '')
})

test('sanitizePhoneNumber limpia espacios y caracteres separadores', () => {
  assert.equal(sanitizePhoneNumber(' 300-123-4567 '), '3001234567')
  assert.equal(sanitizePhoneNumber('+57 (300) 123 4567'), '+573001234567')
})

// --- Tests de Servicios de Agendamiento Rápido ---

test('fetchClientByPhone consulta endpoint /api/Clients/by-phone/{phone} y retorna cliente', async () => {
  const calls: string[] = []

  globalThis.fetch = async (input: RequestInfo | URL) => {
    const urlStr = String(input)
    calls.push(urlStr)

    if (urlStr.includes('/api/Clients/by-phone/3001234567')) {
      return Response.json({
        id: 'client-existing-1',
        fullName: 'Carlos Gómez',
        email: 'carlos@test.com',
        identificationNumber: '1020304050',
        phoneNumber: '3001234567',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
      })
    }
    return new Response('Not found', { status: 404 })
  }

  const client = await fetchClientByPhone('3001234567')

  assert.ok(client)
  assert.equal(client?.id, 'client-existing-1')
  assert.equal(client?.fullName, 'Carlos Gómez')
  assert.ok(calls[0].includes('/api/Clients/by-phone/3001234567'))
})

test('fetchClientByPhone retorna null cuando el cliente no existe', async () => {
  globalThis.fetch = async () => {
    return new Response('Not found', { status: 404 })
  }

  const client = await fetchClientByPhone('9999999999')
  assert.equal(client, null)
})

test('createQuickRecepDueno crea cliente con email e identificación placeholder', async () => {
  const calls: Array<{ url: string; method?: string; body?: Record<string, unknown> }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Clients') && init?.method === 'POST') {
      return Response.json({
        id: 'client-quick-1',
        fullName: bodyParsed?.fullName,
        email: bodyParsed?.email,
        identificationNumber: bodyParsed?.identificationNumber,
        phoneNumber: bodyParsed?.phoneNumber,
        address: bodyParsed?.address,
        isActive: true,
        createdAt: '2026-09-23T00:00:00Z',
      }, { status: 201 })
    }
    return new Response('Not found', { status: 404 })
  }

  const result = await createQuickRecepDueno('3005556677', 'Mariana Torres')

  assert.equal(result.clientId, 'client-quick-1')
  assert.equal(result.client.fullName, 'Mariana Torres')
  assert.equal(result.client.email, 'pendiente-3005556677@huellitas.local')
  assert.equal(result.client.identificationNumber, 'PEND-3005556677')
  assert.equal(result.client.phoneNumber, '3005556677')
  assert.equal(result.client.address, null)

  assert.equal(calls.length, 1)
  assert.equal(calls[0].method, 'POST')
  assert.equal(calls[0].body?.email, 'pendiente-3005556677@huellitas.local')
  assert.equal(calls[0].body?.identificationNumber, 'PEND-3005556677')
})

test('createQuickRecepPet crea mascota con raza Mestizo, edad 0, peso 0.01 y la vincula en ClientsPets', async () => {
  const calls: Array<{ url: string; method?: string; body?: Record<string, unknown> }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Pets') && init?.method === 'POST') {
      return Response.json({
        id: 'pet-quick-1',
        name: bodyParsed?.name,
        speciesId: bodyParsed?.speciesId,
        raceId: bodyParsed?.raceId,
        age: bodyParsed?.age,
        gender: bodyParsed?.gender,
        weight: bodyParsed?.weight,
      }, { status: 201 })
    }

    if (urlStr.includes('/api/ClientsPets') && init?.method === 'POST') {
      return Response.json({
        id: 'cp-quick-1',
        clientId: bodyParsed?.clientId,
        petId: bodyParsed?.petId,
        isPrimaryOwner: bodyParsed?.isPrimaryOwner,
      }, { status: 201 })
    }

    return new Response('Not found', { status: 404 })
  }

  const races = [
    { id: 'race-golden', name: 'Golden Retriever', speciesId: 'sp-perro' },
    { id: 'race-mestizo-perro', name: 'Mestizo', speciesId: 'sp-perro' },
  ]

  const result = await createQuickRecepPet({
    name: 'Firulais',
    speciesId: 'sp-perro',
    gender: 'Macho',
    clientId: 'client-quick-1',
    races,
  })

  assert.equal(result.id, 'pet-quick-1')

  // Debe haber llamado POST /api/Pets y POST /api/ClientsPets
  const petCall = calls.find((c) => c.url.includes('/api/Pets'))
  const cpCall = calls.find((c) => c.url.includes('/api/ClientsPets'))

  assert.ok(petCall)
  assert.equal(petCall?.body?.name, 'Firulais')
  assert.equal(petCall?.body?.speciesId, 'sp-perro')
  assert.equal(petCall?.body?.raceId, 'race-mestizo-perro')
  assert.equal(petCall?.body?.age, 0)
  assert.equal(petCall?.body?.gender, 'M')
  assert.equal(petCall?.body?.weight, 0.01)

  assert.ok(cpCall)
  assert.equal(cpCall?.body?.clientId, 'client-quick-1')
  assert.equal(cpCall?.body?.petId, 'pet-quick-1')
  assert.equal(cpCall?.body?.isPrimaryOwner, true)
})
