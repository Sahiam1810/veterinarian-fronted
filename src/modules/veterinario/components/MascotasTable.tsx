import { PawIcon } from '@/global/components'
import type { MascotaListItem } from '../types'
import { EyeIcon } from './VetHomeIcons'

interface MascotasTableProps {
  items: MascotaListItem[]
  selectedId: string | null
  pageStart: number
  pageEnd: number
  totalCount: number
  onSelect: (petId: string) => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

// Tabla de pacientes; la selección abre el panel derecho
export function MascotasTable({
  items,
  selectedId,
  pageStart,
  pageEnd,
  totalCount,
  onSelect,
  onPrevPage,
  onNextPage,
}: MascotasTableProps) {
  return (
    <section className="flex-1 min-w-0 min-h-0 flex flex-col rounded-2xl border border-border-tan bg-white overflow-hidden shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-bone/90 backdrop-blur-xs">
            <tr className="border-b border-border-tan text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-sage">
              <th className="py-3 px-3 sm:px-4 w-[22%]">Paciente</th>
              <th className="py-3 px-2 sm:px-3 w-[20%]">Especie/Raza</th>
              <th className="py-3 px-2 sm:px-3 w-[16%] hidden md:table-cell">Edad/Sexo</th>
              <th className="py-3 px-2 sm:px-3 w-[16%] hidden lg:table-cell">Dueño</th>
              <th className="py-3 px-2 sm:px-3 w-[14%] hidden sm:table-cell">Última Atención</th>
              <th className="py-3 px-3 sm:px-4 w-[12%] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((pet) => {
              const selected = selectedId === pet.id
              return (
                <tr
                  key={pet.id}
                  onClick={() => onSelect(pet.id)}
                  className={`border-b border-border-tan/60 last:border-b-0 cursor-pointer transition-colors ${
                    selected ? 'bg-cream/80' : 'hover:bg-bone/70'
                  }`}
                >
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PetAvatar name={pet.name} photoUrl={pet.photoUrl} />
                      <span className="font-bold text-brand text-sm truncate">{pet.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 sm:px-3 text-sm text-charcoal/80 font-medium truncate">
                    <span className="block truncate">
                      {pet.species} / {pet.breed}
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-3 text-sm text-charcoal/80 font-medium hidden md:table-cell truncate">
                    {pet.ageLabel} / {pet.sexLabel}
                  </td>
                  <td className="py-3 px-2 sm:px-3 text-sm text-charcoal/80 font-medium hidden lg:table-cell truncate">
                    {pet.ownerName}
                  </td>
                  <td className="py-3 px-2 sm:px-3 text-sm text-charcoal/80 font-medium hidden sm:table-cell whitespace-nowrap">
                    {pet.lastVisitLabel}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelect(pet.id)
                      }}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer ${
                        selected
                          ? 'bg-brand text-white'
                          : 'bg-bone text-sage border border-border-tan hover:text-brand hover:border-brand/30'
                      }`}
                      aria-label={`Ver detalle de ${pet.name}`}
                      title="Ver detalle"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <footer className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-border-tan bg-white">
        <p className="text-xs sm:text-sm text-sage font-medium truncate">
          Mostrando {pageStart}-{pageEnd} de {totalCount} pacientes
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onPrevPage}
            className="px-2.5 h-8 rounded-lg border border-border-tan text-xs font-semibold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
            aria-label="Página anterior"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={onNextPage}
            className="px-2.5 h-8 rounded-lg border border-border-tan text-xs font-semibold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      </footer>
    </section>
  )
}

function PetAvatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-9 h-9 rounded-full object-cover border border-border-tan shrink-0"
      />
    )
  }

  return (
    <div className="w-9 h-9 rounded-full bg-cream text-sage flex items-center justify-center border border-border-tan shrink-0">
      <PawIcon className="w-3.5 h-3.5" />
    </div>
  )
}
