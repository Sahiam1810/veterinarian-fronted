import assert from 'node:assert/strict'
import test from 'node:test'

import type { ApiAvailabilityResponse } from '../../src/modules/superadmin/services/superAdminAvailabilitiesService.ts'
import {
  findMatchingAvailabilityId,
  NO_VET_AVAILABILITY_MESSAGE,
  resolveAvailabilityId,
} from '../../src/modules/superadmin/utils/resolveAvailabilityId.ts'

function availability(
  overrides: Partial<ApiAvailabilityResponse> & Pick<ApiAvailabilityResponse, 'id' | 'dayOfWeek'>,
): ApiAvailabilityResponse {
  return {
    veterinarianId: 'vet-1',
    startTime: '08:00:00',
    endTime: '18:00:00',
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    ...overrides,
  }
}

test('findMatchingAvailabilityId devuelve el bloque que cubre día y horario', () => {
  const list = [
    availability({ id: 'morning-mon', dayOfWeek: 1, startTime: '08:00:00', endTime: '12:00:00' }),
    availability({ id: 'afternoon-fri', dayOfWeek: 5, startTime: '14:00:00', endTime: '18:00:00' }),
  ]

  assert.equal(findMatchingAvailabilityId(list, '2026-09-07', '09:00', '09:30'), 'morning-mon')
  assert.equal(findMatchingAvailabilityId(list, '2026-09-11', '15:00', '15:30'), 'afternoon-fri')
})

test('findMatchingAvailabilityId no inventa coincidencia fuera de día u horario', () => {
  const list = [
    availability({ id: 'friday-afternoon', dayOfWeek: 5, startTime: '14:00:00', endTime: '18:00:00' }),
  ]

  assert.equal(findMatchingAvailabilityId(list, '2026-09-07', '15:00', '15:30'), null)
  assert.equal(findMatchingAvailabilityId(list, '2026-09-11', '09:00', '09:30'), null)
  assert.equal(findMatchingAvailabilityId(list, '2026-09-11', '17:30', '18:30'), null)
})

test('resolveAvailabilityId lanza y no crea disponibilidad cuando no hay coincidencia', async () => {
  let fetchCalls = 0
  await assert.rejects(
    () =>
      resolveAvailabilityId('vet-1', '2026-09-11', '10:00', '10:30', async () => {
        fetchCalls += 1
        return []
      }),
    (err: unknown) => {
      assert.ok(err instanceof Error)
      assert.equal(err.message, NO_VET_AVAILABILITY_MESSAGE)
      return true
    },
  )
  assert.equal(fetchCalls, 1)
})

// S41: sin tope fijo de 07:00-17:00 — un turno nocturno real debe encontrar coincidencia.
test('findMatchingAvailabilityId acepta un turno nocturno fuera de 07:00-17:00', () => {
  const list = [
    availability({ id: 'night-shift', dayOfWeek: 5, startTime: '19:00:00', endTime: '23:00:00' }),
  ]

  assert.equal(findMatchingAvailabilityId(list, '2026-09-11', '21:00', '21:30'), 'night-shift')
})

test('findMatchingAvailabilityId sigue rechazando una hora nocturna sin disponibilidad real', () => {
  const list = [
    availability({ id: 'day-shift', dayOfWeek: 5, startTime: '07:00:00', endTime: '17:00:00' }),
  ]

  assert.equal(findMatchingAvailabilityId(list, '2026-09-11', '21:00', '21:30'), null)
})

test('resolveAvailabilityId reutiliza el id existente cuando hay coincidencia', async () => {
  const id = await resolveAvailabilityId(
    'vet-1',
    '2026-09-11',
    '15:00',
    '15:30',
    async () => [
      availability({ id: 'block-1', dayOfWeek: 5, startTime: '14:00:00', endTime: '18:00:00' }),
    ],
  )
  assert.equal(id, 'block-1')
})
