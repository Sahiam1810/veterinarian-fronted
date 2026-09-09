import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import type { ApiClient, ApiNamedCatalog } from '../api/apiTypes'
import { CloseIcon } from './MascotasIcons'
import { PawIcon } from '@/global/components'

export interface VetMascotaFormData {
  name: string
  speciesId: string
  raceId: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  clientId?: string
  photoUrl?: string | null
}

interface VetMascotaModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialData?: VetMascotaFormData | null
  speciesList: ApiNamedCatalog[]
  racesList: ApiNamedCatalog[]
  clientsList: ApiClient[]
  onClose: () => void
  onSubmit: (data: VetMascotaFormData) => Promise<void>
}

export function VetMascotaModal({
  isOpen,
  mode,
  initialData,
  speciesList,
  racesList,
  clientsList,
  onClose,
  onSubmit,
}: VetMascotaModalProps) {
  const [name, setName] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [raceId, setRaceId] = useState('')
  const [age, setAge] = useState<number | ''>(1)
  const [gender, setGender] = useState('Hembra')
  const [weight, setWeight] = useState<number | ''>(5.0)
  const [clientId, setClientId] = useState('')
  const [observations, setObservations] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name || '')
        setSpeciesId(initialData.speciesId || speciesList[0]?.id || '')
        setRaceId(initialData.raceId || racesList[0]?.id || '')
        setAge(typeof initialData.age === 'number' ? initialData.age : 1)
        setGender(
          initialData.gender?.toLowerCase().includes('h') || initialData.gender === 'Hembra'
            ? 'Hembra'
            : 'Macho'
        )
        setWeight(typeof initialData.weight === 'number' ? initialData.weight : 5)
        setClientId(initialData.clientId || '')
        setObservations(initialData.observations || '')
        setPhotoUrl(initialData.photoUrl || '')
      } else {
        setName('')
        setSpeciesId(speciesList[0]?.id || '')
        setRaceId(racesList[0]?.id || '')
        setAge(1)
        setGender('Hembra')
        setWeight(5)
        setClientId(clientsList[0]?.id || '')
        setObservations('')
        setPhotoUrl('')
      }
      setFormError(null)
    }
  }, [isOpen, mode, initialData, speciesList, racesList, clientsList])

  // Evitar speciesId o raceId vacíos si hay opciones
  useEffect(() => {
    if (!speciesId && speciesList.length > 0) {
      setSpeciesId(speciesList[0].id)
    }
    if (!raceId && racesList.length > 0) {
      setRaceId(racesList[0].id)
    }
  }, [speciesId, raceId, speciesList, racesList])

  if (!isOpen || typeof document === 'undefined') return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('El nombre de la mascota es obligatorio.')
      return
    }
    if (!speciesId) {
      setFormError('Debes seleccionar una especie.')
      return
    }
    if (!raceId) {
      setFormError('Debes seleccionar una raza.')
      return
    }

    const parsedAge = typeof age === 'number' ? age : parseInt(String(age), 10) || 0
    const parsedWeight = typeof weight === 'number' ? weight : parseFloat(String(weight)) || 0

    if (parsedAge < 0) {
      setFormError('La edad no puede ser negativa.')
      return
    }
    if (parsedWeight <= 0) {
      setFormError('El peso debe ser mayor a 0 kg.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        speciesId,
        raceId,
        age: parsedAge,
        gender,
        weight: parsedWeight,
        observations: observations.trim() || null,
        clientId: clientId || undefined,
        photoUrl: photoUrl.trim() || null,
      })
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la mascota'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
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
        className="w-full max-w-lg bg-white rounded-3xl border border-border-tan shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-border-tan/60 bg-bone/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <PawIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand tracking-tight">
                {mode === 'create' ? 'Registrar Nueva Mascota' : `Editar Mascota: ${initialData?.name || ''}`}
              </h2>
              <p className="text-xs text-sage font-medium">
                {mode === 'create'
                  ? 'Ingresa los datos para registrar el paciente en el sistema'
                  : 'Modifica los datos del paciente'}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {formError && (
            <div className="rounded-xl bg-terracotta-soft border border-terracotta/25 p-3 text-xs text-terracotta font-semibold">
              {formError}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">
              Nombre de la Mascota <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Lucas, Luna, Max..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition"
            />
          </div>

          {/* Especie y Raza */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Especie <span className="text-terracotta">*</span>
              </label>
              <select
                required
                value={speciesId}
                onChange={(e) => setSpeciesId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition cursor-pointer"
              >
                {speciesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Raza <span className="text-terracotta">*</span>
              </label>
              <select
                required
                value={raceId}
                onChange={(e) => setRaceId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition cursor-pointer"
              >
                {racesList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Edad, Sexo y Peso */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Edad (años) <span className="text-terracotta">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Sexo <span className="text-terracotta">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition cursor-pointer"
              >
                <option value="Hembra">Hembra</option>
                <option value="Macho">Macho</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Peso (kg) <span className="text-terracotta">*</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Dueño / Cliente (solo en modo creación o editable si hay clientes) */}
          {mode === 'create' && clientsList.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Propietario / Cliente
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition cursor-pointer"
              >
                <option value="">Sin propietario asignado</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.identificationNumber ? `Cliente Doc: ${c.identificationNumber}` : `Cliente ID: ${c.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Observaciones / Alergias */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">
              Alergias / Observaciones Clínicas
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej. Alérgica a penicilinas, piel sensible..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition resize-none"
            />
          </div>

          {/* Footer botones */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-tan/60 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando…</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Crear Mascota' : 'Guardar Cambios'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
