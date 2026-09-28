import type { RecepDuenoEstado, RecepDuenoListItem } from '../types'
import { getPageItems } from '../utils/recepDuenosPagination'

interface RecepDuenosTableProps {
  items: RecepDuenoListItem[]
  selectedId: string | null
  pageStart: number
  pageEnd: number
  totalCount: number
  currentPage?: number
  totalPages?: number
  onSelect: (ownerId: string) => void
  onPrevPage?: () => void
  onNextPage?: () => void
  onGoToPage?: (page: number) => void
}

// Tabla de dueños; al hacer clic se abre el panel de detalle
export function RecepDuenosTable({
  items,
  selectedId,
  pageStart,
  pageEnd,
  totalCount,
  currentPage = 1,
  totalPages = 1,
  onSelect,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: RecepDuenosTableProps) {
  const pageItems = getPageItems(currentPage, totalPages)

  return (
    <section className="flex-1 min-w-0 min-h-0 flex flex-col rounded-2xl border border-border-tan bg-white overflow-hidden shadow-[0_2px_16px_rgba(35,78,70,0.04)] animate-view-popup">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-sage-soft/80 backdrop-blur-xs">
            <tr className="border-b border-border-tan text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-sage">
              <th className="py-3.5 px-3 sm:px-5 w-[26%]">Nombre Completo</th>
              <th className="py-3.5 px-2 sm:px-4 w-[14%] hidden md:table-cell">Documento</th>
              <th className="py-3.5 px-2 sm:px-4 w-[14%] hidden sm:table-cell">Teléfono</th>
              <th className="py-3.5 px-2 sm:px-4 w-[20%] hidden lg:table-cell">Correo</th>
              <th className="py-3.5 px-2 sm:px-4 w-[12%] text-center">Mascotas</th>
              <th className="py-3.5 px-3 sm:px-5 w-[14%]">Estado</th>
            </tr>
          </thead>
          <tbody key={currentPage} className="animate-view-popup">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sage font-medium text-sm">
                  No se encontraron dueños con los criterios seleccionados.
                </td>
              </tr>
            ) : (
              items.map((owner) => {
                const selected = selectedId === owner.id
                return (
                  <tr
                    key={owner.id}
                    onClick={() => onSelect(owner.id)}
                    className={`border-b border-border-tan/60 last:border-b-0 cursor-pointer transition-colors duration-150 ${
                      selected ? 'bg-cream/80' : 'hover:bg-bone/70'
                    }`}
                  >
                    <td className="py-4 px-3 sm:px-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <OwnerAvatar name={owner.fullName} />
                        <div className="min-w-0">
                          <p className="font-bold text-brand text-sm truncate">
                            {owner.fullName}
                          </p>
                          <p className="text-xs text-sage font-medium mt-0.5">
                            ID: {owner.code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-sm text-charcoal/85 font-medium hidden md:table-cell truncate">
                      {owner.documentId}
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-sm text-charcoal/85 font-medium hidden sm:table-cell">
                      <span className="block leading-snug">{owner.phone}</span>
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-sm text-charcoal/85 font-medium hidden lg:table-cell truncate">
                      {owner.email}
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-full bg-sage-soft text-brand text-xs font-extrabold">
                        {owner.petsCount}
                      </span>
                    </td>
                    <td className="py-4 px-3 sm:px-5">
                      <EstadoBadge estado={owner.estado} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <footer className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 py-3.5 border-t border-border-tan bg-white">
        <p className="text-xs sm:text-sm text-sage font-medium truncate">
          Mostrando {pageStart} a {pageEnd} de {totalCount} {totalCount === 1 ? 'dueño' : 'dueños'}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="px-2.5 h-8 rounded-lg border border-border-tan text-xs font-semibold text-sage hover:text-brand hover:border-brand/30 hover:bg-bone/40 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer inline-flex items-center justify-center"
            aria-label="Página anterior"
          >
            Anterior
          </button>
          {pageItems.map((pageItem, idx) => {
            if (typeof pageItem === 'string') {
              return (
                <span key={`${pageItem}-${idx}`} className="px-1 text-sage text-xs font-bold select-none">
                  …
                </span>
              )
            }
            const isCurrent = currentPage === pageItem
            return (
              <button
                key={pageItem}
                type="button"
                onClick={() => onGoToPage?.(pageItem)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer inline-flex items-center justify-center active:scale-95 ${
                  isCurrent
                    ? 'bg-brand text-white shadow-xs font-extrabold scale-105'
                    : 'border border-border-tan text-sage hover:text-brand hover:border-brand/30 hover:bg-bone/40'
                }`}
                aria-label={`Ir a la página ${pageItem}`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {pageItem}
              </button>
            )
          })}
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="px-2.5 h-8 rounded-lg border border-border-tan text-xs font-semibold text-sage hover:text-brand hover:border-brand/30 hover:bg-bone/40 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer inline-flex items-center justify-center"
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      </footer>
    </section>
  )
}

function OwnerAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="w-10 h-10 rounded-full bg-cream text-sage border border-border-tan flex items-center justify-center shrink-0 text-xs font-extrabold">
      {initials || 'DU'}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: RecepDuenoEstado }) {
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
