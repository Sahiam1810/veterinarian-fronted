// Tipos del punto de inicio del veterinario (contrato futuro con la API)

// Estados de cita alineados a la agenda del día
export type VetAppointmentStatus = 'ATENDIDO' | 'EN ESPERA' | 'AGENDADO'

// Resumen numérico de la jornada del veterinario
export interface VetHomeStats {
  citasHoy: number
  pendientes: number
  atendidas: number
}

// Perfil mostrado en el saludo de la vista
export interface VetHomeProfile {
  displayName: string
  titlePrefix?: string
}

// Fila de la agenda del día; lista para mapear respuesta del endpoint
export interface VetDayAppointment {
  id: string
  time: string
  petName: string
  petPhotoUrl?: string | null
  speciesBreed: string
  ownerName: string
  service: string
  status: VetAppointmentStatus
  // Marca la cita activa / siguiente a atender
  isHighlighted?: boolean
}

// Payload completo del dashboard de inicio
export interface VetHomeDashboard {
  profile: VetHomeProfile
  formattedDate: string
  stats: VetHomeStats
  appointments: VetDayAppointment[]
  // Total del día (puede ser mayor que appointments.length si hay paginación)
  totalAppointmentsToday: number
}
