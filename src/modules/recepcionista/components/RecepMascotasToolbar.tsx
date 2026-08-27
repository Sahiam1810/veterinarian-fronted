import { PlusIcon, SearchIcon } from '@/global/components'
import { FilterLinesIcon } from './RecepMascotasIcons'

interface RecepMascotasToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  onOpenFilters?: () => void
  onNewPet?: () => void
}

// Barra superior: búsqueda + filtros + nueva mascota (sin título de página)
export function RecepMascotasToolbar({
  search,
  onSearchChange,
  onOpenFilters,
  onNewPet,
}: RecepMascotasToolbarProps) {
  return (
    <div className="w-full min-w-0 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
      <label className="relative flex-1 min-w-0">
        <span className="sr-only">Buscar mascota</span>
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar mascota, dueño..."
          className="w-full rounded-xl border border-border-tan bg-white pl-10 pr-3 py-2.5 sm:py-3 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition shadow-[0_2px_12px_rgba(35,78,70,0.03)]"
        />
      </label>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-border-tan bg-white px-3.5 py-2.5 sm:py-3 text-sm font-bold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer shadow-[0_2px_12px_rgba(35,78,70,0.03)]"
        >
          <FilterLinesIcon className="w-4 h-4" />
          <span>Filtros</span>
        </button>

        <button
          type="button"
          onClick={onNewPet}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-3.5 py-2.5 sm:py-3 text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-[0_2px_12px_rgba(35,78,70,0.12)]"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nueva Mascota</span>
        </button>
      </div>
    </div>
  )
}
