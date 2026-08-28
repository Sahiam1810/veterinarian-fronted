import type { ClienteAppointmentStatus } from '../types'

// Teléfono de recepción para gestionar citas ya atendidas
export const CLIENTE_CLINIC_PHONE_TEL = '+576015550123'
export const CLIENTE_CLINIC_PHONE_LABEL = '(601) 555-0123'

// Solo citas pendientes pueden reprogramarse o cancelarse desde el portal
export function canClienteModifyAppointment(status: ClienteAppointmentStatus): boolean {
  return status === 'AGENDADO' || status === 'CONFIRMADO'
}
