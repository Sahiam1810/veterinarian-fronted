import { useState, useEffect, type FormEvent } from 'react'
import { OwnersIcon } from '@/global/components'
import { buildDuenoDrawerFormState } from '../utils/buildDuenoDrawerFormState'
import type { SuperAdminDueno, DuenoFormData, EstadoMascota } from '../types'

export interface DuenoDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: DuenoFormData) => void
  editingDueno: SuperAdminDueno | null
}

// Drawer registrar/editar dueño, compartido entre SuperAdmin y Veterinario.
export function DuenoDrawer({
  isOpen,
  onClose,
  onSave,
  editingDueno,
}: DuenoDrawerProps) {
  const [name, setName] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Bogotá')
  const [status, setStatus] = useState<EstadoMascota>('Activo')
  const [formError, setFormError] = useState<string | null>(null)

  // Sincroniza los 7 campos al abrir o cambiar el dueño (mismo patrón que MascotaDrawer / S33).
  useEffect(() => {
    if (!isOpen) return
    const next = buildDuenoDrawerFormState(editingDueno)
    setName(next.name)
    setDocumentId(next.documentId)
    setEmail(next.email)
    setPhone(next.phone)
    setAddress(next.address)
    setCity(next.city)
    setStatus(next.status)
    setFormError(null)
  }, [isOpen, editingDueno])

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre completo del dueño.')
      return
    }
    if (!documentId.trim()) {
      setFormError('Por favor ingresa la cédula / documento de identidad.')
      return
    }
    if (!phone.trim()) {
      setFormError('Por favor ingresa el teléfono de contacto.')
      return
    }
    // El backend exige 7-20 dígitos (ClientPhoneNumber); validar acá evita un
    // 400 silencioso que deja el dueño sin crear tras cerrar el modal.
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 7 || phoneDigits.length > 20) {
      setFormError('El teléfono debe tener entre 7 y 20 dígitos.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('El correo es obligatorio: se usa para el código de verificación en el chatbot.')
      return
    }

    onSave({
      name: name.trim(),
      documentId: documentId.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      status,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end modal-backdrop-animate"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:w-[460px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden drawer-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <h2 className="text-xl font-bold text-brand tracking-tight flex items-center gap-2">
            <OwnersIcon className="w-5 h-5 text-terracotta" />
            <span>{editingDueno ? 'Editar Dueño' : 'Registrar Dueño'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form
          id="dueno-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {formError && (
            <div className="p-3 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Nombre Completo <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Carlos Ruiz"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Cédula / Documento <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="1098765432"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Teléfono <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 3001234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Correo electrónico <span className="text-terracotta">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
            <p className="text-[11px] text-sage mt-1">
              Si inicia desde otro teléfono, se envía un código a este correo para ingresarlo en el chatbot.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Dirección</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle 123 #45-67"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bogotá"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EstadoMascota)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            >
              <option value="Activo">Activo (Habilitado)</option>
              <option value="Inactivo">Inactivo (Suspendido)</option>
            </select>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:bg-bone transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="dueno-form"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#B85D43] hover:bg-[#A34E35] text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
          >
            {editingDueno ? 'Guardar Cambios' : 'Registrar Dueño'}
          </button>
        </div>
      </div>
    </div>
  )
}
