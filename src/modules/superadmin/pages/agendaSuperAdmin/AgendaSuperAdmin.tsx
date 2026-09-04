import { useState, useMemo, useEffect, type FormEvent } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'
import { useAgendaSuperAdmin } from '../../hooks'
import type {
  CitaSuperAdmin,
  CitaFormData,
  EstadoCita,
  AgendaPetOption,
  AgendaServiceOption,
} from '../../types'
import type { ModuleId, NotificacionSuperAdmin } from '../../types'
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
  canViewModule?: (moduleId: ModuleId) => boolean
  notifications?: NotificacionSuperAdmin[]
  isLoadingNotifications?: boolean
  notificationsError?: string | null
  onMarkNotificationRead?: (id: string) => void
  onMarkAllNotificationsRead?: () => void
  onReloadNotifications?: () => void
}

const HOUR_ROW_HEIGHT = 76

// Convierte HH:mm a minutos
function parseMinutes(time: string): number {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

// Calcula la posición y altura en píxeles de una cita para que nunca quede recortada ni con coordenadas negativas
function calculateEventPosition(
  event: CitaSuperAdmin,
  dayEvents: CitaSuperAdmin[],
  hourStart: number,
  hourEnd: number
) {
  const eventStartMins = parseMinutes(event.startTime)
  const eventEndMins = parseMinutes(event.endTime)

  const gridStartMins = hourStart * 60
  const gridEndMins = hourEnd * 60

  // Siempre dentro del rango de la cuadrícula
  const clampedStart = Math.max(gridStartMins, Math.min(eventStartMins, gridEndMins - 30))
  const clampedEnd = Math.max(
    clampedStart + 15,
    Math.min(eventEndMins > eventStartMins ? eventEndMins : eventStartMins + 45, gridEndMins)
  )

  const startOffsetMins = clampedStart - gridStartMins
  const durationMins = clampedEnd - clampedStart

  // Identifica si hay otras citas en la misma hora (ej: franja de las 8:00 a las 9:00)
  const eventHour = Math.floor(startOffsetMins / 60)
  const sameHourEvents = dayEvents.filter((e) => {
    const eStartMins = Math.max(0, parseMinutes(e.startTime) - gridStartMins)
    return Math.floor(eStartMins / 60) === eventHour
  })

  let effectiveDuration = durationMins
  if (sameHourEvents.length === 1) {
    effectiveDuration = Math.max(effectiveDuration, 54)
  }

  const topPx = Math.max(2, (startOffsetMins / 60) * HOUR_ROW_HEIGHT + 2)
  const heightPx = Math.max(38, (effectiveDuration / 60) * HOUR_ROW_HEIGHT - 4)

  return { topPx, heightPx }
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
  canViewModule,
  notifications,
  isLoadingNotifications,
  notificationsError,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onReloadNotifications,
}: AgendaSuperAdminProps = {}) {
  // Navigation & Sidebar
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  const {
    weekDays: DIAS_SEMANA,
    goToPrevious,
    goToNext,
    goToToday,
    selectedCitaId,
    setSelectedCitaId,
    selectedCita,
    filteredCitas,
    profesionalesOpciones,
    serviciosOpciones,
    mascotasOpciones,
    selectedProfessionalId,
    setSelectedProfessionalId,
    viewMode,
    setViewMode,
    activeDayIndex,
    activeNotification,
    showToast,
    isDrawerOpen,
    setIsDrawerOpen,
    editingCita,
    setEditingCita,
    handleSaveCita,
    handleCancelCita,
    handleStartAttention,
  } = useAgendaSuperAdmin()

  const { hourStart, hourEnd, hourRows } = useMemo(() => {
    let minH = 8
    let maxH = 18
    for (const c of filteredCitas) {
      if (c.startTime) {
        const h = Number.parseInt(c.startTime.split(':')[0], 10)
        if (!Number.isNaN(h) && h >= 0 && h < 24) {
          minH = Math.min(minH, h)
        }
      }
      if (c.endTime) {
        const h = Number.parseInt(c.endTime.split(':')[0], 10)
        if (!Number.isNaN(h) && h >= 0 && h <= 24) {
          maxH = Math.max(maxH, Math.min(24, h + 1))
        }
      }
    }
    const hStart = Math.max(6, Math.min(minH, 8))
    const hEnd = Math.min(22, Math.max(maxH, hStart + 8, 18))
    const rows = Array.from({ length: hEnd - hStart }, (_, i) => hStart + i)
    return { hourStart: hStart, hourEnd: hEnd, hourRows: rows }
  }, [filteredCitas])

  const nowPercent = useMemo(() => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const gridStartMinutes = hourStart * 60
    const totalGridMinutes = (hourEnd - hourStart) * 60
    const pct = ((currentMinutes - gridStartMinutes) / totalGridMinutes) * 100
    return pct >= 0 && pct <= 100 ? pct : -1
  }, [hourStart, hourEnd])


  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) {
      onNavigate(routeId)
    } else {
      showToast(`Navegando a: ${routeId}`)
    }
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
        notifications={notifications}
        isLoadingNotifications={isLoadingNotifications}
        notificationsError={notificationsError}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onReloadNotifications={onReloadNotifications}
        onProfileClick={() => showToast('Abriendo panel de perfil de superadministrador')}
      />

      {/* 2. Cuerpo Principal */}
      <div className="flex-1 flex overflow-hidden relative">
        <SuperAdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleSidebarNavigate}
          canViewModule={canViewModule}
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
              className="toast-pop-up fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-brand text-white text-xs sm:text-sm font-semibold shadow-xl border border-white/20 flex items-center gap-2 pointer-events-none"
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
                {profesionalesOpciones.map((p) => (
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

          {/* Rango de Fechas / Navegación Interactiva */}
          <div className="relative z-10 bg-white border border-border-tan rounded-2xl py-2.5 px-4 shadow-[0_2px_12px_rgba(35,78,70,0.03)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goToPrevious}
                className="p-1.5 text-sage hover:text-brand hover:bg-bone/60 rounded-lg transition cursor-pointer"
                aria-label="Anterior"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-bold text-brand hover:bg-bone rounded-lg border border-border-tan transition cursor-pointer"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="p-1.5 text-sage hover:text-brand hover:bg-bone/60 rounded-lg transition cursor-pointer"
                aria-label="Siguiente"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-brand text-center">
              {viewMode === 'semana'
                ? `${DIAS_SEMANA[0]?.dateKey || ''} — ${DIAS_SEMANA[6]?.dateKey || ''}`
                : `${DIAS_SEMANA[activeDayIndex]?.dateKey || ''} (${DIAS_SEMANA[activeDayIndex]?.label || ''})`}
            </h3>

            <div className="text-xs text-sage font-medium hidden sm:block">
              {filteredCitas.length} {filteredCitas.length === 1 ? 'cita en agenda' : 'citas en agenda'}
            </div>
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
                    <span className={`text-xs sm:text-sm font-extrabold ${day.isToday ? 'text-brand font-black' : 'text-charcoal'}`}>
                      {day.num}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] sm:text-[11px] font-bold text-sage uppercase tracking-wider">
                    {DIAS_SEMANA[activeDayIndex]?.label || ''}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-charcoal">
                    {DIAS_SEMANA[activeDayIndex]?.num || ''}
                  </span>
                </div>
              )}
            </div>

            {/* Grid Body */}
            <div
              className="relative flex-1 grid overflow-y-auto max-h-[620px]"
              style={{
                gridTemplateColumns:
                  viewMode === 'semana'
                    ? `4.5rem repeat(7, minmax(0, 1fr))`
                    : `4.5rem minmax(0, 1fr)`,
              }}
            >
              {/* Horas */}
              <div className="relative border-r border-border-tan/70 bg-white flex flex-col min-h-0">
                {hourRows.map((hour) => (
                  <div
                    key={hour}
                    className="relative h-[76px] border-b border-border-tan/30 flex items-start justify-end pr-2.5 pt-2 select-none shrink-0"
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold text-sage/80 tabular-nums">
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
                      className="relative border-r border-border-tan/40 last:border-r-0 min-h-0 flex flex-col"
                      style={{ height: `${hourRows.length * HOUR_ROW_HEIGHT}px` }}
                    >
                      {hourRows.map((hour) => (
                        <div
                          key={hour}
                          className="h-[76px] border-b border-border-tan/20 shrink-0"
                        />
                      ))}
                      {dayEvents.map((event) => {
                        const { topPx, heightPx } = calculateEventPosition(event, dayEvents, hourStart, hourEnd)
                        const isSelected = selectedCitaId === event.id
                        const isCompact = heightPx < 45

                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedCitaId(event.id)}
                            className={`absolute left-1 right-1 rounded-xl px-2 py-1.5 text-left overflow-hidden cursor-pointer transition-all hover:brightness-95 hover:shadow-md z-10 flex flex-col justify-between ${
                              event.status === 'AGENDADA'
                                ? 'bg-white border border-brand/25 border-l-4 border-l-brand shadow-2xs'
                                : event.status === 'EN_ESPERA'
                                ? 'bg-[#EBF4F1] border border-brand/20 border-l-4 border-l-brand/70 shadow-2xs font-semibold'
                                : 'bg-bone border border-border-tan border-l-4 border-l-sage shadow-2xs'
                            } ${isSelected ? 'ring-2 ring-brand shadow-sm' : ''}`}
                            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                            title={`${event.startTime} - ${event.endTime}: ${event.petName} (${event.service})`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-1 leading-none mb-0.5">
                                <span className="text-[9px] font-extrabold text-brand tracking-tight">
                                  {event.startTime}
                                </span>
                                {event.status === 'EN_ESPERA' ? (
                                  <span className="inline-block px-1 py-0.2 bg-brand/10 text-brand text-[7px] font-bold rounded">
                                    En Curso
                                  </span>
                                ) : event.status === 'ATENDIDA' ? (
                                  <span className="inline-block px-1 py-0.2 bg-sage/15 text-sage text-[7px] font-bold rounded">
                                    Atendido
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-[10px] sm:text-[11px] font-bold text-charcoal leading-tight truncate">
                                {event.petName} <span className="text-[9px] font-normal text-sage">({event.species})</span>
                              </p>
                            </div>
                            {!isCompact && (
                              <p className="text-[8px] sm:text-[9px] text-sage leading-tight truncate font-medium mt-0.5 border-t border-border-tan/30 pt-0.5">
                                {event.service}
                              </p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              ) : (
                // Single day column
                <div
                  className="relative min-h-0 flex flex-col"
                  style={{ height: `${hourRows.length * HOUR_ROW_HEIGHT}px` }}
                >
                  {hourRows.map((hour) => (
                    <div
                      key={hour}
                      className="h-[76px] border-b border-border-tan/20 shrink-0"
                    />
                  ))}
                  {filteredCitas
                    .filter((c) => c.dateKey === DIAS_SEMANA[activeDayIndex]?.dateKey)
                    .map((event) => {
                      const dayEvents = filteredCitas.filter(
                        (c) => c.dateKey === DIAS_SEMANA[activeDayIndex]?.dateKey
                      )
                      const { topPx, heightPx } = calculateEventPosition(event, dayEvents, hourStart, hourEnd)
                      const isSelected = selectedCitaId === event.id

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setSelectedCitaId(event.id)}
                          className={`absolute left-3 right-3 rounded-2xl p-3 text-left overflow-hidden cursor-pointer transition-all hover:brightness-95 hover:shadow-md z-10 flex flex-col justify-between ${
                            event.status === 'AGENDADA'
                              ? 'bg-white border border-brand/25 border-l-4 border-l-brand shadow-xs'
                              : event.status === 'EN_ESPERA'
                              ? 'bg-[#EBF4F1] border border-brand/20 border-l-4 border-l-brand/70 shadow-xs font-semibold'
                              : 'bg-bone border border-border-tan border-l-4 border-l-sage shadow-xs'
                          } ${isSelected ? 'ring-2 ring-brand shadow-md' : ''}`}
                          style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 leading-none mb-1">
                              <span className="text-xs font-extrabold text-brand bg-mint-soft px-2 py-0.5 rounded-md border border-brand/15">
                                {event.startTime} - {event.endTime}
                              </span>
                              <span className="text-[10px] font-bold text-sage">
                                {event.status === 'EN_ESPERA' ? 'En Espera' : event.status === 'ATENDIDA' ? 'Atendida' : 'Agendada'}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-charcoal leading-snug truncate">
                              {event.petName} <span className="text-xs font-normal text-sage">({event.species} - {event.petBreed})</span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-sage mt-1 pt-1 border-t border-border-tan/30 truncate">
                            <span className="font-semibold text-charcoal/80 truncate">{event.service}</span>
                            <span className="truncate ml-2">{event.professionalName}</span>
                          </div>
                        </button>
                      )
                    })}
                </div>
              )}

              {/* Red Current Time indicator */}
              {viewMode === 'semana' && nowPercent >= 0 && nowPercent <= 100 && (
                <div
                  className="absolute left-18 right-0 z-20 pointer-events-none"
                  style={{ top: `${(nowPercent / 100) * (hourRows.length * HOUR_ROW_HEIGHT)}px` }}
                  aria-hidden="true"
                >
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger shrink-0 -translate-x-1/2 shadow-xs" />
                    <span className="flex-1 h-[2px] bg-danger/80" />
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
                    : selectedCita.status === 'ATENDIDA'
                    ? 'Atendida'
                    : selectedCita.status === 'CANCELADA'
                    ? 'Cancelada'
                    : selectedCita.status === 'NO_ASISTIO'
                    ? 'No asistió'
                    : selectedCita.status === 'EN_ESPERA'
                    ? 'En Espera'
                    : selectedCita.status}
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

                {selectedCita.status === 'AGENDADA' && (
                  <button
                    type="button"
                    onClick={() => handleStartAttention(selectedCita.id)}
                    className="bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Marcar Atendida
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
        profesionalesOpciones={profesionalesOpciones}
        serviciosOpciones={serviciosOpciones}
        mascotasOpciones={mascotasOpciones}
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
  profesionalesOpciones,
  serviciosOpciones,
  mascotasOpciones,
  onClose,
  onSave,
}: {
  isOpen: boolean
  editingCita: CitaSuperAdmin | null
  profesionalesOpciones: { id: string; name: string }[]
  serviciosOpciones: AgendaServiceOption[]
  mascotasOpciones: AgendaPetOption[]
  onClose: () => void
  onSave: (data: CitaFormData) => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  const todayKey = new Date().toISOString().slice(0, 10)
  const [clientPetId, setClientPetId] = useState(editingCita?.clientPetId || mascotasOpciones[0]?.clientPetId || '')
  const [dateKey, setDateKey] = useState(editingCita?.dateKey || todayKey)
  const [startTime, setStartTime] = useState(editingCita?.startTime || '09:00')
  const [endTime, setEndTime] = useState(editingCita?.endTime || '09:30')
  const [professionalId, setProfessionalId] = useState(
    editingCita?.professionalId || profesionalesOpciones[0]?.id || '',
  )
  const [serviceId, setServiceId] = useState(editingCita?.serviceId || serviciosOpciones[0]?.id || '')
  const [notes, setNotes] = useState(editingCita?.notes || '')
  const [status, setStatus] = useState<EstadoCita>(editingCita?.status || 'AGENDADA')
  const [error, setError] = useState<string | null>(null)

  const selectedPet = mascotasOpciones.find((m) => m.clientPetId === clientPetId)
  const selectedService = serviciosOpciones.find((s) => s.id === serviceId)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setClientPetId(editingCita?.clientPetId || mascotasOpciones[0]?.clientPetId || '')
      setDateKey(editingCita?.dateKey || todayKey)
      setStartTime(editingCita?.startTime || '09:00')
      setEndTime(editingCita?.endTime || '09:30')
      setProfessionalId(editingCita?.professionalId || profesionalesOpciones[0]?.id || '')
      setServiceId(editingCita?.serviceId || serviciosOpciones[0]?.id || '')
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
  }, [editingCita, isOpen, isRendered, mascotasOpciones, profesionalesOpciones, serviciosOpciones, todayKey])

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
    if (!clientPetId || !selectedPet) {
      setError('Selecciona una mascota registrada (módulo Mascotas).')
      return
    }
    if (!serviceId || !selectedService) {
      setError('Selecciona un servicio del catálogo.')
      return
    }
    if (!professionalId) {
      setError('Selecciona un profesional.')
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
      clientPetId,
      petName: selectedPet.petName,
      petBreed: selectedPet.breed,
      species: selectedPet.species,
      ownerName: selectedPet.ownerName,
      dateKey,
      startTime,
      endTime,
      professionalId,
      serviceId,
      service: selectedService.name,
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Mascota / Dueño <span className="text-terracotta">*</span>
            </label>
            <select
              value={clientPetId}
              onChange={(e) => setClientPetId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              {mascotasOpciones.length === 0 ? (
                <option value="">Sin mascotas en API</option>
              ) : (
                mascotasOpciones.map((m) => (
                  <option key={m.clientPetId} value={m.clientPetId}>
                    {m.petName} — {m.ownerName}
                  </option>
                ))
              )}
            </select>
            {selectedPet && (
              <p className="text-[11px] text-sage mt-1">
                {selectedPet.species} · {selectedPet.breed || 'Sin raza'}
              </p>
            )}
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
              {profesionalesOpciones.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Servicio</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              {serviciosOpciones.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name}
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

          {editingCita && editingCita.status === 'AGENDADA' && (
            <div>
              <label className="block font-bold text-charcoal mb-1.5">Cambiar estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EstadoCita)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
              >
                <option value="AGENDADA">Agendada</option>
                <option value="ATENDIDA">Atendida</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="NO_ASISTIO">No asistió</option>
              </select>
            </div>
          )}

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
              {editingCita ? 'Guardar cambios' : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
