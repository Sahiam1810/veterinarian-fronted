import type { ClienteAppointmentStatus } from './home.types'

export type ClienteCitaTab = 'proximas' | 'anteriores'

export interface ClienteCitaListItem {
  id: string
  dateLabel: string
  timeLabel: string
  petName: string
  petSpeciesBreed: string
  petPhotoUrl: string | null
  service: string
  professionalName: string
  status: ClienteAppointmentStatus
  statusLabel: string
}

export interface ClienteCitasPayload {
  items: ClienteCitaListItem[]
  totalCount: number
}
