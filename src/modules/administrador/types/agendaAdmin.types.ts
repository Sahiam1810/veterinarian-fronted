export type EstadoCita = 'AGENDADA' | 'EN_ESPERA' | 'ATENDIDA' | 'BLOQUEO'

export interface CitaAdmin {
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
}

export interface CitaFormData {
  petName: string
  petBreed: string
  species: string
  ownerName: string
  dateKey: string
  startTime: string
  endTime: string
  professionalId: string
  service: string
  notes: string
  status: EstadoCita
}
