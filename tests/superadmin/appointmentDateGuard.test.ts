import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isAppointmentDateInThePast,
  PAST_APPOINTMENT_MESSAGE,
} from '../../src/modules/superadmin/utils/appointmentDateGuard.ts'

// S36: agendar/reprogramar en una fecha/hora ya pasada debe rechazarse.
const NOW = new Date('2026-09-11T14:00:00') // 2026-09-11, 14:00 hora local del test runner

test('isAppointmentDateInThePast detecta una fecha anterior a hoy', () => {
  assert.equal(isAppointmentDateInThePast('2026-09-10', '08:00', NOW), true)
})

test('isAppointmentDateInThePast detecta una hora ya pasada en el día de hoy', () => {
  assert.equal(isAppointmentDateInThePast('2026-09-11', '08:00', NOW), true)
})

test('isAppointmentDateInThePast acepta una hora futura en el día de hoy', () => {
  assert.equal(isAppointmentDateInThePast('2026-09-11', '15:00', NOW), false)
})

test('isAppointmentDateInThePast acepta una fecha futura', () => {
  assert.equal(isAppointmentDateInThePast('2026-09-12', '08:00', NOW), false)
})

test('PAST_APPOINTMENT_MESSAGE es el mismo mensaje usado en el resto del flujo', () => {
  assert.equal(
    PAST_APPOINTMENT_MESSAGE,
    'No se puede agendar ni reprogramar una cita en una fecha u hora que ya pasó.',
  )
})
