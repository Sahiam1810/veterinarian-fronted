import { SearchIcon, ReloadIcon } from '@/global/components'
import type { EscalationStatusFilter } from '../types'

interface RecepEscalacionesToolbarProps {
  search: string
  statusFilter: EscalationStatusFilter
  isRefreshing?: boolean
  totalPending?: number
  totalUrgent?: number
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: EscalationStatusFilter) => void
  onRefresh?: () => void
}

const FILTERS: { id: EscalationStatusFilter; label: string }[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'pendientes', label: 'Esperando Asesor' },
  { id: 'urgentes', label: 'Urgentes / Alta' },
  { id: 'en_atencion', label: 'En Atención' },
]

export function RecepEscalacionesToolbar({
  search,
  statusFilter,
  isRefreshing = false,
  totalPending,
  totalUrgent,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
}: RecepEscalacionesToolbarProps) {
  return (
    <div className="w-full min-w-0 flex flex-col gap-2.5 sm:gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.id
            let badgeCount: number | undefined
            if (filter.id === 'pendientes' && typeof totalPending === 'number') {
              badgeCount = totalPending
            } else if (filter.id === 'urgentes' && typeof totalUrgent === 'number') {
              badgeCount = totalUrgent
            }

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onStatusFilterChange(filter.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer border ${
                  active
                    ? 'bg-cream text-charcoal border-border-tan shadow-xs'
                    : 'bg-white text-sage border-border-tan hover:text-brand hover:border-brand/30'
                }`}
              >
                <span>{filter.label}</span>
                {typeof badgeCount === 'number' && badgeCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-extrabold ${
                      filter.id === 'urgentes'
                        ? 'bg-danger/15 text-danger'
                        : active
                        ? 'bg-brand text-white'
                        : 'bg-sage-soft text-brand'
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-border-tan text-brand hover:bg-sage-soft hover:border-brand/30 px-3.5 py-2 text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 disabled:opacity-50"
            title="Actualizar bandeja de escalamiento"
          >
            <ReloadIcon
              className={`w-4 h-4 text-brand ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Actualizando…' : 'Actualizar'}</span>
          </button>
        )}
      </div>

      <label className="relative w-full min-w-0">
        <span className="sr-only">Buscar en conversaciones escaladas</span>
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por cliente, teléfono, motivo o último mensaje..."
          className="w-full rounded-xl border border-border-tan bg-white pl-10 pr-3 py-2.5 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition shadow-[0_2px_12px_rgba(35,78,70,0.03)]"
        />
      </label>
    </div>
  )
}
