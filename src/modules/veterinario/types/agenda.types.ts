// Tipos de la agenda médica del veterinario.

export type AgendaViewMode = 'dia' | 'semana' | 'mes'

// Estados de cita del plan + espera (diseño) y bloqueo de disponibilidad.
export type AgendaEventStatus =
  | 'AGENDADA'
  | 'EN_ESPERA'
  | 'ATENDIDA'
  | 'CANCELADA'
  | 'NO_ASISTIO'
  | 'BLOQUEO'

export interface AgendaDayColumn {
  dateKey: string
  weekdayLabel: string
  dayNumber: number
  isToday?: boolean
}

export interface AgendaCalendarEvent {
  id: string
  dateKey: string
  startTime: string
  endTime: string
  status: AgendaEventStatus
  petName?: string
  species?: string
  service?: string
  // Texto libre para bloqueos (fuera de horario / sin disponibilidad)
  blockLabel?: string
}

export interface AgendaWeekPayload {
  monthLabel: string
  viewMode: AgendaViewMode
  days: AgendaDayColumn[]
  // Hora actual para la línea roja (HH:mm)
  currentTime: string
  currentDateKey: string
  hourStart: number
  hourEnd: number
  events: AgendaCalendarEvent[]
}

// Filtro de estados visibles (solo citas; los bloqueos siempre se muestran).
export type AgendaStatusFilter = Exclude<AgendaEventStatus, 'BLOQUEO'>
