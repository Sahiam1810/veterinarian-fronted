import { FilterIcon } from './AgendaIcons'
import { ChevronDownIcon, SearchIcon } from './MascotasIcons'

interface MascotasToolbarProps {
  search: string
  speciesFilter: string
  speciesOptions: string[]
  onSearchChange: (value: string) => void
  onSpeciesChange: (value: string) => void
  onOpenFilters?: () => void
}

// Barra de búsqueda a ancho completo + filtros compactos a la derecha
export function MascotasToolbar({
  search,
  speciesFilter,
  speciesOptions,
  onSearchChange,
  onSpeciesChange,
  onOpenFilters,
}: MascotasToolbarProps) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-border-tan bg-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-[0_2px_12px_rgba(35,78,70,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 min-w-0">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Buscar mascota</span>
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre o dueño..."
            className="w-full rounded-xl border border-border-tan bg-bone/40 pl-9 pr-3 py-2.5 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:bg-white transition"
          />
        </label>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-0">
            <select
              value={speciesFilter}
              onChange={(event) => onSpeciesChange(event.target.value)}
              className="w-full sm:w-[11.5rem] appearance-none rounded-xl border border-border-tan bg-bone/40 pl-3 pr-9 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white cursor-pointer transition"
              aria-label="Filtrar por especie"
            >
              <option value="">Todas las Especies</option>
              {speciesOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border-tan bg-bone/40 text-sage hover:text-brand hover:border-brand/30 hover:bg-white transition cursor-pointer shrink-0"
            aria-label="Más filtros"
            title="Filtros"
          >
            <FilterIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
