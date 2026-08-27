import { PlusIcon, SearchIcon } from '@/global/components'
import type { RecepDuenoStatusFilter } from '../types'

interface RecepDuenosToolbarProps {
  search: string
  statusFilter: RecepDuenoStatusFilter
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: RecepDuenoStatusFilter) => void
  onNewOwner?: () => void
}

const FILTERS: { id: RecepDuenoStatusFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'inactivos', label: 'Inactivos' },
]

// Filtros de estado + búsqueda + CTA nuevo dueño
export function RecepDuenosToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onNewOwner,
}: RecepDuenosToolbarProps) {
  return (
    <div className="w-full min-w-0 flex flex-col gap-2.5 sm:gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onStatusFilterChange(filter.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer border ${
                  active
                    ? 'bg-cream text-charcoal border-border-tan'
                    : 'bg-white text-sage border-border-tan hover:text-brand hover:border-brand/30'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onNewOwner}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-3.5 py-2.5 text-sm font-bold hover:bg-brand-hover transition cursor-pointer shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nuevo Dueño</span>
        </button>
      </div>

      <label className="relative w-full min-w-0">
        <span className="sr-only">Buscar dueño</span>
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, documento, correo o teléfono..."
          className="w-full rounded-xl border border-border-tan bg-white pl-10 pr-3 py-2.5 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition shadow-[0_2px_12px_rgba(35,78,70,0.03)]"
        />
      </label>
    </div>
  )
}
