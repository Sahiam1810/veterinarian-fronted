import { useState, type FormEvent, useEffect } from 'react'
import { KeyIcon, ShieldIcon } from './PerfilIcons'

interface RecepChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean; message: string }>
  isSubmitting: boolean
  error: string | null
}

export function RecepChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: RecepChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const res = await onSubmit(currentPassword, newPassword, confirmPassword)
    if (res.success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <div className="bg-white rounded-3xl border border-border-tan shadow-[0_8px_32px_rgba(35,78,70,0.16)] w-full max-w-md overflow-hidden flex flex-col">
        {/* Header del Modal */}
        <div className="px-6 py-5 border-b border-border-tan/60 flex items-center justify-between bg-cream/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <ShieldIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="change-password-title" className="text-base font-black text-brand leading-tight">
                Cambiar Contraseña
              </h3>
              <p className="text-xs text-sage font-medium mt-0.5">
                Seguridad de tu cuenta de recepción
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full text-sage hover:text-charcoal hover:bg-bone flex items-center justify-center transition cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Contraseña Actual
            </label>
            <input
              type="password"
              required
              disabled={isSubmitting}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:bg-bone/35"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              disabled={isSubmitting}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:bg-bone/35"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              disabled={isSubmitting}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:bg-bone/35"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-border-tan/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-sage hover:text-charcoal hover:bg-bone transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#854d38] hover:bg-[#703d2a] text-white transition shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <KeyIcon className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
