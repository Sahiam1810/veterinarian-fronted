import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canMarkRecepNoAsistio,
  isRecepAppointmentEditable,
  mapRecepAgendaStatus,
} from '../../src/modules/recepcionista/types/agenda.types.ts'

test('canMarkRecepNoAsistio solo en citas AGENDADO', () => {
  assert.equal(canMarkRecepNoAsistio('AGENDADO'), true)
  assert.equal(canMarkRecepNoAsistio('EN CONSULTORIO'), false)
  assert.equal(canMarkRecepNoAsistio('ATENDIDO'), false)
  assert.equal(canMarkRecepNoAsistio('CANCELADO'), false)
  assert.equal(canMarkRecepNoAsistio('NO ASISTIÓ'), false)
})

test('citas NO ASISTIÓ no se pueden editar ni reprogramar', () => {
  assert.equal(isRecepAppointmentEditable('NO ASISTIÓ'), false)
  assert.equal(isRecepAppointmentEditable('AGENDADO'), true)
})

test('mapRecepAgendaStatus reconoce NO_ASISTIO del backend', () => {
  assert.equal(mapRecepAgendaStatus('NO_ASISTIO'), 'NO ASISTIÓ')
  assert.equal(mapRecepAgendaStatus('No Asistió'), 'NO ASISTIÓ')
  assert.equal(mapRecepAgendaStatus('AGENDADA'), 'AGENDADO')
  assert.equal(mapRecepAgendaStatus('ATENDIDA'), 'ATENDIDO')
  assert.equal(mapRecepAgendaStatus('CANCELADA'), 'CANCELADO')
})
