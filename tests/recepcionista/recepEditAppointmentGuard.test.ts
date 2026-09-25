import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isRecepAppointmentEditable,
  canCheckIn,
  canTakeRecepVitals,
  canMarkRecepNoAsistio,
  mapRecepAgendaStatus,
  type RecepAgendaDayAppointment,
} from '../../src/modules/recepcionista/types/agenda.types.ts'

test('isRecepAppointmentEditable solo permite edición en citas AGENDADO', () => {
  // AGENDADO permite edición
  assert.equal(isRecepAppointmentEditable('AGENDADO'), true)

  // EN ESPERA no permite edición (después de marcar llegada)
  assert.equal(isRecepAppointmentEditable('EN ESPERA'), false)

  // EN CONSULTORIO no permite edición
  assert.equal(isRecepAppointmentEditable('EN CONSULTORIO'), false)

  // ATENDIDO no permite edición
  assert.equal(isRecepAppointmentEditable('ATENDIDO'), false)

  // CANCELADO no permite edición
  assert.equal(isRecepAppointmentEditable('CANCELADO'), false)

  // NO ASISTIÓ no permite edición
  assert.equal(isRecepAppointmentEditable('NO ASISTIÓ'), false)
})

test('mapRecepAgendaStatus mapea CONFIRMADA (llegada marcada en backend) a EN ESPERA', () => {
  assert.equal(mapRecepAgendaStatus('CONFIRMADA'), 'EN ESPERA')
  assert.equal(mapRecepAgendaStatus('confirmada'), 'EN ESPERA')
  assert.equal(mapRecepAgendaStatus('CONFIRMADO'), 'EN ESPERA')
})

test('después de marcar llegada, el estado pasa a EN ESPERA y la edición se bloquea', () => {
  const appointment: RecepAgendaDayAppointment = {
    id: 'apt-101',
    time: '09:00',
    endTime: '09:30',
    petName: 'Rocco',
    breed: 'Labrador',
    ownerName: 'Carlos Gómez',
    professionalName: 'Dra. María',
    service: 'Consulta General',
    status: 'AGENDADO',
    isPaid: true,
  }

  // Antes de marcar llegada: editable y puede hacer check-in
  assert.equal(isRecepAppointmentEditable(appointment.status), true)
  assert.equal(canCheckIn(appointment.status), true)

  // Simulación: marcar llegada actualiza el estado a CONFIRMADA -> EN ESPERA
  const updatedAppointment: RecepAgendaDayAppointment = {
    ...appointment,
    status: mapRecepAgendaStatus('CONFIRMADA'),
  }

  assert.equal(updatedAppointment.status, 'EN ESPERA')
  // Después de marcar llegada: ya no es editable ni puede hacer check-in nuevamente
  assert.equal(isRecepAppointmentEditable(updatedAppointment.status), false)
  assert.equal(canCheckIn(updatedAppointment.status), false)
  // Pero aún puede tomar signos vitales en recepción
  assert.equal(canTakeRecepVitals(updatedAppointment.status), true)
})

test('el handler defensivo rechaza abrir edición si la cita ya no está en estado AGENDADO', () => {
  const notices: string[] = []
  let formPopulated = false

  const simulateHandleEdit = (appointment: RecepAgendaDayAppointment) => {
    if (!isRecepAppointmentEditable(appointment.status)) {
      notices.push('Solo se pueden editar citas en estado agendado')
      return
    }
    formPopulated = true
  }

  // Cita en espera (llegada marcada)
  simulateHandleEdit({
    id: 'apt-1',
    time: '10:00',
    endTime: '10:30',
    petName: 'Rocco',
    breed: 'Golden',
    ownerName: 'Ana',
    professionalName: 'Dr. Perez',
    service: 'Control',
    status: 'EN ESPERA',
    isPaid: true,
  })

  assert.equal(formPopulated, false)
  assert.equal(notices.length, 1)
  assert.equal(notices[0], 'Solo se pueden editar citas en estado agendado')

  // Cita en consultorio
  simulateHandleEdit({
    id: 'apt-2',
    time: '10:30',
    endTime: '11:00',
    petName: 'Luna',
    breed: 'Poodle',
    ownerName: 'Pedro',
    professionalName: 'Dr. Perez',
    service: 'Vacunación',
    status: 'EN CONSULTORIO',
    isPaid: true,
  })

  assert.equal(formPopulated, false)
  assert.equal(notices.length, 2)

  // Cita agendada (sí permite abrir)
  simulateHandleEdit({
    id: 'apt-3',
    time: '11:00',
    endTime: '11:30',
    petName: 'Max',
    breed: 'Beagle',
    ownerName: 'Sofía',
    professionalName: 'Dr. Perez',
    service: 'Consulta General',
    status: 'AGENDADO',
    isPaid: false,
  })

  assert.equal(formPopulated, true)
})

test('registrar pago no altera incorrectamente la regla de edición', () => {
  const unpaidAppointment: RecepAgendaDayAppointment = {
    id: 'apt-unpaid',
    time: '14:00',
    endTime: '14:30',
    petName: 'Thor',
    breed: 'Husky',
    ownerName: 'Laura',
    professionalName: 'Dr. Perez',
    service: 'Consulta',
    status: 'AGENDADO',
    isPaid: false,
  }

  assert.equal(isRecepAppointmentEditable(unpaidAppointment.status), true)

  const paidAppointment: RecepAgendaDayAppointment = {
    ...unpaidAppointment,
    isPaid: true,
  }

  // Cita pagada pero aún en AGENDADO sigue siendo editable
  assert.equal(isRecepAppointmentEditable(paidAppointment.status), true)

  // Una vez marcada la llegada (EN ESPERA), aunque esté pagada ya no se puede editar
  const arrivedAppointment: RecepAgendaDayAppointment = {
    ...paidAppointment,
    status: 'EN ESPERA',
  }

  assert.equal(isRecepAppointmentEditable(arrivedAppointment.status), false)
})

test('las acciones de pago, signos vitales y no asistió mantienen sus reglas esperadas', () => {
  // AGENDADO
  assert.equal(canMarkRecepNoAsistio('AGENDADO'), true)
  assert.equal(canCheckIn('AGENDADO'), true)
  assert.equal(canTakeRecepVitals('AGENDADO'), true)

  // EN ESPERA
  assert.equal(canMarkRecepNoAsistio('EN ESPERA'), false)
  assert.equal(canCheckIn('EN ESPERA'), false)
  assert.equal(canTakeRecepVitals('EN ESPERA'), true)

  // EN CONSULTORIO
  assert.equal(canMarkRecepNoAsistio('EN CONSULTORIO'), false)
  assert.equal(canCheckIn('EN CONSULTORIO'), false)
  assert.equal(canTakeRecepVitals('EN CONSULTORIO'), true)

  // ATENDIDO
  assert.equal(canMarkRecepNoAsistio('ATENDIDO'), false)
  assert.equal(canCheckIn('ATENDIDO'), false)
  assert.equal(canTakeRecepVitals('ATENDIDO'), false)
})
