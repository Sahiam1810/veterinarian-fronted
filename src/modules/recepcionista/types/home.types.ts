export type RecepAppointmentStatus =
  | 'EN CONSULTORIO'
  | 'AGENDADO'
  | 'ATENDIDO'
  | 'CANCELADO'

export interface RecepHomeProfile {
  displayName: string
  workstationLabel: string
}

export interface RecepHomeStats {
  citasDelDia: number
  pendientes: number
  mascotasAtendidas: number
  canceladas: number
}

export interface RecepDayAppointment {
  id: string
  time: string
  petName: string
  petPhotoUrl?: string | null
  speciesBreed: string
  ownerName: string
  professionalName: string
  service: string
  status: RecepAppointmentStatus
}

export interface RecepHomeDashboard {
  profile: RecepHomeProfile
  formattedDate: string
  stats: RecepHomeStats
  appointments: RecepDayAppointment[]
  totalAppointmentsToday: number
}

export type RecepQuickActionId = 'agendar-cita' | 'registrar-dueno' | 'registrar-mascota'
