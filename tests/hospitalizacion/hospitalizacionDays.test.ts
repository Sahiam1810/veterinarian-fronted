import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateStayDays,
  formatStayDays,
  validateAdmissionForm,
} from '../../src/modules/hospitalizacion/utils/hospitalizacionDays.ts'

test('calculateStayDays returns 0 for same day admission', () => {
  const now = new Date('2026-09-24T18:00:00Z').getTime()
  const admittedAt = '2026-09-24T08:00:00Z'
  assert.equal(calculateStayDays(admittedAt, null, now), 0)
})

test('calculateStayDays returns correct count for past days', () => {
  const now = new Date('2026-09-24T10:00:00Z').getTime()
  const admittedAt = '2026-09-21T10:00:00Z' // 3 days ago
  assert.equal(calculateStayDays(admittedAt, null, now), 3)
})

test('calculateStayDays uses dischargedAt when available', () => {
  const admittedAt = '2026-09-20T10:00:00Z'
  const dischargedAt = '2026-09-22T10:00:00Z' // 2 days
  assert.equal(calculateStayDays(admittedAt, dischargedAt), 2)
})

test('calculateStayDays returns 0 for invalid or null dates', () => {
  assert.equal(calculateStayDays(null), 0)
  assert.equal(calculateStayDays(undefined), 0)
  assert.equal(calculateStayDays('invalid-date'), 0)
})

test('formatStayDays formats singular and plural days correctly', () => {
  assert.equal(formatStayDays(0), '0 días')
  assert.equal(formatStayDays(1), '1 día')
  assert.equal(formatStayDays(2), '2 días')
  assert.equal(formatStayDays(10), '10 días')
})

test('validateAdmissionForm validates clientPetId and motivo', () => {
  assert.deepEqual(validateAdmissionForm('', 'Motivo'), {
    ok: false,
    error: 'Debes seleccionar una mascota.',
  })
  assert.deepEqual(validateAdmissionForm('cp-1', '   '), {
    ok: false,
    error: 'El motivo de hospitalización es obligatorio.',
  })
  assert.deepEqual(validateAdmissionForm('cp-1', 'Motivo válido'), {
    ok: true,
  })
})
