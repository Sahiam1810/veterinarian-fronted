import type { AgendaViewMode } from '../types'
import { ChevronLeftIcon, ChevronRightIcon } from './AgendaIcons'

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="inline-flex items-center gap-1 rounded-xl border border-border-tan bg-white px-1.5 py-1 shadow-sm self-start">
        <button
          type="button"
          onClick={onPrevPeriod}
          className="p-2 rounded-lg text-sage hover:text-brand hover:bg-bone transition cursor-pointer"
          aria-label="Periodo anterior"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className="min-w-[8.5rem] text-center text-sm font-bold text-charcoal px-1">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={onNextPeriod}
          className="p-2 rounded-lg text-sage hover:text-brand hover:bg-bone transition cursor-pointer"
          aria-label="Periodo siguiente"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          onClick={onGoToday}
          className="px-3.5 py-2 rounded-xl border border-border-tan bg-white text-sm font-bold text-charcoal hover:border-brand/30 hover:text-brand transition cursor-pointer shadow-sm"
        >
          Hoy
        </button>

        <div className="inline-flex items-center rounded-xl border border-border-tan bg-white p-1 shadow-sm">
          {modes.map((mode) => {
            const active = viewMode === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeView?.(mode)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
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
