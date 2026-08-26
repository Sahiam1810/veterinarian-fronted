import type { VetAppointmentStatus } from '../types'

interface AppointmentStatusBadgeProps {
  status: VetAppointmentStatus
}

// Badge de estado con tokens globales (sin colores nuevos)
export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const styles: Record<VetAppointmentStatus, string> = {
    ATENDIDO: 'bg-terracotta-soft text-terracotta border border-terracotta/20',
    'EN ESPERA': 'bg-white text-charcoal/70 border border-border-tan',
    AGENDADO: 'bg-brand text-white border border-brand',
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-wide uppercase whitespace-nowrap ${styles[status]}`}
    >
      {status}
    </span>
  )
}
