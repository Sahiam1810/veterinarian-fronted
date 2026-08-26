import { FilterIcon } from './AgendaIcons'

interface AgendaLegendBarProps {
  onOpenFilters?: () => void
}

// Leyenda de estados + botón de filtros
export function AgendaLegendBar({ onOpenFilters }: AgendaLegendBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-border-tan bg-white">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <LegendItem swatchClass="bg-brand" label="Agendada" />
        <LegendItem
          swatchClass="bg-white border border-border-tan"
          label="En Espera"
        />
        <LegendItem swatchClass="bg-terracotta-soft border border-terracotta/25" label="Atendida" />
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl border border-border-tan bg-bone/60 text-sm font-bold text-charcoal hover:border-brand/30 hover:text-brand transition cursor-pointer"
      >
        <FilterIcon className="w-4 h-4 text-sage" />
        <span>Filtros</span>
      </button>
    </div>
  )
}

function LegendItem({ swatchClass, label }: { swatchClass: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={`w-3.5 h-3.5 rounded-sm shrink-0 ${swatchClass}`} aria-hidden="true" />
      <span className="text-xs sm:text-sm font-medium text-charcoal/80">{label}</span>
    </div>
  )
}
