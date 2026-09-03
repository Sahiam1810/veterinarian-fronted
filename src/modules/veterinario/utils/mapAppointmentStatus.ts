import type { VetAppointmentStatus } from '../types'

// Mapea el nombre de estado del backend a las etiquetas de la UI.
export function mapAppointmentStatus(statusName?: string | null): VetAppointmentStatus {
  const name = (statusName || '').trim().toLowerCase()

  if (/complet|atendid|finaliz|cerrad|done|realiz/.test(name)) {
    return 'ATENDIDO'
  }

  if (/espera|progreso|curso|confirm|llegad|presente|check.?in/.test(name)) {
    return 'EN ESPERA'
  }

  return 'AGENDADO'
}

export function isAttendedStatus(status: VetAppointmentStatus): boolean {
  return status === 'ATENDIDO'
}

export function isPendingStatus(status: VetAppointmentStatus): boolean {
  return status === 'EN ESPERA' || status === 'AGENDADO'
}
