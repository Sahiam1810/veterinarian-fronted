import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import { createRecepAppointment, fetchRecepDayAppointments, updateRecepAppointmentStatus } from '../../src/modules/recepcionista/services/recepAgendaService.ts'
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
      // Bloques que cubren viernes (2026-09-11) y lunes (2026-01-05) de 07:00 a 17:00,
      // suficientes para los horarios 09:00 y 14:30 usados en estos tests.
      return Response.json([
        { id: 'avail-viernes', veterinarianId: 'vet-1', dayOfWeek: 5, startTime: '07:00', endTime: '17:00', isActive: true },
        { id: 'avail-lunes', veterinarianId: 'vet-1', dayOfWeek: 1, startTime: '07:00', endTime: '17:00', isActive: true },
      ])
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

// S56: el availabilityId enviado debe ser el bloque real que cubre el día/hora
// elegidos, no el primer registro de /api/Availabilities del sistema.
test('createRecepAppointment usa el availabilityId del bloque que realmente cubre el horario', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []
  mockScheduleFetch(calls)

  await createRecepAppointment(baseForm({ dateValue: '2026-09-11', timeSlotId: '09:00' }))

  const createCall = calls.find((c) => c.url.includes('/api/Appointments') && c.method === 'POST')
  assert.equal(createCall!.body.availabilityId, 'avail-viernes')
})

// S56: si el veterinario no tiene disponibilidad configurada para ese día/hora,
// ya no se debe inventar una disponibilidad ("11111111-...") ni crear la cita.
test('createRecepAppointment rechaza la cita cuando no hay disponibilidad real para ese día/hora', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []
  mockScheduleFetch(calls)

  // 2026-09-12 es sábado: los bloques mockeados solo cubren viernes y lunes.
  await assert.rejects(
    () => createRecepAppointment(baseForm({ dateValue: '2026-09-12', timeSlotId: '09:00' })),
  )

  const createCall = calls.find((c) => c.url.includes('/api/Appointments') && c.method === 'POST')
  assert.equal(createCall, undefined, 'no debió llamar a POST /api/Appointments')
})

function mockDayPanelFetch(appointments: Array<{ id: string; scheduledStart: string; scheduledEnd?: string }>) {
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const urlStr = String(input)
    if (urlStr.includes('/api/Appointments')) {
      return Response.json(appointments.map((apt) => ({ scheduledEnd: apt.scheduledStart, ...apt })))
    }
    return Response.json([])
  }
}

// Bug: una cita de la noche en Bogotá (UTC-5) se guarda con fecha UTC del día
// siguiente (8:00 p.m. del 13/09 -> "2026-09-14T01:00:00.000Z"). El panel
// "Agenda del día" comparaba por texto crudo contra la fecha local elegida y
// la perdía. Debe seguir apareciendo bajo el día local en que realmente ocurre.
test('fetchRecepDayAppointments muestra una cita nocturna bajo su fecha local, no la fecha UTC', async () => {
  mockDayPanelFetch([
    { id: 'apt-noche', scheduledStart: '2026-09-14T01:00:00.000Z' }, // 8:00 p.m. del 13/09 en Bogotá
  ])

  const forHoy = await fetchRecepDayAppointments('2026-09-13')
  assert.equal(forHoy.length, 1)
  assert.equal(forHoy[0]?.id, 'apt-noche')

  const forDiaSiguiente = await fetchRecepDayAppointments('2026-09-14')
  assert.equal(forDiaSiguiente.length, 0)
})

function mockStatusCatalogFetch(calls: Array<{ url: string; method?: string; body?: any }>) {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/StatusAppointments')) {
      return Response.json([
        { id: 'status-agendada', name: 'AGENDADA' },
        { id: 'status-confirmada', name: 'CONFIRMADA' },
        { id: 'status-progreso', name: 'EN_PROGRESO' },
        { id: 'status-atendida', name: 'ATENDIDA' },
        { id: 'status-cancelada', name: 'CANCELADA' },
        { id: 'status-no-asistio', name: 'NO_ASISTIO' },
      ])
    }
    if (urlStr.includes('/api/Appointments/')) {
      return new Response(null, { status: 204 })
    }
    return new Response('Not found', { status: 404 })
  }
}

// Check-in: "EN ESPERA" en el frontend corresponde al estado real CONFIRMADA
// del catálogo del backend, no a un estado inventado "En Espera" que no existe.
test('updateRecepAppointmentStatus resuelve "EN ESPERA" al estado real CONFIRMADA', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []
  mockStatusCatalogFetch(calls)

  await updateRecepAppointmentStatus('apt-1', 'EN ESPERA')

  const patchCall = calls.find((c) => c.method === 'PATCH')
  assert.ok(patchCall, 'debió llamar a PATCH /api/Appointments/{id}/status')
  assert.equal(patchCall!.body.statusId, 'status-confirmada')
})
