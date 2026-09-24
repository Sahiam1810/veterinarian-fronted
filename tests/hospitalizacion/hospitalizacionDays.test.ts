import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateStayDays,
  formatStayDays,
  validateAdmissionForm,
} from '../../src/modules/hospitalizacion/utils/hospitalizacionDays.ts'

test('calculateStayDays returns 0 for same day admission', () => {
  const admitted = '2026-09-24T08:00:00Z'
  const now = new Date('2026-09-24T12:00:00Z').getTime()
  assert.equal(calculateStayDays(admitted, null, now), 0)
})

test('calculateStayDays computes exact full days elapsed', () => {
  const admitted = '2026-09-20T08:00:00Z'
  const now = new Date('2026-09-24T14:00:00Z').getTime()
  assert.equal(calculateStayDays(admitted, null, now), 4)
})

test('calculateStayDays uses dischargedAt when available', () => {
  const admitted = '2026-09-20T08:00:00Z'
  const discharged = '2026-09-22T08:00:00Z'
  const now = new Date('2026-09-24T14:00:00Z').getTime()
  assert.equal(calculateStayDays(admitted, discharged, now), 2)
})

test('calculateStayDays returns 0 for null or invalid dates', () => {
  assert.equal(calculateStayDays(null), 0)
  assert.equal(calculateStayDays(undefined), 0)
  assert.equal(calculateStayDays('invalid-date'), 0)
})

test('formatStayDays outputs readable Spanish text', () => {
  assert.equal(formatStayDays(0), '0 días')
  assert.equal(formatStayDays(1), '1 día')
  assert.equal(formatStayDays(3), '3 días')
})

test('validateAdmissionForm requires clientPetId and non-empty motivo', () => {
  assert.deepEqual(validateAdmissionForm('', 'Motivo'), {
    ok: false,
    error: 'Debes seleccionar una mascota.',
  })
  assert.deepEqual(validateAdmissionForm(null, 'Motivo'), {
    ok: false,
    error: 'Debes seleccionar una mascota.',
  })
  assert.deepEqual(validateAdmissionForm('cp-1', ''), {
    ok: false,
    error: 'El motivo de hospitalización es obligatorio.',
  })
  assert.deepEqual(validateAdmissionForm('cp-1', '   '), {
    ok: false,
    error: 'El motivo de hospitalización es obligatorio.',
  })
  assert.deepEqual(validateAdmissionForm('cp-1', 'Observación postoperatoria'), {
    ok: true,
  })
})
