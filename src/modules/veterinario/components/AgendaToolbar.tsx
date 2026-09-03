import type { AgendaViewMode } from '../types'

interface AgendaToolbarProps {
  monthLabel: string
  viewMode: AgendaViewMode
  onPrevPeriod?: () => void
  onNextPeriod?: () => void
  onGoToday?: () => void
  onChangeView?: (mode: AgendaViewMode) => void
}

// Controles de periodo y vista (sin título grande)
export function AgendaToolbar({
  monthLabel,
  viewMode,
  onPrevPeriod,
  onNextPeriod,
  onGoToday,
  onChangeView,
}: AgendaToolbarProps) {
  const modes: AgendaViewMode[] = ['dia', 'semana', 'mes']
  const modeLabels: Record<AgendaViewMode, string> = {
    dia: 'Día',
    semana: 'Semana',
    mes: 'Mes',
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 min-w-0">
      <div className="inline-flex items-center gap-0.5 sm:gap-1 rounded-xl border border-border-tan bg-white px-1 sm:px-1.5 py-0.5 sm:py-1 shadow-sm min-w-0 max-w-full">
        <button
          type="button"
          onClick={onPrevPeriod}

          className="p-1.5 sm:p-2 rounded-lg text-sage hover:text-brand hover:bg-bone transition cursor-pointer shrink-0"

          aria-label="Periodo anterior"
        >
          Anterior
        </button>
        <span className="min-w-0 max-w-[9.5rem] sm:min-w-[8.5rem] sm:max-w-none text-center text-xs sm:text-sm font-bold text-charcoal px-1 truncate">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={onNextPeriod}

          className="p-1.5 sm:p-2 rounded-lg text-sage hover:text-brand hover:bg-bone transition cursor-pointer shrink-0"

          aria-label="Periodo siguiente"
        >
          Siguiente
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onGoToday}
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm font-bold text-charcoal hover:border-brand/30 hover:text-brand transition cursor-pointer shadow-sm"
        >
          Hoy
        </button>

        <div className="inline-flex items-center rounded-xl border border-border-tan bg-white p-0.5 sm:p-1 shadow-sm">
          {modes.map((mode) => {
            const active = viewMode === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeView?.(mode)}
                className={`px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-sm font-bold transition cursor-pointer ${
                  active
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-charcoal/80 hover:bg-bone hover:text-brand'
                }`}
              >
                {modeLabels[mode]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
