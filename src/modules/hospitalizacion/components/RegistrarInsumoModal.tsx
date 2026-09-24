import { useState, useMemo, type FormEvent } from 'react'
import type { ApiSupply } from '../types/hospitalizacion.types'
import { registerStaySupplyConsumption } from '../services/hospitalizacionService'
import {
  validateSupplyConsumptionForm,
  formatSupplyCurrency,
} from '../utils/hospitalizacionSupplyMapping'

export interface RegistrarInsumoModalProps {
  isOpen: boolean
  stayId: string
  activeSupplies: ApiSupply[]
  isLoadingSupplies?: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

export function RegistrarInsumoModal({
  isOpen,
  stayId,
  activeSupplies,
  isLoadingSupplies = false,
  onClose,
  onSuccess,
}: RegistrarInsumoModalProps) {
  const [supplyId, setSupplyId] = useState('')
  const [quantity, setQuantity] = useState<string | number>('1')
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedSupply = useMemo(() => {
    if (!supplyId) return null
    return activeSupplies.find((s) => s.id === supplyId) || null
  }, [supplyId, activeSupplies])

  const calculatedSubtotal = useMemo(() => {
    if (!selectedSupply) return 0
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) return 0
    return qty * selectedSupply.unitPrice
  }, [selectedSupply, quantity])

  if (!isOpen) return null

  const handleReset = () => {
    setSupplyId('')
    setQuantity('1')
    setNotes('')
    setErrorMessage(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    if (isSubmitting) return
    handleReset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const validation = validateSupplyConsumptionForm({
      supplyId,
      quantity,
      notes,
      selectedSupply,
    })

    if (!validation.ok) {
      setErrorMessage(validation.error || 'Por favor verifica los campos.')
      return
    }

    setIsSubmitting(true)
    try {
      await registerStaySupplyConsumption(stayId, {
        supplyId,
        quantity: validation.quantityNum,
        notes: notes.trim() ? notes.trim() : null,
      })

      handleReset()
      onSuccess('Consumo de insumo registrado correctamente.')
      onClose()
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string }
      const message =
        apiErr.response?.data?.message ||
        apiErr.message ||
        'Error al registrar el consumo del insumo. Por favor intenta nuevamente.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs animate-view-popup"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registrar-insumo-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-warm-grey/50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-warm-grey/40 flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h3
              id="registrar-insumo-modal-title"
              className="text-lg font-bold text-charcoal tracking-tight"
            >
              Registrar consumo de insumo
            </h3>
            <p className="text-xs text-sage mt-0.5">
              Selecciona el insumo y la cantidad consumida durante la estancia.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-sage hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4.5">
          {errorMessage && (
            <div className="p-3.5 bg-terracotta-soft/30 border border-terracotta/30 text-terracotta rounded-xl text-xs font-medium flex items-start gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selector de Insumo Activo */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="supply-select" className="text-xs font-semibold text-charcoal">
              Insumo <span className="text-terracotta">*</span>
            </label>
            <select
              id="supply-select"
              value={supplyId}
              onChange={(e) => {
                setSupplyId(e.target.value)
                setErrorMessage(null)
              }}
              disabled={isSubmitting || isLoadingSupplies}
              className="w-full px-3.5 py-2.5 bg-bone/40 border border-warm-grey/60 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal disabled:opacity-60 transition"
            >
              <option value="">
                {isLoadingSupplies ? 'Cargando catálogo de insumos...' : 'Seleccionar insumo activo...'}
              </option>
              {activeSupplies.map((item) => (
                <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                  {item.name} — ({item.unit}) — Stock: {item.stock} {item.stock <= 0 ? ' [Sin Stock]' : ''}
                </option>
              ))}
            </select>
            {activeSupplies.length === 0 && !isLoadingSupplies && (
              <p className="text-xs text-ochre mt-0.5">
                No hay insumos activos disponibles en el catálogo.
              </p>
            )}
          </div>

          {/* Detalle del insumo seleccionado (solo lectura) */}
          {selectedSupply && (
            <div className="p-3.5 bg-brand-teal/5 border border-brand-teal/20 rounded-xl flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-sage block">Unidad</span>
                  <span className="font-semibold text-charcoal">{selectedSupply.unit}</span>
                </div>
                <div>
                  <span className="text-sage block">Precio catálogo</span>
                  <span className="font-semibold text-charcoal">
                    {formatSupplyCurrency(selectedSupply.unitPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-sage block">Stock actual</span>
                  <span
                    className={`font-semibold ${
                      selectedSupply.stock <= 0
                        ? 'text-terracotta'
                        : selectedSupply.stock < 5
                          ? 'text-ochre'
                          : 'text-brand-teal'
                    }`}
                  >
                    {selectedSupply.stock}
                  </span>
                </div>
              </div>
              {calculatedSubtotal > 0 && (
                <div className="pt-2 border-t border-brand-teal/15 flex items-center justify-between text-xs">
                  <span className="text-sage font-medium">Subtotal estimado:</span>
                  <span className="font-bold text-charcoal text-sm">
                    {formatSupplyCurrency(calculatedSubtotal)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cantidad */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="quantity-input" className="text-xs font-semibold text-charcoal">
              Cantidad <span className="text-terracotta">*</span>
            </label>
            <input
              id="quantity-input"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value)
                setErrorMessage(null)
              }}
              disabled={isSubmitting}
              placeholder="Ej. 1"
              className="w-full px-3.5 py-2.5 bg-bone/40 border border-warm-grey/60 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal disabled:opacity-60 transition"
            />
            {selectedSupply && Number(quantity) > selectedSupply.stock && (
              <p className="text-xs text-terracotta font-medium mt-0.5">
                La cantidad ingresada supera el stock disponible ({selectedSupply.stock}).
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="notes-input" className="text-xs font-semibold text-charcoal">
                Notas <span className="text-sage font-normal">(opcional)</span>
              </label>
              <span
                className={`text-[11px] ${
                  notes.length > 500 ? 'text-terracotta font-bold' : 'text-sage'
                }`}
              >
                {notes.length}/500
              </span>
            </div>
            <textarea
              id="notes-input"
              rows={3}
              maxLength={500}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                setErrorMessage(null)
              }}
              disabled={isSubmitting}
              placeholder="Ej. Utilizado durante la curación postquirúrgica..."
              className="w-full px-3.5 py-2.5 bg-bone/40 border border-warm-grey/60 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal disabled:opacity-60 transition resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="mt-3 pt-3 border-t border-warm-grey/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-charcoal bg-bone hover:bg-warm-grey/40 rounded-xl transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !supplyId ||
                !quantity ||
                Number(quantity) <= 0 ||
                (selectedSupply ? Number(quantity) > selectedSupply.stock : false)
              }
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-teal hover:bg-brand-dark rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Registrar consumo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
