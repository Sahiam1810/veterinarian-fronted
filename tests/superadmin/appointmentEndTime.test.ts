import assert from 'node:assert/strict'
import test from 'node:test'

import {
  deriveEndTime,
  INVALID_SERVICE_DURATION_MESSAGE,
  resolveServiceDurationMinutes,
} from '../../src/modules/superadmin/utils/appointmentEndTime.ts'

const SERVICES = [
  { id: 'consulta', durationMinutes: 30 },
  { id: 'cirugia', durationMinutes: 60 },
  { id: 'vacuna', durationMinutes: 45 },
  { id: 'sin-duracion' },
  { id: 'cero', durationMinutes: 0 },
  { id: 'negativa', durationMinutes: -15 },
  { id: 'fraccion', durationMinutes: 12.5 },
  { id: 'nan', durationMinutes: Number.NaN },
]

test('deriveEndTime suma la duración de un servicio de 60 min', () => {
  assert.equal(deriveEndTime('09:00', 60), '10:00')
})

test('deriveEndTime suma la duración de un servicio de 45 min', () => {
  assert.equal(deriveEndTime('09:30', 45), '10:15')
})

test('deriveEndTime cruza la medianoche sin producir horas inválidas', () => {
  assert.equal(deriveEndTime('23:30', 60), '00:30')
})

test('resolveServiceDurationMinutes toma la duración del servicio seleccionado', () => {
  assert.equal(resolveServiceDurationMinutes(SERVICES, 'cirugia'), 60)
  assert.equal(resolveServiceDurationMinutes(SERVICES, 'vacuna'), 45)
})

test('resolveServiceDurationMinutes devuelve null sin servicio o sin duración conocida', () => {
  assert.equal(resolveServiceDurationMinutes(SERVICES, ''), null)
  assert.equal(resolveServiceDurationMinutes(SERVICES, 'sin-duracion'), null)
  assert.equal(resolveServiceDurationMinutes(SERVICES, 'inexistente'), null)
})

test('resolveServiceDurationMinutes rechaza duraciones inválidas (no hay fin manual de respaldo)', () => {
  for (const id of ['cero', 'negativa', 'fraccion', 'nan']) {
    assert.equal(resolveServiceDurationMinutes(SERVICES, id), null, id)
  }
})

test('INVALID_SERVICE_DURATION_MESSAGE explica el error de configuración', () => {
  assert.match(INVALID_SERVICE_DURATION_MESSAGE, /duración válida/)
})

test('al cambiar de servicio el fin se recalcula desde el mismo inicio', () => {
  const start = '14:00'
  const before = deriveEndTime(start, resolveServiceDurationMinutes(SERVICES, 'consulta')!)
  const after = deriveEndTime(start, resolveServiceDurationMinutes(SERVICES, 'cirugia')!)
  assert.equal(before, '14:30')
  assert.equal(after, '15:00')
})
