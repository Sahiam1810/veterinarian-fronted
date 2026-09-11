import type { RecepAppointmentStatus } from './home.types'

// Tipos del formulario de agendar cita (recepción)

export interface RecepAgendaOwnerOption {
  id: string
  name: string
  documentLabel: string
  phone?: string
  identificationNumber?: string
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
  status: RecepAppointmentStatus
}

// Indica si la cita aún se puede editar (no finalizada ni cancelada)
export function isRecepAppointmentEditable(
  status: RecepAgendaDayAppointment['status'],
): boolean {
  return status === 'AGENDADO' || status === 'EN CONSULTORIO'
}

// Solo AGENDADO puede marcarse No Asistió (mismo criterio que SuperAdmin).
export function canMarkRecepNoAsistio(
  status: RecepAgendaDayAppointment['status'],
): boolean {
  return status === 'AGENDADO'
}

// Mapea el nombre canónico del backend al estado de la agenda de recepción.
export function mapRecepAgendaStatus(
  rawStatus?: string | null,
): RecepAgendaDayAppointment['status'] {
  if (!rawStatus) return 'AGENDADO'
  const normalized = rawStatus.trim().toUpperCase()
  if (normalized.includes('NO_ASIST') || normalized.includes('NO ASIST')) {
    return 'NO ASISTIÓ'
  }
  if (normalized.includes('CONSULT') || normalized.includes('CURSO') || normalized.includes('PROCES')) {
    return 'EN CONSULTORIO'
  }
  if (normalized.includes('ATEND') || normalized.includes('COMPLET') || normalized.includes('FINALIZ')) {
    return 'ATENDIDO'
  }
  if (normalized.includes('CANCEL') || normalized.includes('ANUL')) {
    return 'CANCELADO'
  }
  return 'AGENDADO'
}
