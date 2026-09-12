import React, { useState, useEffect, useMemo, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import type { AuxDayAppointment } from '../types'
import { 
  fetchClients, 
  fetchClientPets, 
  fetchServices, 
  fetchVeterinarians, 
  fetchStatusAppointments,
  fetchAvailabilities,
  fetchAvailableSlots
} from '../services/auxCatalogosService'
import { createAppointment } from '../services/auxCitasService'
import { fetchPets } from '../services/auxMascotasService'
import type { 
  ApiClientResponse, 
  ApiClientPetResponse, 
  ApiPetResponse,
  ApiServiceResponse,
  ApiVeterinarianResponse,
  ApiStatusAppointmentResponse,
  ApiAvailabilityResponse,
  ApiAvailableSlotResponse
} from '../types'

export interface NuevaCitaDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newAppointment: AuxDayAppointment) => void
}

class DrawerErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onClose: () => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Drawer render error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full sm:w-[480px] bg-white h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h2 className="text-lg font-bold text-red-700">Error al desplegar formulario</h2>
                <button
                  type="button"
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                    this.props.onClose()
                  }}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed mb-3">
                Ocurrió un error inesperado al procesar los datos de la cita:
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-mono break-all">
                {String(this.state.error?.message || this.state.error || 'Error desconocido')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                this.props.onClose()
              }}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition"
            >
              Cerrar Panel
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const getTodayDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatSlotTime = (utcIso?: string | null) => {
  if (!utcIso) return '--:--'
  try {
    const d = new Date(utcIso)
    if (Number.isNaN(d.getTime())) return '--:--'
    return d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota',
    })
  } catch {
    try {
      const d = new Date(utcIso)
      if (Number.isNaN(d.getTime())) return '--:--'
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '--:--'
    }
  }
}

export function NuevaCitaDrawer({
  isOpen,
  onClose,
  onSave,
}: NuevaCitaDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  // API Data
  const [clients, setClients] = useState<ApiClientResponse[]>([])
  const [clientPets, setClientPets] = useState<ApiClientPetResponse[]>([])
  const [pets, setPets] = useState<ApiPetResponse[]>([])
  const [services, setServices] = useState<ApiServiceResponse[]>([])
  const [veterinarians, setVeterinarians] = useState<ApiVeterinarianResponse[]>([])
  const [statusAppointments, setStatusAppointments] = useState<ApiStatusAppointmentResponse[]>([])
  const [availabilities, setAvailabilities] = useState<ApiAvailabilityResponse[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Campos del formulario
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedPetId, setSelectedPetId] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedVeterinarianId, setSelectedVeterinarianId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayDateString)
  const [availableSlots, setAvailableSlots] = useState<ApiAvailableSlotResponse[]>([])
  const [selectedSlot, setSelectedSlot] = useState<ApiAvailableSlotResponse | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Cargar catálogos al abrir el drawer
  useEffect(() => {
    if (isOpen) {
      const loadApiData = async () => {
        setIsLoadingData(true)
        try {
          const [
            clientsRes,
            clientPetsRes,
            petsRes,
            servicesRes,
            vetsRes,
            statusRes,
            availRes
          ] = await Promise.allSettled([
            fetchClients(),
            fetchClientPets(),
            fetchPets(),
            fetchServices(),
            fetchVeterinarians(),
            fetchStatusAppointments(),
            fetchAvailabilities(),
          ])
          
          const clientsData = clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value) ? clientsRes.value : []
          const clientPetsData = clientPetsRes.status === 'fulfilled' && Array.isArray(clientPetsRes.value) ? clientPetsRes.value : []
          const petsData = petsRes.status === 'fulfilled' && Array.isArray(petsRes.value) ? petsRes.value : []
          const servicesData = servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value) ? servicesRes.value : []
          const vetsData = vetsRes.status === 'fulfilled' && Array.isArray(vetsRes.value) ? vetsRes.value : []
          const statusData = statusRes.status === 'fulfilled' && Array.isArray(statusRes.value) ? statusRes.value : []
          const availData = availRes.status === 'fulfilled' && Array.isArray(availRes.value) ? availRes.value : []

          setClients(clientsData)
          setClientPets(clientPetsData)
          setPets(petsData)
          setServices(servicesData)
          setVeterinarians(vetsData)
          setStatusAppointments(statusData)
          setAvailabilities(availData)
          
          // Preseleccionar primer servicio y profesional si están disponibles
          if (servicesData.length > 0) {
            setSelectedServiceId((prev) => prev || servicesData[0].id)
          }
          if (vetsData.length > 0) {
            setSelectedVeterinarianId((prev) => prev || vetsData[0].id)
          }
          
          if (vetsData.length === 0) {
            setFormError('No hay veterinarios activos registrados en el sistema.')
          }
        } catch (error) {
          console.error('Error loading API data:', error)
          setFormError('Error al cargar los catálogos del sistema.')
        } finally {
          setIsLoadingData(false)
        }
      }
      loadApiData()
    }
  }, [isOpen])

  // Reset al abrir / cerrar
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setSelectedClientId('')
      setSelectedPetId('')
      setSelectedDate(getTodayDateString())
      setSelectedSlot(null)
      setAvailableSlots([])
      setNotes('')
      setFormError(null)
      setIsSubmitting(false)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Reset de mascota al cambiar cliente
  useEffect(() => {
    if (selectedClientId) {
      setSelectedPetId('')
    }
  }, [selectedClientId])

  // Cargar turnos reales cuando cambia veterinario, fecha o servicio
  useEffect(() => {
    if (!isOpen || !selectedVeterinarianId || !selectedDate) {
      setAvailableSlots([])
      setSelectedSlot(null)
      return
    }

    let isMounted = true
    const loadSlots = async () => {
      setIsLoadingSlots(true)
      setSelectedSlot(null)
      try {
        const slots = await fetchAvailableSlots(
          selectedVeterinarianId,
          selectedDate,
          selectedServiceId || undefined
        )
        if (isMounted) {
          setAvailableSlots(Array.isArray(slots) ? slots : [])
        }
      } catch (err) {
        console.error('Error fetching available slots:', err)
        if (isMounted) {
          setAvailableSlots([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false)
        }
      }
    }

    loadSlots()

    return () => {
      isMounted = false
    }
  }, [isOpen, selectedVeterinarianId, selectedDate, selectedServiceId])

  // Colecciones seguras
  const safeClients = Array.isArray(clients) ? clients : []
  const safePets = Array.isArray(pets) ? pets : []
  const safeClientPets = Array.isArray(clientPets) ? clientPets : []
  const safeServices = Array.isArray(services) ? services : []
  const safeVets = Array.isArray(veterinarians) ? veterinarians : []
  const safeAvails = Array.isArray(availabilities) ? availabilities : []
  const safeSlots = Array.isArray(availableSlots) ? availableSlots : []

  // Mascotas filtradas por cliente seleccionado
  const petsForClient = useMemo(() => {
    if (!selectedClientId) return []
    return safeClientPets
      .filter(cp => String(cp?.clientId || '').toLowerCase() === selectedClientId.toLowerCase())
      .map(cp => safePets.find(p => String(p?.id || '').toLowerCase() === String(cp?.petId || '').toLowerCase()))
      .filter((p): p is ApiPetResponse => p !== undefined && p !== null)
  }, [selectedClientId, safeClientPets, safePets])

  // Resumen de días y horarios en que atiende el profesional seleccionado
  const shortDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const vetWorkingSummary = useMemo(() => {
    if (!selectedVeterinarianId) return null
    const vetAvails = safeAvails.filter(
      a => String(a?.veterinarianId || '').toLowerCase() === selectedVeterinarianId.toLowerCase() && a?.isActive
    )
    if (vetAvails.length === 0) return null

    const sorted = [...vetAvails].sort((a, b) => Number(a?.dayOfWeek || 0) - Number(b?.dayOfWeek || 0))
    const days = sorted.map(a => shortDayNames[Number(a?.dayOfWeek)] || String(a?.dayOfWeek || '')).join(', ')
    const first = sorted[0]
    const fmt = (t: any) => (typeof t === 'string' ? t.slice(0, 5) : String(t || ''))
    const start = fmt(first?.startTime)
    const end = fmt(first?.endTime)
    return `Atiende: ${days}${start && end ? ` (${start} a ${end})` : ''}`
  }, [selectedVeterinarianId, safeAvails])

  // Cliente y mascota seleccionados
  const selectedClient = safeClients.find(c => String(c?.id || '').toLowerCase() === String(selectedClientId || '').toLowerCase())
  const selectedPet = safePets.find(p => String(p?.id || '').toLowerCase() === String(selectedPetId || '').toLowerCase())

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  // Navegar fecha por días
  const adjustDateByDays = (days: number) => {
    try {
      const [y, m, d] = (selectedDate || getTodayDateString()).split('-').map(Number)
      const target = new Date(y, m - 1, d)
      target.setDate(target.getDate() + days)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      target.setHours(0, 0, 0, 0)
      
      if (target >= today) {
        const year = target.getFullYear()
        const month = String(target.getMonth() + 1).padStart(2, '0')
        const day = String(target.getDate()).padStart(2, '0')
        setSelectedDate(`${year}-${month}-${day}`)
      }
    } catch {
      setSelectedDate(getTodayDateString())
    }
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      setFormError('Por favor selecciona un cliente.')
      return
    }

    if (!selectedPetId) {
      setFormError('Por favor selecciona una mascota.')
      return
    }

    if (!selectedServiceId) {
      setFormError('Por favor selecciona un servicio.')
      return
    }

    if (!selectedVeterinarianId) {
      setFormError('Por favor selecciona un profesional.')
      return
    }

    if (!selectedSlot) {
      setFormError('Por favor selecciona un horario disponible de la lista.')
      return
    }

    // Buscar relación cliente-mascota
    const clientPet = safeClientPets.find(
      cp => String(cp?.clientId || '').toLowerCase() === selectedClientId.toLowerCase() &&
            String(cp?.petId || '').toLowerCase() === selectedPetId.toLowerCase()
    )

    if (!clientPet) {
      setFormError('No se encontró la vinculación entre el cliente y la mascota.')
      return
    }

    // Estado 'Agendado'
    const agendadoStatus = statusAppointments.find(s => 
      s.name?.toLowerCase().includes('agend')
    ) || statusAppointments[0]

    if (!agendadoStatus) {
      setFormError('No hay catálogo de estados de cita disponible.')
      return
    }

    // Teléfono del cliente
    const requesterPhone = selectedClient?.phoneNumber || undefined

    setIsSubmitting(true)
    setFormError(null)

    try {
      await createAppointment({
        clientPetId: clientPet.id,
        veterinarianId: selectedVeterinarianId,
        serviceId: selectedServiceId,
        statusId: agendadoStatus.id,
        availabilityId: selectedSlot.availabilityId,
        scheduledStart: selectedSlot.scheduledStartUtc,
        scheduledEnd: selectedSlot.scheduledEndUtc,
        notes: notes.trim() || undefined,
        requesterPhoneNumber: requesterPhone,
        consultingRoom: selectedSlot.consultingRoom || undefined,
      })

      // Cita local formateada para UI
      const startTimeFormatted = formatSlotTime(selectedSlot.scheduledStartUtc)
      const endTimeFormatted = formatSlotTime(selectedSlot.scheduledEndUtc)
      const displayTime = `${startTimeFormatted} - ${endTimeFormatted}`

      const newAppointment: AuxDayAppointment = {
        id: `apt-${Date.now()}`,
        time: displayTime,
        petName: selectedPet?.name || 'Mascota',
        petInitial: selectedPet?.name?.charAt(0).toUpperCase() || 'M',
        avatarColor: 'brand',
        speciesBreed: selectedPet?.name || 'Mascota',
        service: safeServices.find(s => s.id === selectedServiceId)?.name || 'Servicio',
        professional: safeVets.find(v => v.id === selectedVeterinarianId)?.userFullName || 'Veterinario',
        status: 'Agendada',
        pretriajeStatus: 'Pendiente',
        ownerName: selectedClient?.fullName || selectedClient?.userId || 'Cliente',
        notes: notes.trim() || undefined,
        clientPetId: clientPet.id,
        petId: selectedPetId,
        veterinarianId: selectedVeterinarianId,
        serviceId: selectedServiceId,
      }

      onSave(newAppointment)
      handleClose()
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      const msg = error?.message || 'Error al agendar la cita. Por favor intenta con otro turno.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Nombre legible del día seleccionado (ej: "Viernes, 11 de Sept")
  const dayFullNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const formattedSelectedDay = (() => {
    try {
      const [y, m, d] = (selectedDate || getTodayDateString()).split('-').map(Number)
      const dt = new Date(y, m - 1, d)
      const weekday = dayFullNames[dt.getDay()] || 'Fecha'
      return `${weekday}, ${d} de ${dt.toLocaleString('es-ES', { month: 'short' })}`
    } catch {
      return selectedDate
    }
  })()

  const drawerContent = (
    <DrawerErrorBoundary onClose={handleClose}>
      <div
        className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
          isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
        }`}
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-nueva-cita-title"
      >
        <div
          className={`w-full sm:w-[480px] lg:w-[540px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
            isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Header fijo del Drawer */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-border-tan/70 bg-white">
            <div className="flex flex-col">
              <h2
                id="drawer-nueva-cita-title"
                className="text-xl sm:text-2xl font-bold text-brand tracking-tight flex items-center gap-2"
              >
                <span>Nueva Cita Médica</span>
              </h2>
              <p className="text-xs text-sage mt-0.5 font-medium">
                Selecciona paciente, servicio y un turno disponible en la agenda real
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
              aria-label="Cerrar panel lateral"
            >
              <span className="text-xl font-medium leading-none">✕</span>
            </button>
          </div>

          {/* 2. Cuerpo del Formulario con scroll independiente */}
          <form
            id="nueva-cita-drawer-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4.5"
          >
            {formError && (
              <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20 flex items-start gap-2">
                <span className="shrink-0 text-base leading-none">⚠️</span>
                <div className="flex-1 leading-relaxed">{formError}</div>
              </div>
            )}

            {/* Sección: Cliente y Mascota */}
            <div className="space-y-3 bg-bone/30 p-3.5 rounded-2xl border border-border-tan/60">
              <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-b border-border-tan/50 pb-1 flex items-center justify-between">
                <span>1. Paciente y Propietario</span>
                {selectedClient?.phoneNumber && (
                  <span className="text-[11px] font-normal text-sage lowercase">
                    📞 {selectedClient.phoneNumber}
                  </span>
                )}
              </h3>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1">
                  Cliente / Propietario <span className="text-terracotta">*</span>
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={isLoadingData}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:opacity-50"
                >
                  <option value="">Seleccionar cliente...</option>
                  {safeClients.map((client) => {
                    const cId = String(client?.id || '')
                    return (
                      <option key={cId} value={cId}>
                        {client?.fullName ? `${client.fullName} (${client.identificationNumber || 'N/A'})` : 
                         client?.identificationNumber ? `Cliente ${client.identificationNumber}` : 
                         `Cliente ${cId.slice(0, 8)}`}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1">
                  Mascota <span className="text-terracotta">*</span>
                </label>
                <select
                  required
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  disabled={!selectedClientId || isLoadingData}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar mascota...</option>
                  {petsForClient.map((pet) => {
                    const g = String(pet?.gender || '').toLowerCase()
                    const isMale = g === 'male' || g === 'macho' || g === 'm'
                    return (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.age} años, {isMale ? 'Macho' : 'Hembra'})
                      </option>
                    )
                  })}
                </select>
                {!selectedClientId ? (
                  <p className="text-[11px] text-sage mt-1">Selecciona un cliente para ver sus mascotas.</p>
                ) : petsForClient.length === 0 ? (
                  <p className="text-[11px] text-terracotta mt-1">Este cliente no tiene mascotas registradas. Regístrala primero en Mascotas.</p>
                ) : null}
              </div>
            </div>

            {/* Sección: Servicio y Profesional */}
            <div className="space-y-3 bg-bone/30 p-3.5 rounded-2xl border border-border-tan/60">
              <h3 className="text-xs font-bold text-brand uppercase tracking-wider border-b border-border-tan/50 pb-1">
                2. Servicio y Profesional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1">
                    Servicio Clínico <span className="text-terracotta">*</span>
                  </label>
                  <select
                    required
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    disabled={isLoadingData}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:opacity-50"
                  >
                    {safeServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({service.durationMinutes} min)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1">
                    Profesional <span className="text-terracotta">*</span>
                  </label>
                  <select
                    required
                    value={selectedVeterinarianId}
                    onChange={(e) => setSelectedVeterinarianId(e.target.value)}
                    disabled={isLoadingData}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:opacity-50"
                  >
                    {safeVets.length === 0 ? (
                      <option value="">No hay profesionales disponibles</option>
                    ) : (
                      safeVets.map((vet) => (
                        <option key={vet.id} value={vet.id}>
                          {vet.userFullName || 'Veterinario'} ({vet.specialtyName || 'General'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {vetWorkingSummary && (
                <div className="text-[11px] text-[#1b4332] bg-[#f0f7f4] border border-[#d4ede4] px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                  <span>📅</span>
                  <span>{vetWorkingSummary}</span>
                </div>
              )}
            </div>

            {/* Sección: Fecha y Turnos Disponibles (Agenda Real) */}
            <div className="space-y-3 bg-bone/30 p-3.5 rounded-2xl border border-border-tan/60">
              <div className="flex items-center justify-between border-b border-border-tan/50 pb-1">
                <h3 className="text-xs font-bold text-brand uppercase tracking-wider">
                  3. Fecha y Horario Disponible
                </h3>
                <span className="text-[11px] font-semibold text-brand bg-white border border-border-tan px-2 py-0.5 rounded-lg shadow-2xs">
                  {formattedSelectedDay}
                </span>
              </div>

              {/* Selector de fecha con atajos */}
              <div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min={getTodayDateString()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={isLoadingData}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-border-tan bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:opacity-50"
                  />
                  
                  {/* Botones de navegación rápida */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(getTodayDateString())}
                      className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-white border border-border-tan text-charcoal hover:bg-bone hover:border-brand transition cursor-pointer"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustDateByDays(1)}
                      className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-white border border-border-tan text-charcoal hover:bg-bone hover:border-brand transition cursor-pointer"
                    >
                      +1 Día
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustDateByDays(7)}
                      className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-white border border-border-tan text-charcoal hover:bg-bone hover:border-brand transition cursor-pointer"
                    >
                      +1 Sem
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista o Grilla de Horarios Disponibles */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-charcoal">
                    Turnos Libres <span className="text-terracotta">*</span>
                  </label>
                  {isLoadingSlots ? (
                    <span className="text-[11px] text-sage animate-pulse">Consultando disponibilidad...</span>
                  ) : safeSlots.length > 0 ? (
                    <span className="text-[11px] font-semibold text-brand">
                      {safeSlots.length} {safeSlots.length === 1 ? 'turno disponible' : 'turnos disponibles'}
                    </span>
                  ) : null}
                </div>

                {isLoadingSlots ? (
                  <div className="p-6 rounded-2xl bg-white border border-border-tan flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-medium text-sage">Calculando turnos disponibles según la disponibilidad del profesional...</p>
                  </div>
                ) : safeSlots.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                      {safeSlots.map((slot) => {
                        const isSelected = selectedSlot?.availabilityId === slot.availabilityId &&
                                           selectedSlot?.scheduledStartUtc === slot.scheduledStartUtc
                        const startTime = formatSlotTime(slot.scheduledStartUtc)
                        const endTime = formatSlotTime(slot.scheduledEndUtc)

                        return (
                          <button
                            key={`${slot.availabilityId}-${slot.scheduledStartUtc}`}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot)
                              setFormError(null)
                            }}
                            className={`p-2.5 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
                              isSelected
                                ? 'bg-brand text-white border-brand shadow-sm ring-2 ring-brand/30'
                                : 'bg-white border-border-tan hover:border-brand hover:bg-brand/5 text-charcoal'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold">{startTime}</span>
                              {isSelected && <span className="text-xs">✓</span>}
                            </div>
                            <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-sage'}`}>
                              a {endTime}
                            </span>
                            {slot.consultingRoom && (
                              <span className={`text-[9px] mt-1 px-1.5 py-0.5 rounded self-start font-medium ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-bone text-charcoal/70'
                              }`}>
                                {slot.consultingRoom}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {selectedSlot && (
                      <div className="text-[11px] text-brand font-medium bg-brand/10 px-3 py-1.5 rounded-xl border border-brand/20 flex items-center justify-between">
                        <span>Turno seleccionado: <strong>{formatSlotTime(selectedSlot.scheduledStartUtc)} - {formatSlotTime(selectedSlot.scheduledEndUtc)}</strong></span>
                        <button
                          type="button"
                          onClick={() => setSelectedSlot(null)}
                          className="text-[10px] text-terracotta underline font-semibold cursor-pointer"
                        >
                          Cambiar
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <span className="text-base">📅</span>
                      <span>Sin turnos disponibles para esta fecha</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      El profesional no tiene franja de atención configurada para este día o todos los turnos se encuentran ocupados.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustDateByDays(1)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition shadow-2xs cursor-pointer text-xs flex items-center gap-1"
                      >
                        <span>Probar día siguiente (+1 día)</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección: Motivo y Observaciones */}
            <div className="space-y-1.5 bg-bone/30 p-3.5 rounded-2xl border border-border-tan/60">
              <label className="block text-xs sm:text-sm font-bold text-charcoal">
                Motivo de Consulta / Observaciones
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe síntomas preliminares, alergias conocidas o instrumental a requerir..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            {/* Banner de Estado Inicial */}
            <div className="bg-[#f0f7f4] border border-[#d4ede4] rounded-2xl p-3 flex items-start gap-2.5 text-xs text-[#1b4332]">
              <svg
                className="w-4 h-4 mt-0.5 shrink-0 text-[#0f766e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="leading-relaxed text-[11px]">
                La cita se creará como <strong>Agendada</strong> en el sistema y aparecerá en el listado del día para que el auxiliar realice el pre-triaje (peso, temperatura y preparación).
              </p>
            </div>
          </form>

          {/* 3. Footer fijo del Drawer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-tan/70 bg-white">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="nueva-cita-drawer-form"
              disabled={isSubmitting || !selectedSlot || !selectedPetId || !selectedClientId}
              className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Agendando Cita...</span>
                </>
              ) : (
                <span>Agendar Cita</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </DrawerErrorBoundary>
  )

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body)
  }

  return drawerContent
}
