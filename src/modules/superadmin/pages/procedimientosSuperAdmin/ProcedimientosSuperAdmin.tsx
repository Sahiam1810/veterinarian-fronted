import { useState, useEffect, type FormEvent } from 'react'
import {
  fetchProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure,
  type ApiProcedure,
} from '@/modules/veterinario/services/ordenesMedicasService'
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  PageToast,
  StethoscopeIcon,
  Pagination,
} from '@/global/components'

interface ProcedimientosSuperAdminProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function ProcedimientosSuperAdmin({
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: ProcedimientosSuperAdminProps) {
  const [procedures, setProcedures] = useState<ApiProcedure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActiveOnly, setFilterActiveOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'danger'>('success')

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProcedure, setEditingProcedure] = useState<ApiProcedure | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete modal
  const [deletingProcedure, setDeletingProcedure] = useState<ApiProcedure | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const list = await fetchProcedures(filterActiveOnly)
      setProcedures(list)
    } catch {
      showToast('Error al cargar la lista de procedimientos.', 'danger')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [filterActiveOnly])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterActiveOnly])

  const showToast = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleOpenCreate = () => {
    setEditingProcedure(null)
    setName('')
    setCode('')
    setIsActive(true)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: ApiProcedure) => {
    setEditingProcedure(item)
    setName(item.name)
    setCode(item.code || '')
    setIsActive(item.isActive)
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      if (editingProcedure) {
        await updateProcedure(editingProcedure.id, {
          name: name.trim(),
          code: code.trim() || null,
          isActive,
        })
        showToast('Procedimiento actualizado correctamente.')
      } else {
        await createProcedure({
          name: name.trim(),
          code: code.trim() || null,
          isActive,
        })
        showToast('Procedimiento registrado correctamente.')
      }
      setIsFormOpen(false)
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el procedimiento.'
      showToast(msg, 'danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProcedure) return
    try {
      await deleteProcedure(deletingProcedure.id)
      showToast('Procedimiento desactivado correctamente.')
      setDeletingProcedure(null)
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al desactivar el procedimiento.'
      showToast(msg, 'danger')
    }
  }

  const filtered = procedures.filter((p) => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return true
    return p.name.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q))
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      {toastMessage && (
        <PageToast
          message={toastMessage}
          tone={toastType === 'danger' ? 'warning' : 'success'}
        />
      )}

      {/* Bar top control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border-tan shadow-xs">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
          <input
            type="text"
            placeholder="Buscar procedimientos/pruebas por nombre o código…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-tan bg-bone text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              className="rounded border-border-tan text-brand focus:ring-brand"
            />
            Solo activos
          </label>

          {canCreate && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Nuevo Procedimiento</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid / Tabla */}
      <div className="bg-white border border-border-tan rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sage text-sm">Cargando catálogo de procedimientos…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sage text-sm">
            No se encontraron procedimientos o pruebas registradas.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-bone border-b border-border-tan text-sage font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-5">Código / Ref</th>
                    <th className="p-3.5">Nombre del Procedimiento / Prueba</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 pr-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tan/60 text-charcoal">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-bone/40 transition">
                      <td className="p-3.5 pl-5 font-mono text-xs font-bold text-sage">
                        {item.code || '—'}
                      </td>
                      <td className="p-3.5 font-bold text-brand">{item.name}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.isActive
                              ? 'bg-sage-soft text-brand'
                              : 'bg-bone text-sage border border-border-tan'
                          }`}
                        >
                          {item.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-bone text-sage hover:text-brand transition cursor-pointer"
                              title="Editar"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && item.isActive && (
                            <button
                              type="button"
                              onClick={() => setDeletingProcedure(item)}
                              className="p-1.5 rounded-lg hover:bg-danger-soft text-sage hover:text-danger transition cursor-pointer"
                              title="Desactivar"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="procedimientos"
            />
          </>
        )}
      </div>

      {/* Modal Formulario Crear/Editar */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="bg-white border border-border-tan rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-brand flex items-center gap-2">
              <StethoscopeIcon className="w-5 h-5 text-brand" />
              <span>{editingProcedure ? 'Editar Procedimiento' : 'Nuevo Procedimiento'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                  Nombre del Procedimiento / Prueba Diagnóstica *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ecografía Abdominal / Hemograma Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                  Código / Referencia (Opcional CUPS)
                </label>
                <input
                  type="text"
                  placeholder="Ej. PROC-001 o CUPS"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="proc-active-chk"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border-tan text-brand focus:ring-brand"
                />
                <label htmlFor="proc-active-chk" className="text-xs font-bold text-charcoal cursor-pointer">
                  Procedimiento Activo
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-tan">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border-tan text-xs font-bold text-charcoal hover:bg-bone transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación Desactivar */}
      {deletingProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="bg-white border border-border-tan rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-base font-extrabold text-danger">Desactivar Procedimiento</h3>
            <p className="text-xs text-charcoal">
              ¿Estás seguro de desactivar el procedimiento <span className="font-bold text-brand">{deletingProcedure.name}</span>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProcedure(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border-tan text-xs font-bold text-charcoal hover:bg-bone"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
