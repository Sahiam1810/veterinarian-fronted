import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from '@/global/components'
import type { SuperAdminDueno, DuenoFilters } from '../types'

const actionBtnClass =
  'inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-border-tan bg-white text-sage hover:text-brand hover:bg-bone hover:border-brand/30 text-[11px] font-semibold transition cursor-pointer shadow-2xs'
const actionDangerBtnClass =
  'inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-terracotta/25 bg-terracotta-soft text-terracotta hover:bg-[#F8E8E2] text-[11px] font-semibold transition cursor-pointer shadow-2xs'

export interface DuenosTablePanelProps {
  duenos: SuperAdminDueno[]
  duenoFilters: DuenoFilters
  onFiltersChange: (filters: DuenoFilters) => void
  duenoPage: number
  onPageChange: (page: number | ((current: number) => number)) => void
  totalDuenoPages: number
  totalDuenos: number
  itemsPerPage: number
  onView: (dueno: SuperAdminDueno) => void
  onEdit: (dueno: SuperAdminDueno) => void
  onToggleStatus: (id: string) => void
  onDelete: (dueno: SuperAdminDueno) => void
  onCreate: () => void
  // Por defecto todo habilitado: comportamiento idéntico al de SuperAdmin.
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

// Tabla + filtros + registrar de Dueños, compartida entre SuperAdmin y Veterinario.
export function DuenosTablePanel({
  duenos: paginatedDuenos,
  duenoFilters,
  onFiltersChange,
  duenoPage,
  onPageChange,
  totalDuenoPages,
  totalDuenos,
  itemsPerPage,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onCreate,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: DuenosTablePanelProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 sm:gap-5 relative z-10 animate-view-popup">
      {/* Barra de Filtros y Botón Registrar */}
      <div
        className="bg-white border border-border-tan rounded-2xl sm:rounded-[1.25rem] p-4 sm:p-5 shadow-[0_2px_12px_rgba(35,78,70,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1">
          <span className="text-[11px] sm:text-xs font-bold text-charcoal/70 tracking-wider shrink-0 uppercase">
            Filtros:
          </span>

          {/* Dropdown Estados */}
          <select
            value={duenoFilters.statusFilter}
            onChange={(e) => {
              onFiltersChange({ ...duenoFilters, statusFilter: e.target.value })
              onPageChange(1)
            }}
            className="px-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer min-w-[140px]"
          >
            <option value="all">Todos los Estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          {/* Buscador */}
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={duenoFilters.searchQuery}
              onChange={(e) => {
                onFiltersChange({ ...duenoFilters, searchQuery: e.target.value })
                onPageChange(1)
              }}
              placeholder="Buscar dueño por nombre, documento o teléfono..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
            {duenoFilters.searchQuery && (
              <button
                type="button"
                onClick={() => onFiltersChange({ ...duenoFilters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Botón + Registrar dueño */}
        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="bg-terracotta hover:bg-[#A34E35] text-white inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer shrink-0 active:translate-y-0.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Registrar dueño</span>
          </button>
        )}
      </div>

      {/* Tabla de Dueños */}
      <div className="bg-white border border-border-tan rounded-2xl sm:rounded-[1.25rem] pt-2 shadow-[0_4px_20px_rgba(35,78,70,0.04)] overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="overflow-auto min-h-0 flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-bone/80 border-b border-border-tan/60">
                <th className="py-3.5 px-4 sm:px-6">Dueño / Documento</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Dirección / Ciudad</th>
                <th className="py-3.5 px-4">Mascotas Registradas</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 sm:px-6 text-center min-w-[220px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
              {paginatedDuenos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sage font-medium">
                    No se encontraron dueños con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedDuenos.map((d) => (
                  <tr key={d.id} className="group">
                    {/* Nombre con Avatar */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-terracotta-soft text-terracotta font-bold text-sm flex items-center justify-center border border-terracotta/20">
                          {d.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-charcoal group-hover:text-brand transition-colors text-sm sm:text-base leading-tight">
                            {d.name}
                          </span>
                          <span className="text-xs text-sage font-medium leading-tight">
                            {d.documentId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-charcoal leading-tight">
                          {d.phone}
                        </span>
                        <span className="text-xs text-sage font-medium leading-tight">
                          {d.email}
                        </span>
                      </div>
                    </td>

                    {/* Dirección */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-charcoal leading-tight">
                          {d.address}
                        </span>
                        <span className="text-xs text-sage font-medium leading-tight">
                          {d.city}
                        </span>
                      </div>
                    </td>

                    {/* Mascotas Registradas */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {d.mascotasSummary && d.mascotasSummary.length > 0 ? (
                          d.mascotasSummary.map((pet, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-bone text-charcoal text-[11px] font-semibold border border-border-tan"
                            >
                              {pet}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-sage italic">Sin mascotas</span>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                          d.status === 'Activo'
                            ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                            : 'bg-[#F1EFEA] text-sage border border-border-tan'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    {/* Acciones dueño: Ver / Editar / Activar-Desactivar / Eliminar */}
                    <td
                      className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex flex-wrap items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onView(d)}
                          className={actionBtnClass}
                          title="Ver detalles"
                          aria-label={`Ver detalles de ${d.name}`}
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Ver</span>
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(d)}
                            className={actionBtnClass}
                            title="Editar dueño"
                            aria-label={`Editar ${d.name}`}
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Editar</span>
                          </button>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onToggleStatus(d.id)}
                            className={actionBtnClass}
                            title={d.status === 'Activo' ? 'Desactivar' : 'Activar'}
                            aria-label={`${d.status === 'Activo' ? 'Desactivar' : 'Activar'} ${d.name}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                d.status === 'Activo' ? 'bg-sage' : 'bg-brand'
                              }`}
                            />
                            <span className="hidden xl:inline">
                              {d.status === 'Activo' ? 'Desactivar' : 'Activar'}
                            </span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(d)}
                            className={actionDangerBtnClass}
                            title="Eliminar dueño"
                            aria-label={`Eliminar ${d.name}`}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Eliminar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border-tan/50 bg-white text-xs text-sage">
          <span>
            Mostrando {totalDuenos === 0 ? 0 : (duenoPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(duenoPage * itemsPerPage, totalDuenos)} de {totalDuenos}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={duenoPage <= 1}
              onClick={() => onPageChange((p) => Math.max(1, p - 1))}
              className="inline-flex items-center justify-center px-2.5 h-8 rounded-lg text-[0.75rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
              aria-label="Página anterior"
            >
              Anterior
            </button>

            {Array.from({ length: totalDuenoPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onPageChange(num)}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[0.85rem] cursor-pointer transition-all duration-150 ${
                  duenoPage === num
                    ? 'bg-brand text-white font-bold'
                    : 'font-semibold text-sage hover:bg-[#F5F3EE] hover:text-brand'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              disabled={duenoPage >= totalDuenoPages}
              onClick={() => onPageChange((p) => Math.min(totalDuenoPages, p + 1))}
              className="inline-flex items-center justify-center px-2.5 h-8 rounded-lg text-[0.75rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
              aria-label="Página siguiente"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
