import { PawIcon } from '@/global/components'
import type { RecepMascotaEstado, RecepMascotaListItem } from '../types'

interface RecepMascotasTableProps {
  items: RecepMascotaListItem[]
  selectedId: string | null
  pageStart: number
  pageEnd: number
  totalCount: number
  onSelect: (petId: string) => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

// Tabla de mascotas; al hacer clic en una fila se abre el panel de detalle
export function RecepMascotasTable({
  items,
  selectedId,
  pageStart,
  pageEnd,
  totalCount,
  onSelect,
  onPrevPage,
  onNextPage,
}: RecepMascotasTableProps) {
  return (
    <section className="flex-1 min-w-0 min-h-0 flex flex-col rounded-2xl border border-border-tan bg-white overflow-hidden shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-sage-soft/80 backdrop-blur-xs">
            <tr className="border-b border-border-tan text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-sage">
              <th className="py-3.5 px-3 sm:px-5 w-[28%]">Nombre</th>
              <th className="py-3.5 px-2 sm:px-4 w-[20%]">Especie/Raza</th>
              <th className="py-3.5 px-2 sm:px-4 w-[20%] hidden md:table-cell">Dueño</th>
              <th className="py-3.5 px-2 sm:px-4 w-[16%] hidden sm:table-cell">Última Cita</th>
              <th className="py-3.5 px-3 sm:px-5 w-[16%]">Estado</th>
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
                  <td className="py-4 px-3 sm:px-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <PetAvatar name={pet.name} photoUrl={pet.photoUrl} />
                      <div className="min-w-0">
                        <p className="font-bold text-charcoal text-sm truncate">{pet.name}</p>
                        <p className="text-xs text-sage font-medium truncate mt-0.5">
                          {pet.ageLabel} • {pet.sexLabel}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 sm:px-4 min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">{pet.species}</p>
                    <p className="text-xs text-sage font-medium truncate mt-0.5">{pet.breed}</p>
                  </td>
                  <td className="py-4 px-2 sm:px-4 text-sm text-charcoal/85 font-medium hidden md:table-cell truncate">
                    {pet.ownerName}
                  </td>
                  <td className="py-4 px-2 sm:px-4 text-sm text-charcoal/85 font-medium hidden sm:table-cell whitespace-nowrap">
                    {pet.lastVisitLabel}
                  </td>
                  <td className="py-4 px-3 sm:px-5">
                    <EstadoBadge estado={pet.estado} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <footer className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 py-3.5 border-t border-border-tan bg-white">
        <p className="text-xs sm:text-sm text-sage font-medium truncate">
          Mostrando {pageStart} a {pageEnd} de {totalCount}
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
        className="w-10 h-10 rounded-full object-cover border border-border-tan shrink-0"
      />
    )
  }

  return (
    <div className="w-10 h-10 rounded-full bg-cream text-sage flex items-center justify-center border border-border-tan shrink-0">
      <PawIcon className="w-4 h-4" />
    </div>
  )
}

function EstadoBadge({ estado }: { estado: RecepMascotaEstado }) {
  // Activo usa sage-soft; Inactivo usa tono neutro bone
  const styles =
    estado === 'Activo'
      ? 'bg-sage-soft text-brand'
      : 'bg-bone text-sage border border-border-tan'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${styles}`}
    >
      {estado}
    </span>
  )
}
