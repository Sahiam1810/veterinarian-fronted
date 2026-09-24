import type { ApiHospitalizationStay } from '../types/hospitalizacion.types'

export function isStayActive(stay: ApiHospitalizationStay | null | undefined): boolean {
  if (!stay) return false
  return stay.status === 'Activa' && !stay.dischargedAt
}
