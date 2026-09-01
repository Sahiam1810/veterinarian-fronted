import { CheckCircleIcon } from '@/global/components'
import type { AgendaCalendarEvent, AgendaEventStatus } from '../types'
import { ClipboardIcon, HourglassIcon } from './AgendaIcons'

interface AgendaEventCardProps {
  event: AgendaCalendarEvent
  topPercent: number
  heightPercent: number
  onSelect?: (event: AgendaCalendarEvent) => void
  // En vista semana/mes oculta texto secundario para no desbordar.
  compact?: boolean
}

// Estilos por estado usando solo tokens globales del diseño actual.
const STATUS_STYLES: Record<
  Exclude<AgendaEventStatus, 'BLOQUEO'>,
  { card: string; time: string; title: string; service: string; icon: string }
> = {
  AGENDADA: {
    card: 'bg-white border border-brand/25 border-l-[3px] border-l-brand shadow-sm',
    time: 'text-brand',
    title: 'text-brand',
    service: 'text-sage',
    icon: 'text-brand',
  },
  EN_ESPERA: {
    card: 'bg-bone border border-border-tan shadow-sm',
    time: 'text-charcoal/70',
    title: 'text-charcoal',
    service: 'text-sage',
    icon: 'text-sage',
  },
  ATENDIDA: {
    card: 'bg-terracotta-soft border border-terracotta/30 shadow-sm',
    time: 'text-terracotta',
    title: 'text-charcoal',
    service: 'text-terracotta/90',
    icon: 'text-terracotta',
  },
  CANCELADA: {
    card: 'bg-danger-soft border border-danger/25 shadow-sm opacity-90',
    time: 'text-danger',
    title: 'text-danger',
    service: 'text-danger/80',
    icon: 'text-danger',
  },
  NO_ASISTIO: {
    card: 'bg-bone border border-sage/35 border-dashed shadow-sm',
    time: 'text-sage',
    title: 'text-charcoal/80',
    service: 'text-sage',
    icon: 'text-sage',
  },
}

// Tarjeta de cita o bloqueo (posición en % para adaptar sin scroll)
export function AgendaEventCard({
  event,
  topPercent,
  heightPercent,
  onSelect,
  compact = false,
}: AgendaEventCardProps) {
  if (event.status === 'BLOQUEO') {
    return (
      <div
        className="absolute left-0.5 right-0.5 flex items-center justify-center pointer-events-none overflow-hidden bg-bone/40"
        style={{ top: `${topPercent}%`, height: `${Math.max(heightPercent, 3)}%` }}
      >
        <span className="text-[9px] sm:text-[10px] italic text-text-placeholder font-medium text-center px-0.5 truncate">
          {compact ? (event.blockLabel ?? '—') : (event.blockLabel ?? 'Bloqueo')}
        </span>
      </div>
    )
  }

  const styles = STATUS_STYLES[event.status]

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      className={`absolute left-0.5 right-0.5 rounded-md sm:rounded-lg px-1 sm:px-1.5 py-0.5 sm:py-1 text-left overflow-hidden cursor-pointer transition hover:brightness-[0.98] z-10 ${styles.card}`}
      style={{ top: `${topPercent}%`, height: `${Math.max(heightPercent, 4)}%` }}
      title={`${event.petName} · ${event.service}`}
    >
      <div className="flex items-start justify-between gap-0.5 min-w-0">
        <span className={`text-[8px] sm:text-[10px] font-bold leading-tight truncate ${styles.time}`}>
          {compact ? event.startTime : `${event.startTime} - ${event.endTime}`}
        </span>
        <StatusGlyph status={event.status} className={styles.icon} />
      </div>
      <p className={`text-[9px] sm:text-[11px] font-bold leading-tight mt-0.5 truncate ${styles.title}`}>
        {event.petName}
        {!compact && event.species ? ` (${event.species})` : ''}
      </p>
      {!compact && event.service ? (
        <p className={`text-[8px] sm:text-[10px] leading-tight mt-0.5 truncate ${styles.service}`}>
          {event.service}
        </p>
      ) : null}
    </button>
  )
}

function StatusGlyph({
  status,
  className,
}: {
  status: Exclude<AgendaEventStatus, 'BLOQUEO'>
  className: string
}) {
  if (status === 'ATENDIDA') {
    return <CheckCircleIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${className}`} />
  }
  if (status === 'EN_ESPERA') {
    return <HourglassIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${className}`} />
  }
  if (status === 'CANCELADA' || status === 'NO_ASISTIO') {
    return (
      <span className={`text-[9px] font-extrabold leading-none shrink-0 ${className}`} aria-hidden>
        ×
      </span>
    )
  }
  return <ClipboardIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${className}`} />
}
