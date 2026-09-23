import { useState, useEffect, type FormEvent } from 'react'
import {
  CalendarIcon,
  CalendarPlusIcon,
  CheckIcon,
  PawIcon,
  SearchIcon,
  StethoscopeIcon,
  UserAvatarIcon,
} from '@/global/components'
import { CloseIcon, PhoneIcon } from './RecepMascotasIcons'
import { ProfessionalCombobox } from '@/modules/superadmin'
import type {
  ApiClientResponse,
} from '@/modules/superadmin/services/superAdminClientsService'
import type {
  ApiSpeciesResponse,
  ApiRaceResponse,
} from '@/modules/superadmin/services/superAdminCatalogService'
import type {
  RecepAgendaServiceOption,
  RecepAgendaProfessionalOption,
  RecepAgendaTimeSlot,
} from '../types'
import {
  fetchClientByPhone,
  createQuickRecepDueno,
  createQuickRecepPet,
  fetchRecepMascotaFormCatalogs,
  fetchRecepAgendaCatalog,
  fetchRecepAvailableTimeSlots,
  createRecepAppointment,
} from '../services'
import { isAppointmentDateInThePast, PAST_APPOINTMENT_MESSAGE } from '@/modules/superadmin/utils/appointmentDateGuard'

interface RecepAgendamientoRapidoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (message: string) => void
}

type WizardStep = 1 | 2 | 3

function todayIsoDateLocal(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(dateValue: string): string {
  if (!dateValue) return ''
  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) return dateValue
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function RecepAgendamientoRapidoModal({
  isOpen,
  onClose,
  onSuccess,
}: RecepAgendamientoRapidoModalProps) {
  // Wizard state
  const [step, setStep] = useState<WizardStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Catalogs
  const [speciesList, setSpeciesList] = useState<ApiSpeciesResponse[]>([])
  const [racesList, setRacesList] = useState<ApiRaceResponse[]>([])
  const [servicesList, setServicesList] = useState<RecepAgendaServiceOption[]>([])
  const [professionalsList, setProfessionalsList] = useState<RecepAgendaProfessionalOption[]>([])

  // Step 1: Dueño
  const [phone, setPhone] = useState('')
  const [isSearchingPhone, setIsSearchingPhone] = useState(false)
  const [phoneSearched, setPhoneSearched] = useState(false)
  const [existingClient, setExistingClient] = useState<ApiClientResponse | null>(null)
  const [ownerFullName, setOwnerFullName] = useState('')

  // Step 2: Mascota
  const [petName, setPetName] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [gender, setGender] = useState<'Hembra' | 'Macho'>('Hembra')

  // Step 3: Cita
  const [serviceId, setServiceId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [dateValue, setDateValue] = useState(todayIsoDateLocal())
  const [timeSlots, setTimeSlots] = useState<RecepAgendaTimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [timeSlotId, setTimeSlotId] = useState('')
  const [notes, setNotes] = useState('')

  // Cargar catálogos iniciales al abrir
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setIsLoadingCatalogs(true)
    setError(null)

    Promise.all([
      fetchRecepMascotaFormCatalogs().catch(() => ({ species: [], races: [], duenos: [] })),
      fetchRecepAgendaCatalog().catch(() => ({ owners: [], pets: [], services: [], professionals: [] })),
    ])
      .then(([petCatalogs, agendaCatalogs]) => {
        if (cancelled) return
        setSpeciesList(petCatalogs.species)
        setRacesList(petCatalogs.races)
        setServicesList(agendaCatalogs.services)
        setProfessionalsList(agendaCatalogs.professionals)

        // Defaults para mascota y cita
        if (petCatalogs.species.length > 0) {
          setSpeciesId(petCatalogs.species[0]?.id || '')
        }
        if (agendaCatalogs.services.length > 0) {
          setServiceId(agendaCatalogs.services[0]?.id || '')
        }
        if (agendaCatalogs.professionals.length > 0) {
          setProfessionalId(agendaCatalogs.professionals[0]?.id || '')
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los catálogos.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCatalogs(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Reset al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setPhone('')
      setPhoneSearched(false)
      setExistingClient(null)
      setOwnerFullName('')
      setPetName('')
      setGender('Hembra')
      setDateValue(todayIsoDateLocal())
      setTimeSlotId('')
      setNotes('')
      setError(null)
    }
  }, [isOpen])

  // Cargar horarios cuando cambia profesional o fecha en paso 3
  useEffect(() => {
    if (!isOpen || step !== 3 || !professionalId || !dateValue) {
      setTimeSlots([])
      return
    }

    let cancelled = false
    setIsLoadingSlots(true)
    fetchRecepAvailableTimeSlots(professionalId, dateValue)
      .then((slots) => {
        if (!cancelled) {
          setTimeSlots(slots)
          // Si el horario seleccionado ya no está disponible, deseleccionarlo
          if (timeSlotId && !slots.some((s) => s.id === timeSlotId && s.available)) {
            setTimeSlotId('')
          }
        }
      })
      .catch(() => {
        if (!cancelled) setTimeSlots([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, step, professionalId, dateValue, timeSlotId])

  if (!isOpen) return null

  // --- Handlers Paso 1: Dueño ---
  const handleSearchPhone = async (phoneToSearch = phone) => {
    const clean = phoneToSearch.trim()
    if (!clean) {
      setError('Ingresa un número de teléfono.')
      return
    }

    setIsSearchingPhone(true)
    setError(null)

    try {
      const client = await fetchClientByPhone(clean)
      setPhoneSearched(true)
      if (client) {
        setExistingClient(client)
        setOwnerFullName(client.fullName)
      } else {
        setExistingClient(null)
        setOwnerFullName('')
      }
    } catch {
      setPhoneSearched(true)
      setExistingClient(null)
    } finally {
      setIsSearchingPhone(false)
    }
  }

  const handlePhoneInputChange = (value: string) => {
    setPhone(value)
    if (phoneSearched) {
      setPhoneSearched(false)
      setExistingClient(null)
    }
  }

  const handleStep1Next = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!phone.trim()) {
      setError('Por favor ingresa el teléfono del dueño.')
      return
    }

    if (!phoneSearched) {
      await handleSearchPhone(phone)
      return
    }

    if (!existingClient && !ownerFullName.trim()) {
      setError('Por favor ingresa el nombre del dueño.')
      return
    }

    setStep(2)
  }

  // --- Handlers Paso 2: Mascota ---
  const handleStep2Next = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!petName.trim()) {
      setError('Por favor ingresa el nombre de la mascota.')
      return
    }
    if (!speciesId) {
      setError('Por favor selecciona una especie.')
      return
    }

    setStep(3)
  }

  // --- Handlers Paso 3: Cita & Submit Global ---
  const handleStep3Confirm = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!serviceId) {
      setError('Por favor selecciona el motivo de consulta / servicio.')
      return
    }
    if (!professionalId) {
      setError('Por favor selecciona un profesional veterinario.')
      return
    }
    if (!dateValue || !timeSlotId) {
      setError('Por favor selecciona la fecha y un horario disponible.')
      return
    }

    if (isAppointmentDateInThePast(dateValue, timeSlotId)) {
      setError(PAST_APPOINTMENT_MESSAGE)
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Resolver o Crear Cliente
      let resolvedClientId = existingClient?.id
      if (!resolvedClientId) {
        const createdOwner = await createQuickRecepDueno(phone, ownerFullName)
        resolvedClientId = createdOwner.clientId
      }

      // 2. Crear Mascota con raza Mestizo, edad 0, peso 0.01 y vincular con cliente
      const createdPet = await createQuickRecepPet({
        name: petName.trim(),
        speciesId,
        gender,
        clientId: resolvedClientId,
        races: racesList,
      })

      // 3. Crear Cita
      await createRecepAppointment({
        ownerQuery: ownerFullName,
        ownerId: resolvedClientId,
        petId: createdPet.id,
        serviceId,
        professionalId,
        dateValue,
        timeSlotId,
        notes: notes.trim() || 'Cita rápida desde recepción',
      })

      onSuccess?.('¡Cita agendada exitosamente!')
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al completar el agendamiento rápido.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSpeciesName = speciesList.find((s) => s.id === speciesId)?.name || 'Especie'
  const selectedServiceName = servicesList.find((s) => s.id === serviceId)?.label || 'Servicio'
  const selectedProfessionalName = professionalsList.find((p) => p.id === professionalId)?.name || 'Veterinario'
  const selectedSlotLabel = timeSlots.find((s) => s.id === timeSlotId)?.displayLabel || timeSlotId

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 modal-backdrop-animate"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-border-tan overflow-hidden modal-content-animate flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-border-tan/70 bg-bone shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center font-extrabold shadow-sm shrink-0">
                <CalendarPlusIcon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-brand tracking-tight truncate">
                  Agendamiento Rápido
                </h2>
                <p className="text-xs text-sage font-medium truncate">
                  Dueño, mascota y cita en un solo flujo continuo
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-sage hover:text-charcoal p-1.5 rounded-lg hover:bg-border-tan/40 transition cursor-pointer disabled:opacity-50 shrink-0"
              aria-label="Cerrar modal"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <nav aria-label="Progreso del agendamiento" className="mt-4 flex items-center justify-between gap-2">
            <StepPill
              stepNumber={1}
              title="Dueño"
              isActive={step === 1}
              isCompleted={step > 1}
              onClick={() => step > 1 && !isSubmitting && setStep(1)}
            />
            <div className={`h-0.5 flex-1 rounded-full transition-colors ${step > 1 ? 'bg-brand' : 'bg-border-tan'}`} />
            <StepPill
              stepNumber={2}
              title="Mascota"
              isActive={step === 2}
              isCompleted={step > 2}
              onClick={() => step > 2 && !isSubmitting && setStep(2)}
            />
            <div className={`h-0.5 flex-1 rounded-full transition-colors ${step > 2 ? 'bg-brand' : 'bg-border-tan'}`} />
            <StepPill
              stepNumber={3}
              title="Cita"
              isActive={step === 3}
              isCompleted={false}
            />
          </nav>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-start gap-2">
              <span className="font-bold shrink-0">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {isLoadingCatalogs && (
            <div className="py-8 text-center text-xs text-sage font-semibold animate-pulse">
              Cargando opciones de agendamiento…
            </div>
          )}

          {!isLoadingCatalogs && (
            <>
              {/* PASO 1: DUEÑO */}
              {step === 1 && (
                <form id="step-1-form" onSubmit={handleStep1Next} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="quick-phone">
                      Teléfono del Dueño <span className="text-brand">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <PhoneIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
                        <input
                          id="quick-phone"
                          type="tel"
                          required
                          autoFocus
                          value={phone}
                          onChange={(e) => handlePhoneInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !phoneSearched) {
                              e.preventDefault()
                              void handleSearchPhone()
                            }
                          }}
                          placeholder="Ej: 3001234567"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSearchPhone()}
                        disabled={isSearchingPhone || !phone.trim()}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sage-soft text-brand hover:bg-brand hover:text-white transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                      >
                        {isSearchingPhone ? (
                          <span className="w-3.5 h-3.5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                        ) : (
                          <SearchIcon className="w-3.5 h-3.5" />
                        )}
                        <span>Buscar</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-sage font-medium mt-1">
                      Buscamos automáticamente si el cliente ya está registrado en el sistema.
                    </p>
                  </div>

                  {phoneSearched && existingClient && (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
                        <CheckIcon className="w-4 h-4 text-emerald-600" />
                        <span>¡Cliente encontrado en el sistema!</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-charcoal pt-1">
                        <div>
                          <span className="text-[10px] text-sage font-bold uppercase block">Nombre</span>
                          <span className="font-bold text-sm text-brand">{existingClient.fullName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-sage font-bold uppercase block">Documento</span>
                          <span className="font-semibold">{existingClient.identificationNumber || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-sage font-bold uppercase block">Teléfono</span>
                          <span className="font-semibold">{existingClient.phoneNumber || phone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-sage font-bold uppercase block">Correo</span>
                          <span className="font-semibold truncate block">{existingClient.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {phoneSearched && !existingClient && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-3">
                      <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                        <span>ℹ️</span>
                        <span>Cliente no registrado previamente</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed text-[11px]">
                        Ingresa solo el nombre. El correo y documento temporal se generarán automáticamente para agendar de inmediato.
                      </p>

                      <div>
                        <label className="block text-xs font-bold text-charcoal mb-1" htmlFor="quick-owner-name">
                          Nombre Completo del Dueño <span className="text-brand">*</span>
                        </label>
                        <div className="relative">
                          <UserAvatarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
                          <input
                            id="quick-owner-name"
                            type="text"
                            required
                            autoFocus
                            value={ownerFullName}
                            onChange={(e) => setOwnerFullName(e.target.value)}
                            placeholder="Ej: Laura Gómez Pérez"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* PASO 2: MASCOTA */}
              {step === 2 && (
                <form id="step-2-form" onSubmit={handleStep2Next} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-sage-soft/60 border border-brand/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-sage font-bold uppercase block">Dueño Asignado</span>
                      <span className="font-extrabold text-brand text-sm">{ownerFullName || 'Cliente'}</span>
                    </div>
                    <span className="text-xs text-sage font-bold">Tel: {phone}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="quick-pet-name">
                      Nombre de la Mascota <span className="text-brand">*</span>
                    </label>
                    <div className="relative">
                      <PawIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
                      <input
                        id="quick-pet-name"
                        type="text"
                        required
                        autoFocus
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Ej: Max, Luna, Toby..."
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="quick-pet-species">
                        Especie <span className="text-brand">*</span>
                      </label>
                      <select
                        id="quick-pet-species"
                        required
                        value={speciesId}
                        onChange={(e) => setSpeciesId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
                      >
                        {speciesList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-charcoal mb-1.5">
                        Sexo <span className="text-brand">*</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setGender('Hembra')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                            gender === 'Hembra'
                              ? 'border-brand bg-brand text-white shadow-xs'
                              : 'border-border-tan bg-white text-charcoal hover:border-brand/40'
                          }`}
                        >
                          Hembra
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('Macho')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                            gender === 'Macho'
                              ? 'border-brand bg-brand text-white shadow-xs'
                              : 'border-border-tan bg-white text-charcoal hover:border-brand/40'
                          }`}
                        >
                          Macho
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-bone border border-border-tan text-xs text-sage space-y-1">
                    <p className="font-semibold text-charcoal/90">
                      ⚡ Autocompletado inteligente:
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      La raza se asignará automáticamente como <strong className="text-brand">Mestizo</strong>. La edad y el peso se marcarán como pendientes para registrarse en consulta.
                    </p>
                  </div>
                </form>
              )}

              {/* PASO 3: CITA */}
              {step === 3 && (
                <form id="step-3-form" onSubmit={handleStep3Confirm} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-sage-soft/60 border border-brand/10 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-sage font-bold uppercase block">Paciente y Dueño</span>
                      <span className="font-extrabold text-brand text-sm">
                        {petName} ({selectedSpeciesName}, {gender})
                      </span>
                    </div>
                    <span className="text-xs text-charcoal/80 font-bold">
                      {ownerFullName} · {phone}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="quick-service">
                        Motivo / Servicio <span className="text-brand">*</span>
                      </label>
                      <ProfessionalCombobox
                        id="quick-service"
                        value={serviceId}
                        onChange={setServiceId}
                        options={servicesList.map((s) => ({ id: s.id, name: s.label }))}
                        hasAllOption={false}
                        placeholder="Seleccionar motivo..."
                        searchPlaceholder="Buscar motivo..."
                        className="w-full bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="quick-vet">
                        Veterinario Asignado <span className="text-brand">*</span>
                      </label>
                      <ProfessionalCombobox
                        id="quick-vet"
                        value={professionalId}
                        onChange={setProfessionalId}
                        options={professionalsList.map((p) => ({
                          id: p.id,
                          name: p.name,
                          subtitle: p.roleLabel,
                        }))}
                        hasAllOption={false}
                        placeholder="Seleccionar profesional..."
                        searchPlaceholder="Buscar veterinario..."
                        className="w-full bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="quick-date">
                        Fecha de la Cita <span className="text-brand">*</span>
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
                        <input
                          id="quick-date"
                          type="date"
                          required
                          min={todayIsoDateLocal()}
                          value={dateValue}
                          onChange={(e) => setDateValue(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-charcoal mb-1.5">
                        Horarios Disponibles <span className="text-brand">*</span>
                      </span>
                      {isLoadingSlots ? (
                        <p className="text-xs text-sage font-medium py-2">Cargando horarios disponibles…</p>
                      ) : timeSlots.length === 0 ? (
                        <p className="text-xs text-sage font-medium py-2">
                          Sin disponibilidad para la fecha seleccionada.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                          {timeSlots.map((slot) => {
                            const isSelected = timeSlotId === slot.id
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={!slot.available}
                                onClick={() => setTimeSlotId(slot.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                                  !slot.available
                                    ? 'border-border-tan/50 text-sage/40 bg-bone cursor-not-allowed'
                                    : isSelected
                                      ? 'border-brand bg-sage-soft text-brand font-extrabold'
                                      : 'border-border-tan bg-white text-charcoal hover:border-brand/40 cursor-pointer'
                                }`}
                              >
                                {slot.label}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1.5" htmlFor="quick-notes">
                      Notas Adicionales (Opcional)
                    </label>
                    <textarea
                      id="quick-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observaciones para el médico veterinario..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
                    />
                  </div>

                  {/* Resumen Final */}
                  <div className="p-3.5 rounded-2xl bg-mint-soft/40 border border-brand/15 text-xs space-y-1.5">
                    <div className="font-extrabold text-brand flex items-center gap-1.5">
                      <StethoscopeIcon className="w-4 h-4 text-brand" />
                      <span>Resumen de la Cita a Confirmar</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-charcoal/90 pt-1">
                      <div>
                        <span className="text-sage block">Servicio:</span>
                        <strong>{selectedServiceName}</strong>
                      </div>
                      <div>
                        <span className="text-sage block">Veterinario:</span>
                        <strong>{selectedProfessionalName}</strong>
                      </div>
                      <div>
                        <span className="text-sage block">Fecha:</span>
                        <strong>{formatDisplayDate(dateValue)}</strong>
                      </div>
                      <div>
                        <span className="text-sage block">Hora:</span>
                        <strong>{selectedSlotLabel || 'Seleccionar hora'}</strong>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-border-tan/70 bg-white shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as WizardStep)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:bg-bone transition cursor-pointer disabled:opacity-50"
              >
                ← Atrás
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:bg-bone transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>

          <div>
            {step === 1 && (
              <button
                type="submit"
                form="step-1-form"
                disabled={isSearchingPhone || !phone.trim() || (phoneSearched && !existingClient && !ownerFullName.trim())}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span>Continuar a Mascota →</span>
              </button>
            )}

            {step === 2 && (
              <button
                type="submit"
                form="step-2-form"
                disabled={!petName.trim() || !speciesId}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span>Continuar a Cita →</span>
              </button>
            )}

            {step === 3 && (
              <button
                type="submit"
                form="step-3-form"
                disabled={isSubmitting || !serviceId || !professionalId || !timeSlotId}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>Confirmar y Agendar Cita</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepPill({
  stepNumber,
  title,
  isActive,
  isCompleted,
  onClick,
}: {
  stepNumber: number
  title: string
  isActive: boolean
  isCompleted: boolean
  onClick?: () => void
}) {
  const isClickable = Boolean(onClick && isCompleted)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
        isActive
          ? 'bg-brand text-white shadow-xs'
          : isCompleted
            ? 'bg-sage-soft text-brand hover:bg-brand hover:text-white cursor-pointer'
            : 'text-sage/60 bg-transparent cursor-default'
      }`}
    >
      <span
        className={`w-4.5 h-4.5 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
          isActive
            ? 'bg-white text-brand'
            : isCompleted
              ? 'bg-brand text-white'
              : 'bg-border-tan text-sage'
        }`}
      >
        {isCompleted ? '✓' : stepNumber}
      </span>
      <span>{title}</span>
    </button>
  )
}
