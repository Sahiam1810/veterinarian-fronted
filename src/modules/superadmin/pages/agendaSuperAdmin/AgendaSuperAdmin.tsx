import { useState, useMemo, useEffect, type FormEvent } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'
import type {
  CitaSuperAdmin,
  CitaFormData,
  EstadoCita,
} from '../../types'
import {
  PlusIcon,
  CalendarIcon,
  CheckIcon,
} from '@/global/components'

export interface AgendaSuperAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
}

const DIAS_SEMANA = [
  { label: 'Lun', dateKey: '2023-10-16', num: 16 },
  { label: 'Mar', dateKey: '2023-10-17', num: 17 },
  { label: 'Mié', dateKey: '2023-10-18', num: 18 },
  { label: 'Jue', dateKey: '2023-10-19', num: 19 },
  { label: 'Vie', dateKey: '2023-10-20', num: 20 },
  { label: 'Sáb', dateKey: '2023-10-21', num: 21 },
  { label: 'Dom', dateKey: '2023-10-22', num: 22 },
]

const HORAS_MOSTRADAS = [8, 9, 10, 11, 12]
const HOUR_START = 8
const HOUR_END = 12
const TOTAL_MINUTES = (HOUR_END - HOUR_START) * 60

const INITIAL_CITAS: CitaSuperAdmin[] = [
  {
    id: 'cita-1',
    dateKey: '2023-10-16',
    startTime: '08:30',
    endTime: '09:30',
    status: 'AGENDADA',
    petName: 'Luna',
    petBreed: 'Golden Retriever',
    species: 'Perro',
    ownerName: 'Carlos Mendoza',
    professionalId: 'prof-smith',
    professionalName: 'Dr. Smith',
    service: 'Vacunación Anual',
    notes: 'Traer cartilla de vacunación anterior.',
  },
  {
    id: 'cita-2',
    dateKey: '2023-10-17',
    startTime: '09:30',
    endTime: '10:30',
    status: 'EN_ESPERA', // En Curso
    petName: 'Max',
    petBreed: 'Beagle',
    species: 'Perro',
    ownerName: 'Carlos Mendoza',
    professionalId: 'prof-garcia',
    professionalName: 'Dra. Garcia',
    service: 'Consulta General',
    notes: 'Revisión por otitis recurrente.',
  },
  {
    id: 'cita-3',
    dateKey: '2023-10-18',
    startTime: '10:30',
    endTime: '11:15',
    status: 'AGENDADA',
    petName: 'Bella',
    petBreed: 'Persa',
    species: 'Gato',
    ownerName: 'Sofía Castro',
    professionalId: 'prof-smith',
    professionalName: 'Dr. Smith',
    service: 'Consulta General',
    notes: 'Chequeo de rutina y control de peso.',
  },
  {
    id: 'cita-4',
    dateKey: '2023-10-20',
    startTime: '08:30',
    endTime: '09:30',
    status: 'ATENDIDA',
    petName: 'Rocky',
    petBreed: 'Boxer',
    species: 'Perro',
    ownerName: 'Elena Vargas',
    professionalId: 'prof-lopez',
    professionalName: 'Dr. Lopez',
    service: 'Control y Vacunación',
    notes: 'Vacuna óctuple y desparasitación.',
  },
]

const PROFESIONALES_OPCIONES = [
  { id: 'prof-smith', name: 'Dr. Smith' },
  { id: 'prof-garcia', name: 'Dra. Garcia' },
  { id: 'prof-lopez', name: 'Dr. Lopez' },
  { id: 'prof-vargas', name: 'Dra. Elena Vargas' },
  { id: 'prof-torres', name: 'Dr. Martín Torres' },
]

const SERVICIOS_OPCIONES = [
  'Consulta General',
  'Vacunación Anual',
  'Emergencias y Triaje',
  'Control y Vacunación',
  'Atención Especializada',
]

// Convierte HH:mm a minutos desde la hora de inicio
function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function percentFromHourStart(time: string, hourStart: number): number {
  const minutes = parseMinutes(time) - hourStart * 60
  return (minutes / TOTAL_MINUTES) * 100
}

export function AgendaSuperAdmin({
  onNavigate,
  activeRoute = 'agenda',
  isSidebarOpen: externalIsSidebarOpen,
  onToggleSidebar: externalOnToggleSidebar,
  onCloseSidebar: externalOnCloseSidebar,
  userName = 'SuperAdmin Veterinario',
  userRole = 'SuperAdministrador',
  onLogout,
}: AgendaSuperAdminProps = {}) {
  // Navigation & Sidebar
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  // Data states
  const [citas, setCitas] = useState<CitaSuperAdmin[]>(INITIAL_CITAS)
  const [selectedCitaId, setSelectedCitaId] = useState<string | null>(INITIAL_CITAS[0].id)

  // Filters
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'semana' | 'dia'>('semana')
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0) // For "Día" view mode

  // Toast Notification
  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const showToast = (message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification(null)
    }, 3200)
  }

  // Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingCita, setEditingCita] = useState<CitaSuperAdmin | null>(null)

  // Get active selected appointment detail
  const selectedCita = useMemo(() => {
    return citas.find((c) => c.id === selectedCitaId) || null
  }, [citas, selectedCitaId])

  // Filter appointments
  const filteredCitas = useMemo(() => {
    return citas.filter((c) => {
      const matchProf =
        selectedProfessionalId === 'all' || c.professionalId === selectedProfessionalId
      return matchProf
    })
  }, [citas, selectedProfessionalId])

  // Simulating the current time marker at 11:00
  const nowPercent = useMemo(() => {
    return percentFromHourStart('11:00', HOUR_START)
  }, [])

  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) {
      onNavigate(routeId)
    } else {
      showToast(`Navegando a: ${routeId}`)
    }
  }

  // Cita Handlers
  const handleSaveCita = (data: CitaFormData) => {
    const profName = PROFESIONALES_OPCIONES.find((p) => p.id === data.professionalId)?.name || 'Médico'
    if (editingCita) {
      // Edit / Reprogram
      setCitas((prev) =>
        prev.map((c) =>
          c.id === editingCita.id
            ? { ...c, ...data, professionalName: profName }
            : c
        )
      )
      showToast(`Cita de ${data.petName} actualizada correctamente.`)
    } else {
      // Create
      const newCita: CitaSuperAdmin = {
        id: `cita-${Date.now()}`,
        ...data,
        professionalName: profName,
      }
      setCitas((prev) => [newCita, ...prev])
      setSelectedCitaId(newCita.id)
      showToast(`Cita de ${data.petName} registrada con éxito.`)
    }
    setIsDrawerOpen(false)
    setEditingCita(null)
  }

  const handleCancelCita = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      setCitas((prev) => prev.filter((c) => c.id !== id))
      setSelectedCitaId(null)
      showToast('Cita cancelada correctamente.')
    }
  }

  const handleStartAttention = (id: string) => {
    setCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'EN_ESPERA' } : c))
    )
    showToast('Atención iniciada correctamente.')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone relative text-charcoal">
      {/* 1. Top Header Fijo */}
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        userName={userName}
        userRole={userRole}
        onNotificationClick={() => showToast('Tienes 2 notificaciones del sistema')}
        onProfileClick={() => showToast('Abriendo panel de perfil de superadministrador')}
      />

      {/* 2. Cuerpo Principal */}
      <div className="flex-1 flex overflow-hidden relative">
        <SuperAdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleSidebarNavigate}
          onLogout={onLogout}
        />

        <main
          key={activeRoute}
          className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 flex flex-col gap-5 animate-view-popup"
        >
          <DashboardBackgroundDecoration />

          {/* Toast Notification */}
          {activeNotification && (
            <div
              className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-brand text-white text-xs sm:text-sm font-semibold shadow-lg border border-white/20 flex items-center gap-2 pointer-events-none"
              role="alert"
            >
              <CheckIcon className="w-4 h-4 text-ochre shrink-0" />
              <span>{activeNotification}</span>
            </div>
          )}

          {/* Barra de Filtros Superior */}
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-border-tan rounded-2xl p-3 shadow-[0_2px_12px_rgba(35,78,70,0.03)]">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dropdown Profesional */}
              <select
                value={selectedProfessionalId}
                onChange={(e) => setSelectedProfessionalId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-border-tan bg-bone/35 text-xs sm:text-sm text-charcoal font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los Profesionales</option>
                {PROFESIONALES_OPCIONES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Toggles Semana / Día */}
              <div className="flex items-center bg-bone/40 p-0.5 rounded-xl border border-border-tan/70">
                <button
                  type="button"
                  onClick={() => setViewMode('semana')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'semana'
                      ? 'bg-brand text-white'
                      : 'text-sage hover:text-brand'
                  }`}
                >
                  Semana
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('dia')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'dia'
                      ? 'bg-brand text-white'
                      : 'text-sage hover:text-brand'
                  }`}
                >
                  Día
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="border border-border-tan bg-white hover:bg-bone text-charcoal text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:translate-y-0.5"
              >
                <svg
                  className="w-4 h-4 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCita(null)
                  setIsDrawerOpen(true)
                }}
                className="bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs active:translate-y-0.5"
              >
                <PlusIcon className="w-4 h-4 text-white" />
                <span>Nueva Cita</span>
              </button>
            </div>
          </div>

          {/* Rango de Fechas / Navegación */}
          <div className="relative z-10 bg-white border border-border-tan rounded-2xl py-3 px-4 shadow-[0_2px_12px_rgba(35,78,70,0.03)] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'dia') {
                  setActiveDayIndex((prev) => (prev > 0 ? prev - 1 : 6))
                } else {
                  showToast('Navegando a la semana anterior.')
                }
              }}
              className="p-1 text-sage hover:text-brand transition cursor-pointer"
            >
              ❮
            </button>
            <h3 className="text-base sm:text-lg font-bold text-brand text-center">
              {viewMode === 'semana'
                ? 'Octubre 16 - 22, 2023'
                : `Octubre ${DIAS_SEMANA[activeDayIndex].num}, 2023 (${DIAS_SEMANA[activeDayIndex].label})`}
            </h3>
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'dia') {
                  setActiveDayIndex((prev) => (prev < 6 ? prev + 1 : 0))
                } else {
                  showToast('Navegando a la semana siguiente.')
                }
              }}
              className="p-1 text-sage hover:text-brand transition cursor-pointer"
            >
              ❯
            </button>
          </div>

          {/* Grilla de Calendario */}
          <div className="relative z-10 bg-white border border-border-tan rounded-2xl shadow-[0_4px_20px_rgba(35,78,70,0.04)] overflow-hidden flex-1 flex flex-col min-h-[480px]">
            {/* Cabecera de Columnas */}
            <div
              className="shrink-0 grid border-b border-border-tan bg-bone/40"
              style={{
                gridTemplateColumns:
                  viewMode === 'semana'
                    ? `4.5rem repeat(7, minmax(0, 1fr))`
                    : `4.5rem minmax(0, 1fr)`,
              }}
            >
              <div className="py-2.5 px-4 font-bold text-[10px] sm:text-xs text-sage border-r border-border-tan/70 flex items-center justify-center">
                HORA
              </div>
              {viewMode === 'semana' ? (
                DIAS_SEMANA.map((day) => (
                  <div
                    key={day.dateKey}
                    className="py-2 flex flex-col items-center justify-center border-r border-border-tan/50 last:border-r-0"
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold text-sage uppercase tracking-wider">
                      {day.label}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-charcoal">
                      {day.num}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] sm:text-[11px] font-bold text-sage uppercase tracking-wider">
                    {DIAS_SEMANA[activeDayIndex].label}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-charcoal">
                    {DIAS_SEMANA[activeDayIndex].num}
                  </span>
                </div>
              )}
            </div>

            {/* Grid Body */}
            <div
              className="relative flex-1 grid overflow-y-auto"
              style={{
                gridTemplateColumns:
                  viewMode === 'semana'
                    ? `4.5rem repeat(7, minmax(0, 1fr))`
                    : `4.5rem minmax(0, 1fr)`,
              }}
            >
              {/* Horas */}
              <div className="relative border-r border-border-tan/70 bg-white flex flex-col h-[300px]">
                {HORAS_MOSTRADAS.map((hour) => (
                  <div
                    key={hour}
                    className="relative flex-1 border-b border-border-tan/30"
                  >
                    <span className="absolute top-0 right-1.5 -translate-y-1/2 text-[10px] sm:text-[11px] font-bold text-sage/80 tabular-nums">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Columnas de Citas */}
              {viewMode === 'semana' ? (
                DIAS_SEMANA.map((day) => {
                  const dayEvents = filteredCitas.filter((c) => c.dateKey === day.dateKey)
                  return (
                    <div
                      key={day.dateKey}
                      className="relative border-r border-border-tan/40 last:border-r-0 h-[300px]"
                    >
                      {HORAS_MOSTRADAS.map((hour) => (
                        <div
                          key={hour}
                          className="h-[60px] border-b border-border-tan/20"
                        />
                      ))}
                      {dayEvents.map((event) => {
                        const top = percentFromHourStart(event.startTime, HOUR_START)
                        const bottom = percentFromHourStart(event.endTime, HOUR_START)
                        const height = bottom - top
                        const isSelected = selectedCitaId === event.id

                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedCitaId(event.id)}
                            className={`absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 text-left overflow-hidden cursor-pointer transition hover:brightness-95 ${
                              event.status === 'AGENDADA'
                                ? 'bg-white border border-brand/25 border-l-4 border-l-brand shadow-2xs'
                                : event.status === 'EN_ESPERA'
                                ? 'bg-[#EBF4F1] border border-brand/20 border-l-4 border-l-brand/70 shadow-2xs font-semibold'
                                : 'bg-bone border border-border-tan border-l-4 border-l-sage shadow-2xs'
                            } ${isSelected ? 'ring-2 ring-brand' : ''}`}
                            style={{ top: `${top}%`, height: `${height}%` }}
                          >
                            <p className="text-[9px] sm:text-[10px] font-bold text-brand leading-none truncate">
                              {event.petName} ({event.species})
                            </p>
                            <p className="text-[8px] sm:text-[9px] text-sage leading-none mt-0.5 truncate">
                              {event.professionalName} - {event.service}
                            </p>
                            {event.status === 'EN_ESPERA' && (
                              <span className="inline-block mt-0.5 px-1 py-0.2 bg-brand/10 text-brand text-[7px] font-bold rounded">
                                En Curso
                              </span>
                            )}
                            {event.status === 'ATENDIDA' && (
                              <span className="inline-block mt-0.5 px-1 py-0.2 bg-sage/10 text-sage text-[7px] font-bold rounded">
                                Atendido
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              ) : (
                // Single day column
                <div className="relative h-[300px]">
                  {HORAS_MOSTRADAS.map((hour) => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-border-tan/20"
                    />
                  ))}
                  {filteredCitas
                    .filter((c) => c.dateKey === DIAS_SEMANA[activeDayIndex].dateKey)
                    .map((event) => {
                      const top = percentFromHourStart(event.startTime, HOUR_START)
                      const bottom = percentFromHourStart(event.endTime, HOUR_START)
                      const height = bottom - top
                      const isSelected = selectedCitaId === event.id

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setSelectedCitaId(event.id)}
                          className={`absolute left-2 right-2 rounded-xl p-2.5 text-left overflow-hidden cursor-pointer transition hover:brightness-95 ${
                            event.status === 'AGENDADA'
                              ? 'bg-white border border-brand/25 border-l-4 border-l-brand shadow-2xs'
                              : event.status === 'EN_ESPERA'
                              ? 'bg-[#EBF4F1] border border-brand/20 border-l-4 border-l-brand/70 shadow-2xs font-semibold'
                              : 'bg-bone border border-border-tan border-l-4 border-l-sage shadow-2xs'
                          } ${isSelected ? 'ring-2 ring-brand' : ''}`}
                          style={{ top: `${top}%`, height: `${height}%` }}
                        >
                          <p className="text-[11px] sm:text-xs font-bold text-brand leading-none truncate">
                            {event.petName} ({event.species} - {event.petBreed})
                          </p>
                          <p className="text-[9px] sm:text-[10px] text-sage leading-none mt-1 truncate">
                            Médico: {event.professionalName} · Servicio: {event.service}
                          </p>
                          <p className="text-[8px] sm:text-[9px] text-charcoal/70 leading-none mt-1 italic truncate">
                            Notas: {event.notes}
                          </p>
                        </button>
                      )
                    })}
                </div>
              )}

              {/* Red Current Time indicator (simulated at 11:00) */}
              {viewMode === 'semana' && (
                <div
                  className="absolute left-18 right-0 z-20 pointer-events-none"
                  style={{ top: `${nowPercent}%` }}
                  aria-hidden="true"
                >
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-danger shrink-0 -translate-x-1/2" />
                    <span className="flex-1 h-px bg-danger" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel de Detalles de la Cita Seleccionada (Debajo de la Grilla) */}
          <div className="relative z-10 bg-white border border-border-tan rounded-2xl p-4 shadow-[0_2px_12px_rgba(35,78,70,0.03)] space-y-4 mb-4 sm:mb-6 shrink-0">
            <div className="flex items-center justify-between border-b border-border-tan/50 pb-2">
              <h2 className="text-sm sm:text-base font-bold text-brand">
                Detalles de la Cita Seleccionada
              </h2>
              {selectedCita ? (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                    selectedCita.status === 'AGENDADA'
                      ? 'bg-[#FBF1E6] text-ochre border border-ochre/25'
                      : selectedCita.status === 'EN_ESPERA'
                      ? 'bg-[#E8F2EF] text-brand border border-brand/20'
                      : 'bg-[#F1EFEA] text-sage border border-border-tan'
                  }`}
                >
                  {selectedCita.status === 'AGENDADA'
                    ? 'Agendada'
                    : selectedCita.status === 'EN_ESPERA'
                    ? 'En Espera'
                    : 'Atendido'}
                </span>
              ) : (
                <span className="text-xs text-sage italic">Ninguna seleccionada</span>
              )}
            </div>

            {selectedCita ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
                {/* Paciente y Dueño */}
                <div>
                  <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">
                    Paciente & Dueño
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-9 h-9 rounded-full bg-mint-soft text-brand font-bold text-xs flex items-center justify-center border border-brand/20">
                      {selectedCita.petName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-charcoal leading-tight">
                        {selectedCita.petName} ({selectedCita.petBreed})
                      </p>
                      <p className="text-[11px] text-sage leading-none mt-0.5">
                        {selectedCita.ownerName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fecha y Hora */}
                <div>
                  <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">
                    Fecha y Hora
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 text-charcoal font-medium">
                    <CalendarIcon className="w-4 h-4 text-sage" />
                    <div>
                      <p className="leading-tight">
                        {selectedCita.dateKey}
                      </p>
                      <p className="text-[11px] text-sage leading-none mt-0.5">
                        {selectedCita.startTime} - {selectedCita.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profesional y Servicio */}
                <div>
                  <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">
                    Profesional y Servicio
                  </h4>
                  <div className="mt-1.5">
                    <p className="font-bold text-charcoal leading-tight">
                      {selectedCita.professionalName}
                    </p>
                    <p className="text-[11px] text-sage mt-0.5">
                      {selectedCita.service}
                    </p>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">
                    Notas
                  </h4>
                  <p className="mt-1.5 text-charcoal/80 text-[11px] sm:text-xs leading-relaxed italic">
                    {selectedCita.notes || 'Sin notas.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-sage italic">
                Selecciona una cita de la grilla para ver sus detalles.
              </div>
            )}

            {/* Action buttons */}
            {selectedCita && (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-tan/40">
                <button
                  type="button"
                  onClick={() => handleCancelCita(selectedCita.id)}
                  className="text-danger hover:text-red-700 text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Cancelar Cita
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingCita(selectedCita)
                    setIsDrawerOpen(true)
                  }}
                  className="border border-border-tan bg-white hover:bg-bone text-charcoal text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs"
                >
                  Reprogramar
                </button>

                {selectedCita.status !== 'ATENDIDA' && (
                  <button
                    type="button"
                    onClick={() => handleStartAttention(selectedCita.id)}
                    className="bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    {selectedCita.status === 'AGENDADA' ? 'Iniciar Atención' : 'Marcar Atendido'}
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Drawer para Crear / Reprogramar Cita */}
      <CitaDrawer
        isOpen={isDrawerOpen}
        editingCita={editingCita}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingCita(null)
        }}
        onSave={handleSaveCita}
      />
    </div>
  )
}

/* ============================================================================
   DRAWER / PANEL LATERAL PARA AGREGAR / REPROGRAMAR CITA
   ============================================================================ */
function CitaDrawer({
  isOpen,
  editingCita,
  onClose,
  onSave,
}: {
  isOpen: boolean
  editingCita: CitaSuperAdmin | null
  onClose: () => void
  onSave: (data: CitaFormData) => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  // Form states
  const [petName, setPetName] = useState(editingCita?.petName || '')
  const [petBreed, setPetBreed] = useState(editingCita?.petBreed || '')
  const [species, setSpecies] = useState(editingCita?.species || 'Perro')
  const [ownerName, setOwnerName] = useState(editingCita?.ownerName || '')
  const [dateKey, setDateKey] = useState(editingCita?.dateKey || '2023-10-16')
  const [startTime, setStartTime] = useState(editingCita?.startTime || '08:00')
  const [endTime, setEndTime] = useState(editingCita?.endTime || '09:00')
  const [professionalId, setProfessionalId] = useState(editingCita?.professionalId || 'prof-smith')
  const [service, setService] = useState(editingCita?.service || 'Consulta General')
  const [notes, setNotes] = useState(editingCita?.notes || '')
  const [status, setStatus] = useState<EstadoCita>(editingCita?.status || 'AGENDADA')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setPetName(editingCita?.petName || '')
      setPetBreed(editingCita?.petBreed || '')
      setSpecies(editingCita?.species || 'Perro')
      setOwnerName(editingCita?.ownerName || '')
      setDateKey(editingCita?.dateKey || '2023-10-16')
      setStartTime(editingCita?.startTime || '08:00')
      setEndTime(editingCita?.endTime || '09:00')
      setProfessionalId(editingCita?.professionalId || 'prof-smith')
      setService(editingCita?.service || 'Consulta General')
      setNotes(editingCita?.notes || '')
      setStatus(editingCita?.status || 'AGENDADA')
      setError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [editingCita, isOpen, isRendered])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!petName.trim()) {
      setError('Por favor ingresa el nombre de la mascota.')
      return
    }
    if (!ownerName.trim()) {
      setError('Por favor ingresa el nombre del dueño.')
      return
    }
    if (!startTime || !endTime) {
      setError('Por favor selecciona hora de inicio y fin.')
      return
    }
    if (startTime >= endTime) {
      setError('La hora de inicio debe ser anterior a la de fin.')
      return
    }

    onSave({
      petName: petName.trim(),
      petBreed: petBreed.trim(),
      species,
      ownerName: ownerName.trim(),
      dateKey,
      startTime,
      endTime,
      professionalId,
      service,
      notes: notes.trim(),
      status,
    })
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full sm:w-[420px] lg:w-[450px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-soft text-brand flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-brand">
              {editingCita ? 'Reprogramar Cita' : 'Nueva Cita'}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Nombre de la Mascota <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Ej. Luna"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-charcoal mb-1.5">Especie</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1.5">Raza</label>
              <input
                type="text"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                placeholder="Ej. Golden"
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Dueño / Propietario <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Fecha</label>
            <input
              type="date"
              required
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-charcoal mb-1.5">Hora Inicio</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1.5">Hora Fin</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Médico Profesional</label>
            <select
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              {PROFESIONALES_OPCIONES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Servicio</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              {SERVICIOS_OPCIONES.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Notas de la Cita</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Traer cartilla de vacunación anterior."
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
            />
          </div>

          {editingCita && (
            <div>
              <label className="block font-bold text-charcoal mb-1.5">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EstadoCita)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
              >
                <option value="AGENDADA">Agendada</option>
                <option value="EN_ESPERA">En Espera</option>
                <option value="ATENDIDA">Atendido</option>
              </select>
            </div>
          )}

          {/* Botones */}
          <div className="pt-4 border-t border-border-tan/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone hover:text-charcoal transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition shadow-xs cursor-pointer"
            >
              {editingCita ? 'Guardar Cambios' : 'Registrar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
