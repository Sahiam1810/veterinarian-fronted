import { useState, useEffect, type FormEvent } from 'react'
import {
  fetchSupplies,
  createSupply,
  updateSupply,
  deleteSupply,
  type ApiSupply,
} from '../../services/suppliesService'
import { validateSupplyForm } from '../../utils/supplyForm'
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  PageToast,
  PackageIcon,
} from '@/global/components'

interface InsumosSuperAdminProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function InsumosSuperAdmin({
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: InsumosSuperAdminProps) {
  const [supplies, setSupplies] = useState<ApiSupply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActiveOnly, setFilterActiveOnly] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'danger'>('success')

  // Modales Formulario
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupply, setEditingSupply] = useState<ApiSupply | null>(null)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [unitPrice, setUnitPrice] = useState<string | number>('')
  const [stock, setStock] = useState<string | number>('')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete modal
  const [deletingSupply, setDeletingSupply] = useState<ApiSupply | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const list = await fetchSupplies(filterActiveOnly)
      setSupplies(list)
    } catch {
      showToast('Error al cargar la lista de insumos.', 'danger')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [filterActiveOnly])

  const showToast = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleOpenCreate = () => {
    setEditingSupply(null)
    setName('')
    setUnit('')
    setUnitPrice('')
    setStock('')
    setIsActive(true)
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: ApiSupply) => {
    setEditingSupply(item)
    setName(item.name)
    setUnit(item.unit)
    setUnitPrice(item.unitPrice)
    setStock(item.stock)
    setIsActive(item.isActive)
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validation = validateSupplyForm({ name, unit, unitPrice, stock })
    if (!validation.ok) {
      setFormError(validation.error)
      return
    }
    setFormError(null)

    setIsSubmitting(true)
    try {
      const payload = { ...validation.payload, isActive }

      if (editingSupply) {
        await updateSupply(editingSupply.id, payload)
        showToast('Insumo actualizado correctamente.')
      } else {
        await createSupply(payload)
        showToast('Insumo registrado correctamente.')
      }
      setIsFormOpen(false)
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el insumo.'
      showToast(msg, 'danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSupply) return
    setIsDeleting(true)
    try {
      await deleteSupply(deletingSupply.id)
      showToast('Insumo desactivado correctamente.')
      setDeletingSupply(null)
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al desactivar el insumo.'
      showToast(msg, 'danger')
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = supplies.filter((item) => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      item.unit.toLowerCase().includes(q)
    )
  })

  const formatCurrency = (val: number) => {
    return `$ ${Number(val || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`
  }

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
            placeholder="Buscar insumos por nombre o unidad…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-tan bg-bone text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer select-none">
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
              <span>Nuevo Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid / Tabla */}
      <div className="bg-white border border-border-tan rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sage text-sm">Cargando catálogo de insumos…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sage text-sm">
            No se encontraron insumos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-bone border-b border-border-tan text-sage font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">Nombre del Insumo</th>
                  <th className="p-3.5">Unidad</th>
                  <th className="p-3.5">Precio Unitario</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 pr-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-tan/60 text-charcoal">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-bone/40 transition">
                    <td className="p-3.5 pl-5 font-bold text-brand">{item.name}</td>
                    <td className="p-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-bone text-charcoal text-xs font-medium border border-border-tan/60">
                        {item.unit}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-charcoal">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-semibold ${
                          item.stock <= 5 ? 'text-danger font-bold' : 'text-charcoal'
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>
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
                            onClick={() => setDeletingSupply(item)}
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
        )}
      </div>

      {/* Modal Formulario Crear/Editar */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="bg-white border border-border-tan rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-brand flex items-center gap-2">
              <PackageIcon className="w-5 h-5 text-brand" />
              <span>{editingSupply ? 'Editar Insumo' : 'Nuevo Insumo'}</span>
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-danger-soft border border-danger/20 text-xs font-semibold text-danger">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Ej. Gasa estéril 10x10 cm"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                  Unidad de Medida *
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Ej. unidad, ml, frasco, caja, ampolla"
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                    Precio Unitario ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="0"
                    value={unitPrice}
                    onChange={(e) => {
                      setUnitPrice(e.target.value)
                      if (formError) setFormError(null)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value)
                      if (formError) setFormError(null)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="supply-active-chk"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border-tan text-brand focus:ring-brand"
                />
                <label htmlFor="supply-active-chk" className="text-xs font-bold text-charcoal cursor-pointer">
                  Insumo Activo
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
                  disabled={isSubmitting || !name.trim() || !unit.trim()}
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
      {deletingSupply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="bg-white border border-border-tan rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-base font-extrabold text-danger">Desactivar Insumo</h3>
            <p className="text-xs text-charcoal">
              ¿Estás seguro de desactivar el insumo <span className="font-bold text-brand">{deletingSupply.name}</span>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSupply(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl border border-border-tan text-xs font-bold text-charcoal hover:bg-bone"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 disabled:opacity-60"
              >
                {isDeleting ? 'Desactivando…' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
