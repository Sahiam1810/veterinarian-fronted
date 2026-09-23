import { useState } from 'react'
import {
  completeMedicationOrder,
  completeProcedureOrder,
  type ApiMedicationOrder,
  type ApiProcedureOrder,
} from '../services/ordenesMedicasService'
import { CloseIcon, MedicalFolderIcon } from './MascotasIcons'
import { ViewPopup } from './ViewPopup'
import { CheckIcon, PillIcon } from '@/global/components'

export type CompleteOrderType = 'MEDICAMENTO' | 'PROCEDIMIENTO'

interface CompletarOrdenModalProps {
  isOpen: boolean
  orderType: CompleteOrderType
  medicationOrder?: ApiMedicationOrder | null
  procedureOrder?: ApiProcedureOrder | null
  onClose: () => void
  onSuccess: () => void
}

export function CompletarOrdenModal({
  isOpen,
  orderType,
  medicationOrder,
  procedureOrder,
  onClose,
  onSuccess,
}: CompletarOrdenModalProps) {
  const [resultFileUrl, setResultFileUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const isMedication = orderType === 'MEDICAMENTO'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      if (isMedication) {
        if (!medicationOrder) return
        await completeMedicationOrder(medicationOrder.id)
      } else {
        if (!procedureOrder) return
        await completeProcedureOrder(procedureOrder.id, resultFileUrl.trim() || null)
      }

      onSuccess()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo completar la orden.'
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-charcoal/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <ViewPopup
        animationKey="completar-orden-modal"
        className="w-full max-w-md bg-white border border-border-tan rounded-2xl shadow-2xl overflow-hidden"
      >
        <header className="flex items-center justify-between p-4 border-b border-border-tan bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-sage-soft text-brand flex items-center justify-center">
              {isMedication ? <PillIcon className="w-4 h-4" /> : <MedicalFolderIcon className="w-4 h-4" />}
            </span>
            <h3 className="font-extrabold text-brand text-base">
              {isMedication ? 'Completar Orden (Entregada)' : 'Completar Orden de Procedimiento'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-border-tan text-sage hover:text-brand bg-white cursor-pointer inline-flex items-center justify-center"
            aria-label="Cerrar"
          >
            <CloseIcon className="w-3 h-3" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div role="alert" className="p-3 rounded-xl bg-danger-soft text-danger text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {isMedication ? (
            <p className="text-xs text-charcoal leading-relaxed">
              ¿Confirmas marcar esta orden de medicamento como <span className="font-bold text-brand">Entregada</span>? Esta acción registrará la entrega y actualizará el estado.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-charcoal leading-relaxed">
                Al marcar este procedimiento como <span className="font-bold text-brand">Completado</span>, se notificará al veterinario solicitante en tiempo real.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-sage mb-1">
                  Enlace al Archivo de Resultado / Informe (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="Ej. https://clinica.com/resultados/informe_ecografia.pdf"
                  value={resultFileUrl}
                  onChange={(e) => setResultFileUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-tan text-xs text-charcoal focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-tan">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-border-tan bg-white text-charcoal text-xs font-bold hover:bg-bone transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs disabled:opacity-60"
            >
              <CheckIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando…' : 'Confirmar y Completar'}</span>
            </button>
          </div>
        </form>
      </ViewPopup>
    </div>
  )
}
