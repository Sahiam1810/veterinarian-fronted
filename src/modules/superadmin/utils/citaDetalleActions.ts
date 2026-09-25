import type { EstadoCita } from '../types'

// Acciones mutables del detalle de cita: AGENDADA y EN_ESPERA (confirmada).
export function isCitaAbierta(status: EstadoCita): boolean {
  return status === 'AGENDADA' || status === 'EN_ESPERA'
}

export function isCitaAgendada(status: EstadoCita): boolean {
  return status === 'AGENDADA'
}

export interface CitaDetalleFooterActions {
  showMarcarLlegada: boolean
  showCancelar: boolean
  showReprogramar: boolean
  showMarcarAtendida: boolean
  showMarcarNoAsistio: boolean
}

export function getCitaDetalleFooterActions(status: EstadoCita): CitaDetalleFooterActions {
  const agendada = isCitaAgendada(status)
  const abierta = isCitaAbierta(status)
  return {
    showMarcarLlegada: agendada,
    showCancelar: abierta,
    showReprogramar: abierta,
    showMarcarAtendida: abierta,
    showMarcarNoAsistio: abierta,
  }
}
