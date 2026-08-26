// Tipos de la agenda médica del veterinario (contrato futuro con la API)

export type AgendaViewMode = 'dia' | 'semana' | 'mes'

export type AgendaEventStatus = 'AGENDADA' | 'EN_ESPERA' | 'ATENDIDA' | 'BLOQUEO'

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
  // Texto libre para bloqueos (ej. almuerzo)
  blockLabel?: string
}

export interface AgendaWeekPayload {
  monthLabel: string
  viewMode: AgendaViewMode
  days: AgendaDayColumn[]
  // Hora actual simulada para la línea roja (HH:mm)
  currentTime: string
  currentDateKey: string
  hourStart: number
  hourEnd: number
  events: AgendaCalendarEvent[]
}
