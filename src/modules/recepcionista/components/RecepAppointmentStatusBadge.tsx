import type { RecepAppointmentStatus } from '../types'

interface RecepAppointmentStatusBadgeProps {
  status: RecepAppointmentStatus
}

export function RecepAppointmentStatusBadge({
  status,
}: RecepAppointmentStatusBadgeProps) {
  const styles: Record<RecepAppointmentStatus, string> = {
    'EN CONSULTORIO': 'bg-sage/15 text-brand border border-brand/15',
    AGENDADO: 'bg-brand/10 text-brand border border-brand/20',
    ATENDIDO: 'bg-terracotta-soft text-terracotta border border-terracotta/20',
    CANCELADO: 'bg-terracotta-soft/80 text-terracotta border border-terracotta/25',
  }

  const labels: Record<RecepAppointmentStatus, string> = {
    'EN CONSULTORIO': 'En consultorio',
    AGENDADO: 'Agendado',
    ATENDIDO: 'Atendido',
    CANCELADO: 'Cancelado',
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide whitespace-nowrap ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
