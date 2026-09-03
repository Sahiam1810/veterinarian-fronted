// Estados alineados al catálogo canónico del backend (+ EN_ESPERA solo UI legacy)
export type EstadoCita =
  | 'AGENDADA'
  | 'EN_ESPERA'
  | 'ATENDIDA'
  | 'CANCELADA'
  | 'NO_ASISTIO'
  | 'BLOQUEO'

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
}

export interface AgendaServiceOption {
  id: string
  name: string
}
