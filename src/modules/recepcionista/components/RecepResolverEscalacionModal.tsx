import { useState } from 'react'
import { ReloadIcon } from '@/global/components'

interface RecepResolverEscalacionModalProps {
  isOpen: boolean
  clientName: string
  isResolving: boolean
  onClose: () => void
  onConfirm: (notes?: string) => Promise<void>
}

export function RecepResolverEscalacionModal({
  isOpen,
  clientName,
  isResolving,
  onClose,
  onConfirm,
}: RecepResolverEscalacionModalProps) {
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onConfirm(notes)
    setNotes('')
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 overflow-hidden modal-backdrop-animate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolver-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-xs cursor-pointer border-0"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white border border-border-tan rounded-2xl shadow-2xl overflow-hidden modal-content-animate">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <header className="p-4 sm:p-5 border-b border-border-tan bg-cream/40">
            <h3 id="resolver-modal-title" className="text-base font-extrabold text-brand tracking-tight">
              Marcar Conversación como Resuelta
            </h3>
            <p className="text-xs text-sage font-medium mt-1">
              Finalizarás la atención para <span className="font-bold text-charcoal">{clientName}</span> y el caso se removerá de la bandeja activa.
            </p>
          </header>

          <div className="p-4 sm:p-5 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-charcoal">
                Nota o resumen de resolución <span className="text-sage font-normal">(opcional)</span>
              </span>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Se atendió la solicitud del cliente y se reprogramó su cita para el viernes."
                className="w-full rounded-xl border border-border-tan bg-bone/40 p-3 text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 resize-none transition"
              />
            </label>
          </div>

          <footer className="p-4 sm:p-5 border-t border-border-tan bg-bone/30 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isResolving}
              className="px-4 py-2 rounded-xl border border-border-tan bg-white text-xs font-bold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isResolving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isResolving && <ReloadIcon className="w-3.5 h-3.5 animate-spin text-white" />}
              <span>{isResolving ? 'Resolviendo…' : 'Confirmar Resolución'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
