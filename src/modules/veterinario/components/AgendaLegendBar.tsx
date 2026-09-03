import type { AgendaStatusFilter } from '../types'
import { FilterIcon } from './AgendaIcons'

interface AgendaLegendBarProps {
  statusFilters?: AgendaStatusFilter[]
  filtersOpen?: boolean
  onOpenFilters?: () => void
  onToggleStatusFilter?: (status: AgendaStatusFilter) => void
}

const LEGEND_ITEMS: { status: AgendaStatusFilter; label: string; swatchClass: string }[] = [
  { status: 'AGENDADA', label: 'Agendada', swatchClass: 'bg-brand' },
  {
    status: 'EN_ESPERA',
    label: 'En espera',
    swatchClass: 'bg-white border border-border-tan',
  },
  {
    status: 'ATENDIDA',
    label: 'Atendida',
    swatchClass: 'bg-terracotta-soft border border-terracotta/25',
  },
  {
    status: 'CANCELADA',
    label: 'Cancelada',
    swatchClass: 'bg-danger-soft border border-danger/25',
  },
  {
    status: 'NO_ASISTIO',
    label: 'No asistió',
    swatchClass: 'bg-bone border border-sage/30',
  },
]

// Leyenda de estados + filtros por estado (diseño existente).
export function AgendaLegendBar({
  statusFilters = LEGEND_ITEMS.map((item) => item.status),
  filtersOpen = false,
  onOpenFilters,
  onToggleStatusFilter,
}: AgendaLegendBarProps) {
  return (
    <div className="flex flex-col gap-2 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl border border-border-tan bg-white min-w-0">
      <div className="flex items-start sm:items-center justify-between gap-2 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-4 sm:gap-y-2 min-w-0 flex-1">
          {LEGEND_ITEMS.map((item) => (
            <LegendItem
              key={item.status}
              swatchClass={item.swatchClass}
              label={item.label}
              active={statusFilters.includes(item.status)}
              interactive={Boolean(onToggleStatusFilter)}
              onClick={() => onToggleStatusFilter?.(item.status)}
            />
          ))}
          <LegendItem
            swatchClass="bg-transparent border border-dashed border-text-placeholder"
            label="No disponible"
            active
          />
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          aria-pressed={filtersOpen}
          className={`inline-flex items-center gap-1.5 sm:gap-2 shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold transition cursor-pointer ${
            filtersOpen
              ? 'border-brand/40 bg-brand/5 text-brand'
              : 'border-border-tan bg-bone/60 text-charcoal hover:border-brand/30 hover:text-brand'
          }`}
        >
          <FilterIcon className="w-4 h-4 text-sage" />
          <span>Filtros</span>
        </button>
      </div>

      {filtersOpen ? (
        <p className="text-[11px] sm:text-xs text-sage leading-snug">
          Pulsa un estado de la leyenda para mostrarlo u ocultarlo en el calendario.
        </p>
      ) : null}
    </div>
  )
}

function LegendItem({
  swatchClass,
  label,
  active = true,
  interactive = false,
  onClick,
}: {
  swatchClass: string
  label: string
  active?: boolean
  interactive?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      <span className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm shrink-0 ${swatchClass}`} aria-hidden="true" />
      <span className="text-[11px] sm:text-sm font-medium text-charcoal/80 whitespace-nowrap">{label}</span>
    </>
  )

  if (!interactive) {
    return <div className={`inline-flex items-center gap-1.5 sm:gap-2 ${active ? '' : 'opacity-35'}`}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-lg px-1 py-0.5 sm:px-1.5 sm:py-1 transition cursor-pointer ${
        active ? 'opacity-100' : 'opacity-35 line-through'
      }`}
      aria-pressed={active}
    >
      {content}
    </button>
  )
}
