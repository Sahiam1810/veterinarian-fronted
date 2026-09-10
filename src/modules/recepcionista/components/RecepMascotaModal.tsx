import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { PawIcon } from '@/global/components'
import { CloseIcon } from './RecepMascotasIcons'
import {
  fetchRecepPetFormData,
  type RecepPetFormData,
} from '../services/recepMascotasService'
import type { ApiSpeciesResponse, ApiRaceResponse } from '@/modules/superadmin/services/superAdminCatalogService'
import type { ApiClientResponse } from '@/modules/superadmin/services/superAdminClientsService'

interface RecepMascotaModalProps {
  isOpen: boolean
  isLoading?: boolean
  onClose: () => void
  onSave: (data: RecepPetFormData) => Promise<void> | void
}

export function RecepMascotaModal({
  isOpen,
  isLoading = false,
  onClose,
  onSave,
}: RecepMascotaModalProps) {
  const [name, setName] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [raceId, setRaceId] = useState('')
  const [age, setAge] = useState('1')
  const [gender, setGender] = useState('Hembra')
  const [weight, setWeight] = useState('')
  const [clientId, setClientId] = useState('')
  const [observations, setObservations] = useState('')

  const [speciesList, setSpeciesList] = useState<ApiSpeciesResponse[]>([])
  const [racesList, setRacesList] = useState<ApiRaceResponse[]>([])
  const [clientsList, setClientsList] = useState<ApiClientResponse[]>([])

  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carga catálogos al abrir el modal
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setIsLoadingCatalogs(true)
    setError(null)

    void fetchRecepPetFormData()
      .then((data) => {
        if (cancelled) return
        setSpeciesList(data.species)
        setRacesList(data.races)
        setClientsList(data.clients)

        // Valores por defecto
        if (data.species.length > 0) {
          const firstSp = data.species[0]
          setSpeciesId(firstSp.id)
          const filteredRaces = data.races.filter(
            (r) => r.speciesId.toLowerCase() === firstSp.id.toLowerCase(),
          )
          setRaceId(filteredRaces[0]?.id || '')
        }
        if (data.clients.length > 0) {
          setClientId(data.clients[0].id)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar opciones del formulario',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCatalogs(false)
      })

    // Reset campos
    setName('')
    setAge('1')
    setGender('Hembra')
    setWeight('')
    setObservations('')

    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Razas filtradas por especie seleccionada
  const racesForSpecies = useMemo(() => {
    if (!speciesId) return racesList
    return racesList.filter(
      (r) => r.speciesId.toLowerCase() === speciesId.toLowerCase(),
    )
  }, [speciesId, racesList])

  const handleSpeciesChange = (newSpeciesId: string) => {
    setSpeciesId(newSpeciesId)
    const filtered = racesList.filter(
      (r) => r.speciesId.toLowerCase() === newSpeciesId.toLowerCase(),
    )
    setRaceId(filtered[0]?.id || '')
  }

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Por favor ingresa el nombre de la mascota.')
      return
    }
    if (!speciesId) {
      setError('Por favor selecciona una especie.')
      return
    }
    if (!raceId) {
      setError('Por favor selecciona una raza.')
      return
    }
    if (!clientId) {
      setError('Por favor selecciona el dueño responsable de la mascota.')
      return
    }

    const parsedAge = parseInt(age, 10)
    if (isNaN(parsedAge) || parsedAge < 0) {
      setError('Por favor ingresa una edad válida en años.')
      return
    }

    const parsedWeight = parseFloat(weight.replace(',', '.'))
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      setError('Por favor ingresa un peso válido en kg.')
      return
    }

    setError(null)
    try {
      await onSave({
        name: name.trim(),
        speciesId,
        raceId,
        age: parsedAge,
        gender,
        weight: parsedWeight,
        observations: observations.trim() || undefined,
        clientId,
      })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error al registrar la mascota'
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
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border-tan overflow-hidden modal-content-animate flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-tan/70 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-ochre/20 text-ochre-dark flex items-center justify-center font-extrabold">
              <PawIcon className="w-4.5 h-4.5 text-ochre" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-brand tracking-tight">
                Registrar Nueva Mascota
              </h2>
              <p className="text-xs text-sage font-medium">
                Ingresa los datos para control veterinario e historial clínico
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

          {isLoadingCatalogs ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
              <p className="text-xs text-sage font-medium">Cargando opciones…</p>
            </div>
          ) : (
            <>
              {/* Nombre */}
              <div>
                <label
                  className="block text-xs font-bold text-charcoal mb-1.5"
                  htmlFor="mascota-name"
                >
                  Nombre de la Mascota <span className="text-brand">*</span>
                </label>
                <input
                  id="mascota-name"
                  type="text"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Bruno, Luna, Toby..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal placeholder:text-text-placeholder focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                />
              </div>

              {/* Dueño responsable (lista desplegable) */}
              <div>
                <label
                  className="block text-xs font-bold text-charcoal mb-1.5"
                  htmlFor="mascota-owner"
                >
                  Dueño Responsable <span className="text-brand">*</span>
                </label>
                <select
                  id="mascota-owner"
                  required
                  disabled={isLoading || clientsList.length === 0}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm font-semibold text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
                >
                  {clientsList.length === 0 ? (
                    <option value="">Sin dueños registrados</option>
                  ) : (
                    clientsList.map((client) => {
                      const nameDisplay =
                        client.fullName ||
                        (client.identificationNumber
                          ? `Cliente ${client.identificationNumber}`
                          : 'Cliente Sin Nombre')
                      return (
                        <option key={client.id} value={client.id}>
                          {nameDisplay} (
                          {client.phoneNumber ? `Tel: ${client.phoneNumber}` : 'Sin tel'} · CC{' '}
                          {client.identificationNumber || 'N/A'})
                        </option>
                      )
                    })
                  )}
                </select>
              </div>

              {/* Especie y Raza */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-bold text-charcoal mb-1.5"
                    htmlFor="mascota-species"
                  >
                    Especie <span className="text-brand">*</span>
                  </label>
                  <select
                    id="mascota-species"
                    required
                    disabled={isLoading || speciesList.length === 0}
                    value={speciesId}
                    onChange={(e) => handleSpeciesChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm font-semibold text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
                  >
                    {speciesList.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-charcoal mb-1.5"
                    htmlFor="mascota-race"
                  >
                    Raza <span className="text-brand">*</span>
                  </label>
                  <select
                    id="mascota-race"
                    required
                    disabled={isLoading || racesForSpecies.length === 0}
                    value={raceId}
                    onChange={(e) => setRaceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm font-semibold text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
                  >
                    {racesForSpecies.length === 0 ? (
                      <option value="">Sin razas disponibles</option>
                    ) : (
                      racesForSpecies.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Edad, Sexo, Peso */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    className="block text-xs font-bold text-charcoal mb-1.5"
                    htmlFor="mascota-age"
                  >
                    Edad (años) <span className="text-brand">*</span>
                  </label>
                  <input
                    id="mascota-age"
                    type="number"
                    min="0"
                    max="40"
                    required
                    disabled={isLoading}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ej. 2"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-charcoal mb-1.5"
                    htmlFor="mascota-gender"
                  >
                    Sexo <span className="text-brand">*</span>
                  </label>
                  <select
                    id="mascota-gender"
                    required
                    disabled={isLoading}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm font-semibold text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
                  >
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-charcoal mb-1.5"
                    htmlFor="mascota-weight"
                  >
                    Peso (kg) <span className="text-brand">*</span>
                  </label>
                  <input
                    id="mascota-weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    disabled={isLoading}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ej. 12.5"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label
                  className="block text-xs font-bold text-charcoal mb-1.5"
                  htmlFor="mascota-notes"
                >
                  Observaciones Clínicas / Alergias
                </label>
                <textarea
                  id="mascota-notes"
                  rows={2}
                  disabled={isLoading}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Vacunas pendientes, alergias alimentarias, carácter..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-bone/30 text-sm text-charcoal placeholder:text-text-placeholder focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-sage hover:text-charcoal hover:bg-bone transition cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="recep-mascota-form"
            disabled={isLoading || isLoadingCatalogs}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
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
