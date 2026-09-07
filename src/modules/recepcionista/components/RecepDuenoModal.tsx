import { useState, useEffect, type FormEvent } from 'react'
import type { RecepDuenoDetail, RecepDuenoFormData } from '../types'
import { CloseIcon, PhoneIcon } from './RecepMascotasIcons'
import { MailIcon } from './PerfilIcons'
import { UserAvatarIcon } from '@/global/components'

interface RecepDuenoModalProps {
  isOpen: boolean
  editingOwner: RecepDuenoDetail | null
  isLoading?: boolean
  onClose: () => void
  onSave: (data: RecepDuenoFormData) => Promise<void> | void
}

export function RecepDuenoModal({
  isOpen,
  editingOwner,
  isLoading = false,
  onClose,
  onSave,
}: RecepDuenoModalProps) {
  const [fullName, setFullName] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (editingOwner) {
      setFullName(editingOwner.fullName || '')
      setDocumentId(editingOwner.documentId || '')
      setPhone(editingOwner.phone || '')
      setEmail(editingOwner.email || '')
      setAddress(editingOwner.address || '')
    } else {
      setFullName('')
      setDocumentId('')
      setPhone('')
      setEmail('')
      setAddress('')
    }
    setError(null)
  }, [isOpen, editingOwner])

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Por favor ingresa el nombre completo del dueño.')
      return
    }
    if (!documentId.trim()) {
      setError('Por favor ingresa el número de identificación (cédula).')
      return
    }
    if (!phone.trim()) {
      setError('Por favor ingresa el teléfono de contacto.')
      return
    }

    try {
      setError(null)
      await onSave({
        fullName: fullName.trim(),
        documentId: documentId.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el dueño'
      setError(msg)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-animate"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border-tan overflow-hidden modal-content-animate flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-tan/70 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-sage-soft text-brand flex items-center justify-center font-extrabold">
              <UserAvatarIcon className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-brand tracking-tight">
                {editingOwner ? 'Editar Dueño' : 'Registrar Nuevo Dueño'}
              </h2>
              <p className="text-xs text-sage font-medium">
                {editingOwner ? 'Actualiza los datos de contacto del cliente' : 'Crea un nuevo cliente sin credenciales de acceso'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-sage hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form
          id="recep-dueno-form"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 flex-1"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="dueno-fullName">
              Nombre Completo <span className="text-brand">*</span>
            </label>
            <input
              id="dueno-fullName"
              type="text"
              required
              disabled={isLoading}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Laura Gómez Pérez"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="dueno-documentId">
                Cédula / Identificación <span className="text-brand">*</span>
              </label>
              <input
                id="dueno-documentId"
                type="text"
                required
                disabled={isLoading}
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Ej: 1020304050"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="dueno-phone">
                Teléfono <span className="text-brand">*</span>
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
                <input
                  id="dueno-phone"
                  type="tel"
                  required
                  disabled={isLoading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 3001234567"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="dueno-email">
              Correo Electrónico (Opcional)
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
              <input
                id="dueno-email"
                type="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="dueno-address">
              Dirección
            </label>
            <input
              id="dueno-address"
              type="text"
              disabled={isLoading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Carrera 15 #85-30"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:bg-bone transition cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="recep-dueno-form"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-50"
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>{editingOwner ? 'Guardar Cambios' : 'Registrar Dueño'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
