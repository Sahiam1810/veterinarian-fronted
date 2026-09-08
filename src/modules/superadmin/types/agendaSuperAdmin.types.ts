// Estados alineados al catálogo canónico del backend (+ EN_ESPERA solo UI legacy)
export type EstadoCita =
  | 'AGENDADA'
  | 'EN_ESPERA'
  | 'ATENDIDA'
  | 'CANCELADA'
  | 'NO_ASISTIO'
  | 'BLOQUEO'

export const CONSULTORIOS_DISPONIBLES = [
  'Consultorio 1',
  'Consultorio 2',
  'Consultorio 3',
  'Consultorio 4',
  'Quirófano',
] as const

export type ConsultorioNombre = typeof CONSULTORIOS_DISPONIBLES[number]

// Rango de horario permitido: 07:00 a 17:00 (7 AM a 5 PM)
export const HORARIO_APERTURA = '07:00'
export const HORARIO_CIERRE = '17:00'

export interface CitaSuperAdmin {
  id: string
  dateKey: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: EstadoCita
  petName?: string
  petBreed?: string
  species?: string
  ownerName?: string
  professionalId?: string
  professionalName?: string
  service?: string
  consultorio?: string
  notes?: string
  blockLabel?: string
  // IDs internos para sincronizar con la API
  clientPetId?: string
  serviceId?: string
  statusId?: string
  availabilityId?: string
}

export interface CitaFormData {
  clientPetId: string
  petName: string
  petBreed: string
  species: string
  ownerName: string
  dateKey: string
  startTime: string
  endTime: string
  professionalId: string
  serviceId: string
  service: string
  consultorio: string
  notes: string
  status: EstadoCita
}

export interface AgendaPetOption {
  clientPetId: string
  petId: string
  petName: string
  breed: string
  species: string
  ownerName: string
  clientId: string
  // Telefono del dueño para create de cita (RequesterPhoneNumber).
  ownerPhone?: string
}

export interface AgendaServiceOption {
  id: string
  name: string
}
