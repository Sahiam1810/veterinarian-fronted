import type { EstadoCita } from '../types'

// Acciones mutables del detalle de cita: solo AGENDADA (S27).
export function isCitaAgendada(status: EstadoCita): boolean {
  return status === 'AGENDADA'
}

export interface CitaDetalleFooterActions {
  showCancelar: boolean
  showReprogramar: boolean
  showMarcarAtendida: boolean
  showMarcarNoAsistio: boolean
}

export function getCitaDetalleFooterActions(status: EstadoCita): CitaDetalleFooterActions {
  const abierta = isCitaAgendada(status)
  return {
    showCancelar: abierta,
    showReprogramar: abierta,
    showMarcarAtendida: abierta,
    showMarcarNoAsistio: abierta,
  }
}
