import { useState, useEffect } from 'react'
import { fetchSupplies, type ApiSupply } from '@/modules/superadmin/services/suppliesService'
import { addStaySupplyConsumption } from '../services/hospitalizacionService'
import { formatLiquidationCurrency } from '../utils/hospitalizacionLiquidation'
import { ProfessionalCombobox } from '@/modules/superadmin/components/ProfessionalCombobox'
import { PackageIcon, PlusIcon } from '@/global/components'
import { ViewPopup } from '@/modules/veterinario/components/ViewPopup'
import { CloseIcon } from '@/modules/veterinario/components/MascotasIcons'

export interface RegistrarConsumoInsumoModalProps {
  isOpen: boolean
  stayId: string
  petName?: string | null
  isDischarged?: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RegistrarConsumoInsumoModal({
  isOpen,
  stayId,
  petName,
  isDischarged = false,
  onClose,
  onSuccess,
}: RegistrarConsumoInsumoModalProps) {
  const [supplies, setSupplies] = useState<ApiSupply[]>([])
  const [isLoadingSupplies, setIsLoadingSupplies] = useState(false)
  const [selectedSupplyId, setSelectedSupplyId] = useState('')
  const [quantity, setQuantity] = useState<number | string>(1)
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setIsLoadingSupplies(true)
    setFormError(null)
    setSelectedSupplyId('')
    setQuantity(1)
    setNotes('')

    async function loadSupplies() {
      try {
        const list = await fetchSupplies(true)
        if (!cancelled) setSupplies(list)
      } catch {
        // Handled silently
      } finally {
        if (!cancelled) setIsLoadingSupplies(false)
      }
    }

    void loadSupplies()
    return () => {
      cancelled = true
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedSupply = supplies.find((s) => s.id === selectedSupplyId)
  const unitPrice = selectedSupply?.unitPrice ?? 0
  const qtyNum = typeof quantity === 'number' ? quantity : Number(quantity) || 0
  const calculatedSubtotal = unitPrice * qtyNum

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (isDischarged) {
      setFormError('La estancia está dada de alta. No se pueden registrar consumos.')
      return
    }

    if (!selectedSupplyId) {
      setFormError('Debes seleccionar un insumo del catálogo.')
      return
    }

    if (!qtyNum || qtyNum <= 0) {
      setFormError('La cantidad consumida debe ser mayor a 0.')
      return
    }

    setIsSubmitting(true)
    try {
      await addStaySupplyConsumption(stayId, {
        supplyId: selectedSupplyId,
        quantity: qtyNum,
        notes: notes.trim() || null,
      })
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el consumo de insumo.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/45 backdrop-blur-xs cursor-pointer border-0"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <ViewPopup
        animationKey="registrar-consumo-insumo-modal"
        className="relative z-10 w-full max-w-lg max-h-[min(94dvh,750px)] min-h-0 flex flex-col"
      >
        <div className="bg-bone border border-border-tan rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(94dvh,750px)]">
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border-tan bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-sage-soft text-brand flex items-center justify-center shrink-0">
                <PackageIcon className="w-5 h-5 text-brand" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-brand tracking-tight truncate">
                  Registrar Consumo de Insumo
                </h2>
                <p className="text-xs text-sage font-medium truncate">
                  {petName ? `Paciente: ${petName}` : `Estancia #${stayId}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center bg-white shrink-0"
              aria-label="Cerrar"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs sm:text-sm font-medium leading-snug"
                >
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                  Insumo de la Clínica *
                </label>
                <ProfessionalCombobox
                  value={selectedSupplyId}
                  onChange={(val) => setSelectedSupplyId(val)}
                  options={supplies.map((s) => ({
                    id: s.id,
                    name: s.name,
                    subtitle: `${s.unit} • ${formatLiquidationCurrency(s.unitPrice)}`,
                  }))}
                  hasAllOption={false}
                  disabled={isLoadingSupplies}
                  placeholder={
                    isLoadingSupplies ? 'Cargando catálogo de insumos…' : 'Selecciona un insumo…'
                  }
                  searchPlaceholder="Buscar insumo por nombre…"
                  className="w-full bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                    Cantidad Utilizada *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                    Subtotal Estimado
                  </label>
                  <div className="px-3.5 py-2 rounded-xl border border-border-tan bg-bone/40 text-xs sm:text-sm font-bold text-brand flex items-center">
                    {formatLiquidationCurrency(calculatedSubtotal)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage mb-1 uppercase tracking-wider">
                  Notas / Observación del Uso (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Uso en canalización de vía intravenosa o curación"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Footer */}
            <footer className="shrink-0 flex items-center justify-end gap-2.5 p-3 sm:p-4 border-t border-border-tan bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-border-tan bg-white text-charcoal text-xs sm:text-sm font-bold hover:bg-bone transition cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !selectedSupplyId}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Guardando…</span>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    <span>Registrar Consumo</span>
                  </>
                )}
              </button>
            </footer>
          </form>
        </div>
      </ViewPopup>
    </div>
  )
}
