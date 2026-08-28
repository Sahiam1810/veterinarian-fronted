import type { ClienteAppointmentStatus } from './home.types'

export type ClienteMascotaEstado = 'ACTIVO' | 'INACTIVO'

export interface ClienteMascotaHistoryRow {
  id: string
  dateLabel: string
  diagnosis: string
  symptoms: string
  treatment: string
}

export interface ClienteMascotaUpcomingAppointment {
  service: string
  dateLabel: string
  timeLabel: string
  status: ClienteAppointmentStatus
}

export interface ClienteMascotaDetail {
  id: string
  name: string
  species: string
  breed: string
  ageLabel: string
  weightLabel: string
  sexLabel: string
  status: ClienteMascotaEstado
  photoUrl: string | null
  lastDewormingLabel: string
  dewormingStatusLabel: string
  observations: string
  recentHistory: ClienteMascotaHistoryRow[]
  upcomingAppointment: ClienteMascotaUpcomingAppointment | null
}

export interface ClienteMascotasPayload {
  pets: ClienteMascotaDetail[]
  totalCount: number
}
