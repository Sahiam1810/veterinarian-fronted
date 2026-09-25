import { useState, useEffect } from 'react'
import {
  fetchAdmissionOptions,
  admitStay,
} from '../services/hospitalizacionService'
import { validateAdmissionForm } from '../utils/hospitalizacionDays'
import type { HospitalizationAdmissionOption } from '../types/hospitalizacion.types'
import { ProfessionalCombobox } from '../../superadmin/components/ProfessionalCombobox'
import { PawIcon, PlusIcon } from '../../../global/components/Icons.tsx'
import { ViewPopup } from '../../veterinario/components/ViewPopup'
import { CloseIcon } from '../../veterinario/components/MascotasIcons'

export interface AdmitirMascotaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdmitirMascotaModal({
  isOpen,
  onClose,
  onSuccess,
}: AdmitirMascotaModalProps) {
  const [pets, setPets] = useState<HospitalizationAdmissionOption[]>([])
  const [isLoadingPets, setIsLoadingPets] = useState(false)
  const [loadPetsError, setLoadPetsError] = useState<string | null>(null)

  const [selectedClientPetId, setSelectedClientPetId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setIsLoadingPets(true)
    setLoadPetsError(null)
    setFormError(null)
    setSelectedClientPetId('')
    setMotivo('')

    async function loadOptions() {
      try {
        const list = await fetchAdmissionOptions()
        if (!cancelled) {
          setPets(list)
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Error al cargar las mascotas para admisión.'
          setLoadPetsError(msg)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPets(false)
        }
      }
    }

    void loadOptions()
    return () => {
      cancelled = true
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const validation = validateAdmissionForm(selectedClientPetId, motivo)
    if (!validation.ok) {
      setFormError(validation.error || 'Por favor completa los campos obligatorios.')
      return
    }

    setIsSubmitting(true)
    try {
      await admitStay({
        clientPetId: selectedClientPetId,
        appointmentId: null,
        motivo: motivo.trim(),
      })

      // Limpiar formulario y notificar éxito
      setSelectedClientPetId('')
      setMotivo('')
      onSuccess()
      onClose()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error al admitir la mascota.'
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
        animationKey="admitir-mascota-modal"
        className="relative z-10 w-full max-w-lg max-h-[min(94dvh,750px)] min-h-0 flex flex-col"
      >
        <div className="bg-bone border border-border-tan rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(94dvh,750px)]">
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border-tan bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-sage-soft text-brand flex items-center justify-center shrink-0">
                <PawIcon className="w-5 h-5 text-brand" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-brand tracking-tight truncate">
                  Admitir Mascota a Hospitalización
                </h2>
                <p className="text-xs text-sage font-medium truncate">
                  Ingreso directo de paciente a estancia hospitalaria.
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
              {loadPetsError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs sm:text-sm font-medium"
                >
                  {loadPetsError}
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs sm:text-sm font-medium leading-snug"
                >
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-sage mb-1.5 uppercase tracking-wider">
                  Mascota a Hospitalizar *
                </label>
                <ProfessionalCombobox
                  value={selectedClientPetId}
                  onChange={(val) => setSelectedClientPetId(val)}
                  options={pets.map((p) => ({
                    id: p.clientPetId,
                    name: p.petName,
                    subtitle: `Propietario: ${p.ownerName}`,
                  }))}
                  hasAllOption={false}
                  disabled={isLoadingPets || isSubmitting || pets.length === 0}
                  placeholder={
                    isLoadingPets
                      ? 'Cargando listado de mascotas…'
                      : pets.length === 0
                        ? 'No hay mascotas disponibles para admisión'
                        : 'Selecciona una mascota…'
                  }
                  searchPlaceholder="Buscar mascota o dueño por nombre…"
                  className="w-full bg-white"
                />
                {!isLoadingPets && !loadPetsError && pets.length === 0 && (
                  <p className="text-xs text-sage mt-1.5 font-medium">
                    No hay mascotas disponibles para admisión hospitalaria.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-sage mb-1.5 uppercase tracking-wider">
                  Motivo de Hospitalización *
                </label>
                <textarea
                  rows={4}
                  required
                  disabled={isSubmitting}
                  placeholder="Describe la condición médica del paciente, diagnóstico presuntivo o motivo de internación…"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand resize-none placeholder:text-text-placeholder disabled:opacity-60"
                />
              </div>
            </div>

            {/* Footer */}
            <footer className="shrink-0 flex items-center justify-end gap-2.5 p-3 sm:p-4 border-t border-border-tan bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal text-xs sm:text-sm font-bold hover:bg-bone transition cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isLoadingPets || !selectedClientPetId || !motivo.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Admitiendo…</span>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    <span>Admitir Mascota</span>
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
