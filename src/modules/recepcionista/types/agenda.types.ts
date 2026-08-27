// Tipos del formulario de agendar cita (recepción)

export interface RecepAgendaOwnerOption {
  id: string
  name: string
  documentLabel: string
}

export interface RecepAgendaPetOption {
  id: string
  ownerId: string
  name: string
  breed: string
}

export interface RecepAgendaServiceOption {
  id: string
  label: string
}

export interface RecepAgendaProfessionalOption {
  id: string
  name: string
  roleLabel: string
}

export interface RecepAgendaTimeSlot {
  id: string
  label: string
  displayLabel: string
  available: boolean
}

export interface RecepAgendaCatalogPayload {
  owners: RecepAgendaOwnerOption[]
  pets: RecepAgendaPetOption[]
  services: RecepAgendaServiceOption[]
  professionals: RecepAgendaProfessionalOption[]
  timeSlots: RecepAgendaTimeSlot[]
}

export interface RecepAgendaFormState {
  ownerQuery: string
  ownerId: string
  petId: string
  serviceId: string
  professionalId: string
  dateValue: string
  timeSlotId: string
  notes: string
}

// Cita registrada en el día (vista flotante del calendario)
export interface RecepAgendaDayAppointment {
  id: string
  time: string
  endTime: string
  petName: string
  breed: string
  ownerName: string
  ownerPhone?: string
  professionalName: string
  service: string
  notes?: string
  status: 'AGENDADO' | 'EN CONSULTORIO' | 'ATENDIDO' | 'CANCELADO'
}

// Indica si la cita aún se puede editar (no finalizada ni cancelada)
export function isRecepAppointmentEditable(
  status: RecepAgendaDayAppointment['status'],
): boolean {
  return status === 'AGENDADO' || status === 'EN CONSULTORIO'
}
