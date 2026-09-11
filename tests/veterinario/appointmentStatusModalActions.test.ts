import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mapAppointmentStatus,
  isTerminalAppointmentStatus,
  isAttendedStatus,
  isPendingStatus,
} from '../../src/modules/veterinario/utils/mapAppointmentStatus.ts'
import { mapAgendaEventStatus } from '../../src/modules/veterinario/utils/mapAgendaEventStatus.ts'

// Tarea S38: Citas en estados terminales (NO_ASISTIO, CANCELADA, ATENDIDA) deben mapearse
// correctamente desde BD (con guión bajo) y deshabilitar botones de acción en la agenda del veterinario.

test('mapAppointmentStatus mapea correctamente estados con guión bajo desde BD', () => {
  assert.equal(mapAppointmentStatus('NO_ASISTIO'), 'NO ASISTIÓ')
  assert.equal(mapAppointmentStatus('no_asistio'), 'NO ASISTIÓ')
  assert.equal(mapAppointmentStatus('no asistio'), 'NO ASISTIÓ')
  assert.equal(mapAppointmentStatus('No Asistió'), 'NO ASISTIÓ')
  assert.equal(mapAppointmentStatus('no-asistio'), 'NO ASISTIÓ')
  assert.equal(mapAppointmentStatus('ausente'), 'NO ASISTIÓ')
  assert.equal(mapAppointmentStatus('missed'), 'NO ASISTIÓ')

  assert.equal(mapAppointmentStatus('CANCELADA'), 'CANCELADO')
  assert.equal(mapAppointmentStatus('cancelado'), 'CANCELADO')

  assert.equal(mapAppointmentStatus('ATENDIDA'), 'ATENDIDO')
  assert.equal(mapAppointmentStatus('atendido'), 'ATENDIDO')
  assert.equal(mapAppointmentStatus('completada'), 'ATENDIDO')

  assert.equal(mapAppointmentStatus('EN_ESPERA'), 'EN ESPERA')
  assert.equal(mapAppointmentStatus('en espera'), 'EN ESPERA')

  assert.equal(mapAppointmentStatus('AGENDADA'), 'AGENDADO')
  assert.equal(mapAppointmentStatus(null), 'AGENDADO')
  assert.equal(mapAppointmentStatus(''), 'AGENDADO')
})

test('mapAgendaEventStatus mapea NO_ASISTIO y no_asistio a NO_ASISTIO para eventos de agenda', () => {
  assert.equal(mapAgendaEventStatus('NO_ASISTIO'), 'NO_ASISTIO')
  assert.equal(mapAgendaEventStatus('no_asistio'), 'NO_ASISTIO')
  assert.equal(mapAgendaEventStatus('No Asistió'), 'NO_ASISTIO')
  assert.equal(mapAgendaEventStatus('no-asistio'), 'NO_ASISTIO')

  assert.equal(mapAgendaEventStatus('CANCELADA'), 'CANCELADA')
  assert.equal(mapAgendaEventStatus('cancelada'), 'CANCELADA')

  assert.equal(mapAgendaEventStatus('ATENDIDA'), 'ATENDIDA')
  assert.equal(mapAgendaEventStatus('atendida'), 'ATENDIDA')

  assert.equal(mapAgendaEventStatus('EN_ESPERA'), 'EN_ESPERA')
  assert.equal(mapAgendaEventStatus('AGENDADA'), 'AGENDADA')
})

test('isTerminalAppointmentStatus identifica estados cerrados/terminales', () => {
  assert.equal(isTerminalAppointmentStatus('NO ASISTIÓ'), true)
  assert.equal(isTerminalAppointmentStatus('CANCELADO'), true)
  assert.equal(isTerminalAppointmentStatus('ATENDIDO'), true)

  assert.equal(isTerminalAppointmentStatus('AGENDADO'), false)
  assert.equal(isTerminalAppointmentStatus('EN ESPERA'), false)
})

test('isAttendedStatus y isPendingStatus evalúan estados de cita correctamente', () => {
  assert.equal(isAttendedStatus('ATENDIDO'), true)
  assert.equal(isAttendedStatus('AGENDADO'), false)

  assert.equal(isPendingStatus('AGENDADO'), true)
  assert.equal(isPendingStatus('EN ESPERA'), true)
  assert.equal(isPendingStatus('NO ASISTIÓ'), false)
  assert.equal(isPendingStatus('CANCELADO'), false)
  assert.equal(isPendingStatus('ATENDIDO'), false)
})

// Simulación de las reglas de habilitación de botones de CitaAccionesModal
function resolveModalButtonStates(appointment: {
  status: string
  rawStatusName?: string
}) {
  const isAtendida =
    appointment.status === 'ATENDIDA' ||
    appointment.status === 'ATENDIDO' ||
    /atendid|complet/i.test(appointment.rawStatusName || '')
  const isCancelada =
    appointment.status === 'CANCELADA' ||
    appointment.status === 'CANCELADO' ||
    /cancel/i.test(appointment.rawStatusName || '')
  const isNoAsistio =
    appointment.status === 'NO_ASISTIO' ||
    appointment.status === 'NO ASISTIÓ' ||
    /no[\s_-]*asist|ausent|missed|no[\s_-]?show/i.test(appointment.rawStatusName || '')
  const isTerminal = isAtendida || isCancelada || isNoAsistio

  return {
    canAttendAndRegister: !isTerminal,
    canChangeToAtendida: !isTerminal,
    canChangeToNoAsistio: !isTerminal,
    canChangeToCancelada: !isTerminal,
    activeTerminalState: isAtendida
      ? 'ATENDIDA'
      : isCancelada
        ? 'CANCELADA'
        : isNoAsistio
          ? 'NO_ASISTIO'
          : null,
  }
}

test('CitaAccionesModal: cita marcada como NO_ASISTIO por superadmin deshabilita Atender y cambios de estado', () => {
  // Cuando el superadmin pone no asistió, backend envía rawStatusName 'no_asistio'
  const stateFromRaw = resolveModalButtonStates({
    status: 'NO_ASISTIO',
    rawStatusName: 'no_asistio',
  })

  assert.equal(stateFromRaw.canAttendAndRegister, false)
  assert.equal(stateFromRaw.canChangeToAtendida, false)
  assert.equal(stateFromRaw.canChangeToNoAsistio, false)
  assert.equal(stateFromRaw.canChangeToCancelada, false)
  assert.equal(stateFromRaw.activeTerminalState, 'NO_ASISTIO')
})

test('CitaAccionesModal: cita CANCELADA deshabilita Atender y cambios de estado', () => {
  const state = resolveModalButtonStates({
    status: 'CANCELADA',
    rawStatusName: 'cancelada',
  })

  assert.equal(state.canAttendAndRegister, false)
  assert.equal(state.canChangeToAtendida, false)
  assert.equal(state.canChangeToNoAsistio, false)
  assert.equal(state.canChangeToCancelada, false)
  assert.equal(state.activeTerminalState, 'CANCELADA')
})

test('CitaAccionesModal: cita ATENDIDA deshabilita Atender y cambios de estado', () => {
  const state = resolveModalButtonStates({
    status: 'ATENDIDA',
    rawStatusName: 'atendida',
  })

  assert.equal(state.canAttendAndRegister, false)
  assert.equal(state.canChangeToAtendida, false)
  assert.equal(state.canChangeToNoAsistio, false)
  assert.equal(state.canChangeToCancelada, false)
  assert.equal(state.activeTerminalState, 'ATENDIDA')
})

test('CitaAccionesModal: cita AGENDADA mantiene habilitado Atender y las 3 opciones de cambio de estado', () => {
  const state = resolveModalButtonStates({
    status: 'AGENDADA',
    rawStatusName: 'agendada',
  })

  assert.equal(state.canAttendAndRegister, true)
  assert.equal(state.canChangeToAtendida, true)
  assert.equal(state.canChangeToNoAsistio, true)
  assert.equal(state.canChangeToCancelada, true)
  assert.equal(state.activeTerminalState, null)
})
