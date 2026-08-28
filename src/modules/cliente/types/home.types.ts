export type ClienteAppointmentStatus = 'AGENDADO' | 'CONFIRMADO' | 'ATENDIDO' | 'CANCELADO'

export interface ClienteHomeProfile {
  displayName: string
}

export interface ClienteHomeStats {
  misMascotas: number
  citasPendientes: number
}

// Cita destacada en el panel de inicio
export interface ClienteNextAppointment {
  id: string
  service: string
  petName: string
  dateTimeLabel: string
  professionalName: string
  locationLabel: string
  status: ClienteAppointmentStatus
  statusLabel: string
}

export interface ClienteUpcomingAppointment {
  id: string
  dateLabel: string
  time: string
  petName: string
  speciesBreed: string
  service: string
  professionalName: string
  status: ClienteAppointmentStatus
}

export type ClienteQuickActionId = 'agendar-cita' | 'ver-mascotas' | 'contactar-clinica'

export interface ClienteHomeDashboard {
  profile: ClienteHomeProfile
  summarySubtitle: string
  stats: ClienteHomeStats
  nextAppointment: ClienteNextAppointment | null
}
