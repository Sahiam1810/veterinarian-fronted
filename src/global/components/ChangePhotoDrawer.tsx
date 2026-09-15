import { useEffect, useState, type FormEvent } from 'react'
import { normalizeProfilePhotoUrl } from '../utils/profilePhotoUrl.ts'

interface ChangePhotoDrawerProps {
  isOpen: boolean
  photoUrl: string
  onClose: () => void
  onSave: (url: string) => void | Promise<void>
}

// Pide un enlace http(s) y lo guarda en el servidor. Vacío quita la foto.
export function ChangePhotoDrawer({
  isOpen,
  photoUrl,
  onClose,
  onSave,
}: ChangePhotoDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [url, setUrl] = useState(photoUrl)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setUrl(photoUrl)
      setError(null)
      setIsSaving(false)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isRendered, photoUrl])

  const handleClose = () => {
    if (isClosing || isSaving) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const result = normalizeProfilePhotoUrl(url)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      await onSave(result.url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la foto de perfil.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const preview = normalizeProfilePhotoUrl(url)
  const previewUrl = preview.ok && preview.url ? preview.url : ''

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-photo-title"
    >
      <div
        className={`w-full sm:w-[420px] lg:w-[450px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white shrink-0">
          <h3 id="drawer-photo-title" className="text-xl font-bold text-brand">
            Actualizar Foto
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer disabled:opacity-50"
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {error}
            </div>
          )}

          <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/60 p-3.5 text-xs text-emerald-900 flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Pega el enlace de la imagen. Se guarda en el servidor. Déjalo vacío para quitarla.
            </p>
          </div>

          <div>
            <label htmlFor="profile-photo-url" className="block font-bold text-charcoal mb-1.5">
              Enlace de la imagen
            </label>
            <input
              id="profile-photo-url"
              type="url"
              value={url}
              disabled={isSaving}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              placeholder="https://ejemplo.com/mi-foto.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone/40"
            />
          </div>

          {previewUrl ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Vista previa</p>
              <img
                src={previewUrl}
                alt="Vista previa de la foto de perfil"
                className="w-24 h-24 rounded-2xl object-cover border border-border-tan shadow-xs"
              />
            </div>
          ) : null}

          <div className="pt-4 border-t border-border-tan/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone hover:text-charcoal transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isSaving ? 'Guardando...' : 'Guardar foto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
