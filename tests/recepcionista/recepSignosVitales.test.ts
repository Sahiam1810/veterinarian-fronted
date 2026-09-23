import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import {
  updateAppointmentVitals,
  fetchRecepDayAppointments,
} from '../../src/modules/recepcionista/services/recepAgendaService.ts'
import { canTakeRecepVitals } from '../../src/modules/recepcionista/types/agenda.types.ts'
import { createRecepPermissionHelpers } from '../../src/modules/recepcionista/utils/recepModulePermissions.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.get(key) ?? null
    },
    key(index) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, value)
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: memoryStorage,
  })
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: memoryStorage,
  })
  localStorage.setItem(
    'huellitas_auth_tokens',
    JSON.stringify({
      accessToken: 'test-token-vitals',
      accessTokenExpiresAt: '2099-01-01T00:00:00Z',
      refreshToken: 'test-refresh-vitals',
    }),
  )
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('canTakeRecepVitals solo permite registrar signos en citas activas (AGENDADO, EN ESPERA, EN CONSULTORIO)', () => {
  assert.equal(canTakeRecepVitals('AGENDADO'), true)
  assert.equal(canTakeRecepVitals('EN ESPERA'), true)
  assert.equal(canTakeRecepVitals('EN CONSULTORIO'), true)

  assert.equal(canTakeRecepVitals('ATENDIDO'), false)
  assert.equal(canTakeRecepVitals('CANCELADO'), false)
  assert.equal(canTakeRecepVitals('NO ASISTIÓ'), false)
})

test('updateAppointmentVitals envía PATCH /api/Appointments/{id}/vitals con payload de signos', async () => {
  const calls: Array<{ url: string; method?: string; body?: any; headers?: any }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({
      url: urlStr,
      method: init?.method,
      body: bodyParsed,
      headers: init?.headers,
    })

    return Response.json({
      id: 'cita-123',
      weight: 14.5,
      temperature: 38.6,
      heartRate: 110,
      respiratoryRate: 24,
    })
  }

  await updateAppointmentVitals('cita-123', {
    weight: 14.5,
    temperature: 38.6,
    heartRate: 110,
    respiratoryRate: 24,
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0].method, 'PATCH')
  assert.match(calls[0].url, /\/api\/Appointments\/cita-123\/vitals$/)
  assert.deepEqual(calls[0].body, {
    weight: 14.5,
    temperature: 38.6,
    heartRate: 110,
    respiratoryRate: 24,
  })
})

test('fetchRecepDayAppointments mapea los signos vitales si existen en la respuesta del backend', async () => {
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const urlStr = String(input)
    if (urlStr.includes('/api/Appointments')) {
      return Response.json([
        {
          id: 'cita-1',
          clientPetId: 'cp-1',
          veterinarianId: 'vet-1',
          serviceId: 'srv-1',
          scheduledStart: '2026-09-22T10:00:00',
          scheduledEnd: '2026-09-22T10:30:00',
          statusName: 'AGENDADO',
          notes: 'Control anual',
          weight: 28.2,
          temperature: 38.9,
          heartRate: 95,
          respiratoryRate: 20,
        },
      ])
    }
    if (urlStr.includes('/api/ClientsPets')) {
      return Response.json([{ id: 'cp-1', clientId: 'c-1', petId: 'p-1' }])
    }
    if (urlStr.includes('/api/Pets')) {
      return Response.json([{ id: 'p-1', name: 'Firulais', raceId: 'r-1' }])
    }
    if (urlStr.includes('/api/Clients')) {
      return Response.json([{ id: 'c-1', fullName: 'Juan Perez', phoneNumber: '3001234567' }])
    }
    if (urlStr.includes('/api/Services')) {
      return Response.json([{ id: 'srv-1', name: 'Consulta General' }])
    }
    if (urlStr.includes('/api/Veterinarians')) {
      return Response.json([{ id: 'vet-1', userFullName: 'Dra. Gomez' }])
    }
    if (urlStr.includes('/api/StatusAppointments')) {
      return Response.json([{ id: 'st-1', name: 'AGENDADO' }])
    }
    if (urlStr.includes('/api/Races')) {
      return Response.json([{ id: 'r-1', name: 'Labrador' }])
    }
    return Response.json([])
  }

  const appointments = await fetchRecepDayAppointments('2026-09-22')
  assert.equal(appointments.length, 1)
  assert.equal(appointments[0].id, 'cita-1')
  assert.equal(appointments[0].petName, 'Firulais')
  assert.equal(appointments[0].weightKg, 28.2)
  assert.equal(appointments[0].temperature, 38.9)
  assert.equal(appointments[0].heartRate, 95)
  assert.equal(appointments[0].respiratoryRate, 20)
})

// Prueba el helper de permisos real que usa RecepDayCalendarPanel (no un rol
// hardcodeado) -- así respeta lo que de verdad devuelva /api/auth/permissions,
// sea cual sea el rol logueado.
test('canEditModule("signosVitales") sigue el permiso real "Signos Vitales", no el nombre del rol', () => {
  const auxiliarConPermiso = createRecepPermissionHelpers({
    'Signos Vitales': { canView: true, canCreate: false, canEdit: true, canDelete: false },
  })
  assert.equal(auxiliarConPermiso.canEditModule('signosVitales'), true)

  // Recepcionista hoy no tiene fila para "Signos Vitales" en el backend --
  // el mapa de permisos ni siquiera trae esa clave.
  const recepcionistaSinPermiso = createRecepPermissionHelpers({
    Citas: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  })
  assert.equal(recepcionistaSinPermiso.canEditModule('signosVitales'), false)

  // Si algún día SuperAdmin le otorga el permiso a Recepcionista desde el
  // panel, este mismo helper debe reflejarlo sin cambiar código.
  const recepcionistaConPermisoOtorgado = createRecepPermissionHelpers({
    'Signos Vitales': { canView: true, canCreate: false, canEdit: true, canDelete: false },
  })
  assert.equal(recepcionistaConPermisoOtorgado.canEditModule('signosVitales'), true)

  // Ver sin poder editar (o al revés) no debe alcanzar -- ambos flags cuentan.
  const soloVer = createRecepPermissionHelpers({
    'Signos Vitales': { canView: true, canCreate: false, canEdit: false, canDelete: false },
  })
  assert.equal(soloVer.canEditModule('signosVitales'), false)
})
