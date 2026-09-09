import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangleIcon, CloseIcon, TrashIcon } from './MascotasIcons'

interface VetEliminarMascotaModalProps {
  isOpen: boolean
  petName: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function VetEliminarMascotaModal({
  isOpen,
  petName,
  onClose,
  onConfirm,
}: VetEliminarMascotaModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || typeof document === 'undefined') return null

  const handleConfirm = async () => {
    setError(null)
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la mascota'
      setError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-charcoal/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-border-tan shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-tan/60 bg-terracotta-soft/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-terracotta tracking-tight">
                Eliminar Mascota
              </h2>
              <p className="text-xs text-charcoal/70 font-medium">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center shrink-0"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-terracotta-soft border border-terracotta/25 p-3 text-xs text-terracotta font-semibold">
              {error}
            </div>
          )}

          <p className="text-sm text-charcoal leading-relaxed">
            ¿Estás seguro de que deseas eliminar permanentemente a{' '}
            <strong className="text-brand font-bold">{petName}</strong> del registro de pacientes?
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-tan/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-terracotta hover:bg-terracotta/90 text-white transition shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Eliminando…</span>
                </>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4" />
                  <span>Sí, Eliminar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
