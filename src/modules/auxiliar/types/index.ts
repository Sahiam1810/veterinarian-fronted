export type AuxAppointmentStatus = 'Pendiente' | 'Preparada' | 'En Espera' | 'Atendida'

export interface AuxStatSummary {
  citasDelDia: number
  pendientesPrep: number
  proximas: number
  preparadas: number
}

export interface AuxDayAppointment {
  id: string
  time: string
  petName: string
  petInitial?: string
  avatarColor?: 'peach' | 'brand' | 'sage' | 'terracotta'
  speciesBreed: string
  service: string
  professional: string
  status: AuxAppointmentStatus
  ownerName?: string
  notes?: string
}

export interface AuxHomeDashboard {
  greeting: string
  formattedDate: string
  stats: AuxStatSummary
  appointments: AuxDayAppointment[]
}
