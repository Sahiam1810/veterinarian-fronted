import { useState, useEffect, useMemo, type FormEvent } from 'react'
import type { RecepMascotaFormData } from '../types'
import { CloseIcon } from './RecepMascotasIcons'
import { PawIcon } from '@/global/components'

export interface RecepMascotaCatalogOption {
  id: string
  name: string
  speciesId?: string
}

export interface RecepMascotaOwnerOption {
  id: string
  fullName: string
  documentId: string
}

interface RecepMascotaModalProps {
  isOpen: boolean
  isLoading?: boolean
  speciesList: RecepMascotaCatalogOption[]
  racesList: RecepMascotaCatalogOption[]
  duenosList: RecepMascotaOwnerOption[]
  onClose: () => void
  onSave: (data: RecepMascotaFormData) => Promise<void> | void
}

export function RecepMascotaModal({
  isOpen,
  isLoading = false,
  speciesList,
  racesList,
  duenosList,
  onClose,
  onSave,
}: RecepMascotaModalProps) {
  const [name, setName] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [raceId, setRaceId] = useState('')
  const [age, setAge] = useState<number | ''>(1)
  const [gender, setGender] = useState('Hembra')
  const [weight, setWeight] = useState<number | ''>(5)
  const [clientId, setClientId] = useState('')
  const [observations, setObservations] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Filtrar razas según la especie seleccionada
  const availableRaces = useMemo(() => {
    if (!speciesId) return racesList
    const filtered = racesList.filter(
      (r) => r.speciesId && r.speciesId.toLowerCase() === speciesId.toLowerCase(),
    )
    return filtered.length > 0 ? filtered : racesList
  }, [racesList, speciesId])

  useEffect(() => {
    if (!isOpen) return
    const initialSpeciesId = speciesList[0]?.id || ''
    const initialRaces = initialSpeciesId
      ? racesList.filter((r) => r.speciesId && r.speciesId.toLowerCase() === initialSpeciesId.toLowerCase())
      : racesList
    const initialRaceId = initialRaces[0]?.id || racesList[0]?.id || ''

    setName('')
    setSpeciesId(initialSpeciesId)
    setRaceId(initialRaceId)
    setAge(1)
    setGender('Hembra')
    setWeight(5)
    setClientId(duenosList[0]?.id || '')
    setObservations('')
    setError(null)
  }, [isOpen, speciesList, racesList, duenosList])

  // Ajustar raza si la especie cambia y la raza actual no pertenece a esa especie
  const handleSpeciesChange = (newSpeciesId: string) => {
    setSpeciesId(newSpeciesId)
    const matchingRaces = racesList.filter(
      (r) => r.speciesId && r.speciesId.toLowerCase() === newSpeciesId.toLowerCase(),
    )
    setRaceId(matchingRaces[0]?.id || racesList[0]?.id || '')
  }

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Por favor ingresa el nombre de la mascota.')
      return
    }
    if (!clientId) {
      setError('Debes seleccionar un dueño para la mascota.')
      return
    }
    if (!speciesId) {
      setError('Debes seleccionar una especie.')
      return
    }
    if (!raceId) {
      setError('Debes seleccionar una raza.')
      return
    }

    const parsedAge = typeof age === 'number' ? age : parseInt(String(age), 10) || 0
    const parsedWeight = typeof weight === 'number' ? weight : parseFloat(String(weight)) || 0

    if (parsedAge < 0) {
      setError('La edad no puede ser negativa.')
      return
    }
    if (parsedWeight <= 0) {
      setError('El peso debe ser mayor a 0 kg.')
      return
    }

    try {
      setError(null)
      await onSave({
        name: name.trim(),
        speciesId,
        raceId,
        age: parsedAge,
        gender,
        weight: parsedWeight,
        clientId,
        observations: observations.trim() || null,
        photoUrl: null,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la mascota'
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
              <PawIcon className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-brand tracking-tight">
                Registrar Nueva Mascota
              </h2>
              <p className="text-xs text-sage font-medium">
                Ingresa los datos para registrar el paciente y asociarlo a su dueño
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
          id="recep-mascota-form"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 flex-1"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          {/* Dueño / Propietario */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="mascota-clientId">
              Dueño / Propietario <span className="text-brand">*</span>
            </label>
            <select
              id="mascota-clientId"
              required
              disabled={isLoading}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer disabled:bg-bone"
            >
              {duenosList.length === 0 ? (
                <option value="">No hay dueños disponibles</option>
              ) : (
                duenosList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} {d.documentId ? `(Doc: ${d.documentId})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Nombre de la Mascota */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="mascota-name">
              Nombre de la Mascota <span className="text-brand">*</span>
            </label>
            <input
              id="mascota-name"
              type="text"
              required
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Max, Luna, Toby..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone"
            />
          </div>

          {/* Especie y Raza */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="mascota-speciesId">
                Especie <span className="text-brand">*</span>
              </label>
              <select
                id="mascota-speciesId"
                required
                disabled={isLoading}
                value={speciesId}
                onChange={(e) => handleSpeciesChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer disabled:bg-bone"
              >
                {speciesList.length === 0 ? (
                  <option value="">Cargando especies...</option>
                ) : (
                  speciesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="mascota-raceId">
                Raza <span className="text-brand">*</span>
              </label>
              <select
                id="mascota-raceId"
                required
                disabled={isLoading}
                value={raceId}
                onChange={(e) => setRaceId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer disabled:bg-bone"
              >
                {availableRaces.length === 0 ? (
                  <option value="">Sin razas disponibles</option>
                ) : (
                  availableRaces.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Edad, Sexo y Peso */}
          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="mascota-age">
                Edad (años) <span className="text-brand">*</span>
              </label>
              <input
                id="mascota-age"
                type="number"
                min="0"
                step="1"
                required
                disabled={isLoading}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="mascota-gender">
                Sexo <span className="text-brand">*</span>
              </label>
              <select
                id="mascota-gender"
                disabled={isLoading}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer disabled:bg-bone"
              >
                <option value="Hembra">Hembra</option>
                <option value="Macho">Macho</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="mascota-weight">
                Peso (kg) <span className="text-brand">*</span>
              </label>
              <input
                id="mascota-weight"
                type="number"
                min="0.1"
                step="0.1"
                required
                disabled={isLoading}
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition disabled:bg-bone"
              />
            </div>
          </div>

          {/* Observaciones / Alergias */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="mascota-observations">
              Alergias / Observaciones
            </label>
            <textarea
              id="mascota-observations"
              rows={2}
              disabled={isLoading}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej: Alérgico a penicilinas, temperamento nervioso..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none disabled:bg-bone"
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
            form="recep-mascota-form"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-50"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>Registrar Mascota</span>
          </button>
        </div>
      </div>
    </div>
  )
}
