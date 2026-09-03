import type { AgendaEventStatus } from '../types'

// Mapea el nombre de estado del backend a los estados de la agenda.
export function mapAgendaEventStatus(statusName?: string | null): AgendaEventStatus {
  const name = (statusName || '').trim().toLowerCase()

  if (/cancel/.test(name)) return 'CANCELADA'
  if (/no\s*asist|ausent|missed|no[\s-]?show/.test(name)) return 'NO_ASISTIO'
  if (/complet|atendid|finaliz|cerrad|done|realiz/.test(name)) return 'ATENDIDA'
  if (/espera|progreso|curso|confirm|llegad|presente|check.?in/.test(name)) {
    return 'EN_ESPERA'
  }

  return 'AGENDADA'
}
