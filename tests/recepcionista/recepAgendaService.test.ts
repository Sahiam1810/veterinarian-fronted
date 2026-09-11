import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import { createRecepAppointment } from '../../src/modules/recepcionista/services/recepAgendaService.ts'
import type { RecepAgendaFormState } from '../../src/modules/recepcionista/types/agenda.types.ts'

const originalFetch = globalThis.fetch
const originalTz = process.env.TZ

beforeEach(() => {
  // Bogotá es UTC-5: es la zona donde el bug de "new Date(string)" se manifiesta
  // (medianoche UTC de un string "YYYY-MM-DD" cae en el día local anterior).
  process.env.TZ = 'America/Bogota'

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
  process.env.TZ = originalTz
})

function baseForm(overrides: Partial<RecepAgendaFormState> = {}): RecepAgendaFormState {
  return {
    ownerQuery: '',
    ownerId: 'owner-1',
    petId: 'pet-1',
    serviceId: 'service-1',
    professionalId: 'vet-1',
    dateValue: '2026-09-11',
    timeSlotId: '09:00',
    notes: '',
    ...overrides,
  }
}

function mockScheduleFetch(calls: Array<{ url: string; method?: string; body?: any }>) {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/ClientsPets')) {
      return Response.json([{ id: 'cp-1', clientId: 'owner-1', petId: 'pet-1' }])
    }
    if (urlStr.includes('/api/Availabilities')) {
      return Response.json([{ id: 'avail-1' }])
    }
    if (urlStr.includes('/api/StatusAppointments')) {
      return Response.json([{ id: 'status-agendada', name: 'Agendada' }])
    }
    if (urlStr.includes('/api/Appointments')) {
      return Response.json({ id: 'apt-new-1' }, { status: 201 })
    }
    return new Response('Not found', { status: 404 })
  }
}

// S30 (fix de fechas): agendar para un día no debe guardar el día anterior.
test('createRecepAppointment guarda scheduledStart en el día elegido, no un día antes (Bogotá UTC-5)', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []
  mockScheduleFetch(calls)

  await createRecepAppointment(baseForm({ dateValue: '2026-09-11', timeSlotId: '09:00' }))

  const createCall = calls.find((c) => c.url.includes('/api/Appointments') && c.method === 'POST')
  assert.ok(createCall, 'debió llamar a POST /api/Appointments')
  assert.equal(createCall!.body.scheduledStart.slice(0, 10), '2026-09-11')
  assert.equal(createCall!.body.scheduledEnd.slice(0, 10), '2026-09-11')
})

test('createRecepAppointment respeta la hora elegida del selector de turnos', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []
  mockScheduleFetch(calls)

  await createRecepAppointment(baseForm({ dateValue: '2026-01-05', timeSlotId: '14:30' }))

  const createCall = calls.find((c) => c.url.includes('/api/Appointments') && c.method === 'POST')
  // 14:30 hora Bogotá (UTC-5) == 19:30 UTC
  assert.equal(createCall!.body.scheduledStart, '2026-01-05T19:30:00.000Z')
})
