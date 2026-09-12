import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildDefaultVeterinarianAvailabilityPayloads,
  buildProfesionalEditSavePayload,
  createDefaultVeterinarianSchedule,
  DEFAULT_VET_SCHEDULE_DIAS,
} from '../../src/modules/superadmin/utils/defaultVeterinarianSchedule.ts'
import { mapDiaToDayOfWeek } from '../../src/modules/superadmin/utils/superAdminApiMappers.ts'

test('crear usuario Veterinario genera 5 bloques Lunes-Viernes 07:00-17:00', () => {
  const payloads = buildDefaultVeterinarianAvailabilityPayloads('vet-abc')

  assert.equal(payloads.length, 5)
  assert.deepEqual(
    payloads.map((p) => p.dayOfWeek),
    DEFAULT_VET_SCHEDULE_DIAS.map((d) => mapDiaToDayOfWeek(d)),
  )
  for (const payload of payloads) {
    assert.equal(payload.veterinarianId, 'vet-abc')
    assert.equal(payload.startTime, '07:00:00')
    assert.equal(payload.endTime, '17:00:00')
    assert.equal(payload.isActive, true)
  }
})

test('createDefaultVeterinarianSchedule llama createAvailability una vez por día laboral', async () => {
  const calls: unknown[] = []
  await createDefaultVeterinarianSchedule('vet-1', async (payload) => {
    calls.push(payload)
    return { id: `av-${calls.length}` }
  })

  assert.equal(calls.length, 5)
})

test('guardar Editar Profesional no incluye horarioConfig ni dispara sync de disponibilidad', () => {
  const payload = buildProfesionalEditSavePayload({
    name: 'Dra. Elena Vargas',
    cmp: '84729',
    especialidad: 'Cirugía',
    email: 'elena@huellitas.test',
    phone: '3001112233',
    status: 'Activo',
  })

  assert.equal('horarioConfig' in payload, false)
  assert.deepEqual(payload, {
    name: 'Dra. Elena Vargas',
    cmp: '84729',
    especialidad: 'Cirugía',
    email: 'elena@huellitas.test',
    phone: '3001112233',
    status: 'Activo',
    avatarUrl: undefined,
  })
})
