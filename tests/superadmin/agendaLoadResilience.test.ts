import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AGENDA_CATALOG_KEYS,
  AGENDA_CATALOGS,
  AGENDA_FALLBACKS,
  loadAgendaData,
  type AgendaCatalogKey,
  type AgendaFetchers,
} from '../../src/modules/superadmin/hooks/agendaLoadHelpers.ts'
import type { ApiAppointmentResponse } from '../../src/modules/superadmin/services/superAdminAppointmentsService.ts'

/**
 * Diseño de pruebas:
 * se prueba `loadAgendaData` (mismo orquestador que usa useAgendaSuperAdmin)
 * con fetchers inyectados que resuelven o rechazan con errores tipo ApiError,
 * sin importar apiClient/env ni el alias `@/`.
 */

const LEGACY_AGENDA_DENIED = 'No tienes permisos para ver la agenda.'

const appointment: ApiAppointmentResponse = {
  id: 'apt-1',
  clientPetId: 'cp-1',
  petName: 'Firulais',
  veterinarianId: 'vet-1',
  veterinarianName: 'Dra. Gómez',
  serviceId: 'srv-1',
  serviceName: null,
  statusId: 'st-1',
  statusName: 'AGENDADA',
  availabilityId: 'av-1',
  scheduledStart: '2026-10-05T14:00:00Z',
  scheduledEnd: '2026-10-05T14:30:00Z',
  notes: null,
  createdAt: '2026-10-01T00:00:00Z',
}

function apiError(status: number, message = 'Forbidden'): Error {
  return Object.assign(new Error(message), { status, name: 'ApiError' })
}

function okFetchers(): AgendaFetchers {
  return {
    appointments: async () => [appointment],
    veterinarians: async () => [
      {
        id: 'vet-1',
        userId: 'u-1',
        userFullName: 'Dra. Gómez',
        specialtyId: 'sp-1',
        licenseNumber: 'L-1',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    pets: async () => [
      { id: 'p-1', name: 'Firulais', age: 3, gender: 'Male', weight: 12, speciesId: 's-1', raceId: 'r-1' },
    ],
    clientsPets: async () => [
      { id: 'cp-1', clientId: 'c-1', petId: 'p-1', isPrimaryOwner: true, createdAt: '2026-01-01T00:00:00Z' },
    ],
    clients: async () => [
      {
        id: 'c-1',
        identificationNumber: '123',
        phoneNumber: '3001234567',
        createdAt: '2026-01-01T00:00:00Z',
        fullName: 'Ana Pérez',
        email: 'ana@test.com',
        isActive: true,
      },
    ],
    species: async () => [{ id: 's-1', name: 'Canino' }],
    races: async () => [{ id: 'r-1', name: 'Labrador', speciesId: 's-1' }],
    services: async () => [
      { id: 'srv-1', typeServiceId: 't-1', name: 'Consulta General', durationMinutes: 30, price: 1, isActive: true },
    ],
    statuses: async () => [{ id: 'st-1', name: 'AGENDADA', createdAt: '2026-01-01T00:00:00Z' }],
  }
}

function withFailure(key: AgendaCatalogKey, err: Error): AgendaFetchers {
  return {
    ...okFetchers(),
    [key]: async () => {
      throw err
    },
  } as AgendaFetchers
}

test('Todo 200: la cita se enriquece con todos los catálogos y sin diagnóstico', async () => {
  const result = await loadAgendaData(okFetchers())
  assert.equal(result.ok, true)
  if (!result.ok) return

  const [cita] = result.data.citas
  assert.equal(cita.petName, 'Firulais')
  assert.equal(cita.ownerName, 'Ana Pérez')
  assert.equal(cita.petBreed, 'Labrador')
  assert.equal(cita.species, 'Canino')
  assert.equal(cita.service, 'Consulta General')
  assert.equal(cita.professionalName, 'Dra. Gómez')
  assert.deepEqual(result.data.catalogFailures, [])
})

test('Citas 200 + Clients 403: Agenda visible, cita disponible y dueño con fallback', async () => {
  const result = await loadAgendaData(withFailure('clients', apiError(403)))

  assert.equal(result.ok, true, 'un 403 de /api/Clients no debe bloquear la Agenda')
  if (!result.ok) return

  assert.equal(result.data.citas.length, 1)
  const [cita] = result.data.citas
  assert.equal(cita.id, 'apt-1')
  assert.equal(cita.petName, 'Firulais')
  assert.equal(cita.ownerName, AGENDA_FALLBACKS.ownerName)

  assert.equal(result.data.catalogFailures.length, 1)
  const [failure] = result.data.catalogFailures
  assert.equal(failure.key, 'clients')
  assert.equal(failure.endpoint, '/api/Clients')
  assert.equal(failure.status, 403)
  assert.ok(failure.message.includes('Clientes.View'))
  assert.ok(!failure.message.includes(LEGACY_AGENDA_DENIED))
})

for (const key of AGENDA_CATALOG_KEYS) {
  for (const status of [403, 500, 0]) {
    test(`Citas 200 + ${AGENDA_CATALOGS[key].endpoint} ${status}: Agenda visible con fallback`, async () => {
      const result = await loadAgendaData(withFailure(key, apiError(status, 'boom')))

      assert.equal(result.ok, true)
      if (!result.ok) return

      assert.equal(result.data.citas.length, 1)
      const [cita] = result.data.citas
      assert.equal(cita.id, 'apt-1')
      assert.ok(cita.petName, 'petName nunca queda vacío')
      assert.ok(cita.ownerName, 'ownerName nunca queda vacío')
      assert.ok(cita.petBreed, 'petBreed nunca queda vacío')
      assert.ok(cita.species, 'species nunca queda vacío')
      assert.ok(cita.service, 'service nunca queda vacío')
      assert.ok(cita.professionalName, 'professionalName nunca queda vacío')

      assert.deepEqual(
        result.data.catalogFailures.map((f) => [f.key, f.status]),
        [[key, status]],
      )
    })
  }
}

function secondaryCatalogsDown(appointments: ApiAppointmentResponse[]): AgendaFetchers {
  return {
    ...okFetchers(),
    appointments: async () => appointments,
    veterinarians: async () => {
      throw apiError(403)
    },
    pets: async () => {
      throw apiError(403)
    },
    clientsPets: async () => {
      throw apiError(403)
    },
    clients: async () => {
      throw apiError(403)
    },
    species: async () => {
      throw apiError(500)
    },
    races: async () => {
      throw apiError(500)
    },
    services: async () => {
      throw apiError(403)
    },
  }
}

// petName/veterinarianName son opcionales en el contrato; el listado actual
// (GET /api/Appointments) no garantiza rellenarlos.
test('Catálogos secundarios caídos + cita con petName/veterinarianName: se conservan esos valores', async () => {
  const result = await loadAgendaData(secondaryCatalogsDown([appointment]))
  assert.equal(result.ok, true)
  if (!result.ok) return

  const [cita] = result.data.citas
  assert.equal(cita.petName, 'Firulais')
  assert.equal(cita.professionalName, 'Dra. Gómez')
  assert.equal(cita.ownerName, AGENDA_FALLBACKS.ownerName)
  assert.equal(cita.petBreed, AGENDA_FALLBACKS.petBreed)
  assert.equal(cita.species, AGENDA_FALLBACKS.species)
  assert.equal(cita.service, AGENDA_FALLBACKS.service)
  assert.equal(cita.status, 'AGENDADA')
  assert.deepEqual(result.data.profesionalesOpciones, [{ id: 'vet-1', name: 'Dra. Gómez' }])
  assert.equal(result.data.catalogFailures.length, 7)
})

test('Catálogos secundarios caídos + cita sin petName/veterinarianName: fallbacks explícitos', async () => {
  const sinNombres: ApiAppointmentResponse = { ...appointment, petName: null, veterinarianName: null }
  const result = await loadAgendaData(secondaryCatalogsDown([sinNombres]))
  assert.equal(result.ok, true)
  if (!result.ok) return

  assert.equal(result.data.citas.length, 1)
  const [cita] = result.data.citas
  assert.equal(cita.id, 'apt-1')
  assert.equal(cita.petName, 'Mascota no disponible')
  assert.equal(cita.professionalName, 'Profesional no disponible')
  assert.equal(cita.ownerName, 'Dueño no disponible')
  assert.equal(cita.service, 'Servicio no disponible')
  assert.equal(cita.status, 'AGENDADA')
  assert.deepEqual(result.data.profesionalesOpciones, [
    { id: 'vet-1', name: 'Profesional no disponible' },
  ])
  assert.equal(result.data.catalogFailures.length, 7)
})

test('Citas 403: error de Agenda asociado a Citas.View', async () => {
  const result = await loadAgendaData({
    ...okFetchers(),
    appointments: async () => {
      throw apiError(403)
    },
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.status, 403)
  assert.ok(result.error.includes('agenda'))
  assert.ok(result.error.includes('Citas.View'))
})

test('Citas 403 + Clients 403: el error reportado es el de Citas, no el del catálogo', async () => {
  const result = await loadAgendaData({
    ...withFailure('clients', apiError(403)),
    appointments: async () => {
      throw apiError(403)
    },
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.ok(result.error.includes('Citas.View'))
  assert.ok(!result.error.includes('Clientes'))
})

test('Citas 500: muestra el mensaje del backend y no lo presenta como falta de permisos', async () => {
  const result = await loadAgendaData({
    ...okFetchers(),
    appointments: async () => {
      throw apiError(500, 'Error interno al consultar citas.')
    },
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error, 'Error interno al consultar citas.')
  assert.ok(!result.error.toLowerCase().includes('permiso'))
})
