import { useState, useMemo, useEffect, type FormEvent } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'
import { useProfesionalesSuperAdmin } from '../../hooks'
import type {
  ProfesionalSuperAdmin,
  ProfesionalFormData,
  BloqueHorario,
  DiaSemana,
  EstadoProfesional,
} from '../../types'
import type { ModuleId, NotificacionSuperAdmin } from '../../types'
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  DoctorIcon,
  CalendarIcon,
  CheckIcon,
  StethoscopeIcon,
  PawIcon,
} from '@/global/components'

function MailIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}


function SaveIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  )
}

export interface ProfesionalesSuperAdminProps {
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

const DIAS_SEMANA: DiaSemana[] = [
  'LUNES',
  'MARTES',
  'MIÉRCOLES',
  'JUEVES',
  'VIERNES',
  'SÁBADO',
  'DOMINGO',
]

const TIPOS_ATENCION_OPCIONES = [
  'Cirugía Programada',
  'Consulta General',
  'Emergencias y Triaje',
  'Control y Vacunación',
  'Atención Especializada',
  'Terapia y Rehabilitación',
]

function EspecialidadBadgeIcon({ especialidad, className = 'w-3.5 h-3.5' }: { especialidad: string; className?: string }) {
  const esp = especialidad.toLowerCase()
  if (esp.includes('cirug') || esp.includes('cardio') || esp.includes('oftalm')) {
    return <StethoscopeIcon className={`${className} text-sage shrink-0`} />
  }
  if (esp.includes('comport') || esp.includes('medicina')) {
    return <PawIcon className={`${className} text-sage shrink-0`} />
  }
  return <DoctorIcon className={`${className} text-sage shrink-0`} />
}

export function ProfesionalesSuperAdmin({
  onNavigate,
  activeRoute = 'profesionales',
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
}: ProfesionalesSuperAdminProps = {}) {
  // Estado de navegación y sidebar
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  const {
    searchQuery,
    setSearchQuery,
    selectedEspecialidad,
    setSelectedEspecialidad,
    selectedProfesional,
    setSelectedProfesionalId,
    filteredProfesionales,
    activeNotification,
    showToast,
    isProfModalOpen,
    setIsProfModalOpen,
    editingProfesional,
    setEditingProfesional,
    isBlockModalOpen,
    setIsBlockModalOpen,
    editingBlock,
    setEditingBlock,
    handleSaveProfesional,
    handleSaveBloque,
    handleDeleteBloque,
    handleSaveChanges,
    specialties,
  } = useProfesionalesSuperAdmin()

  const specialtyNames = useMemo(
    () => (specialties.length > 0 ? specialties.map((s) => s.name) : ['Medicina General']),
    [specialties],
  )

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const [selectedDiaForBlock, setSelectedDiaForBlock] = useState<DiaSemana>('LUNES')

  const totalPages = Math.ceil(filteredProfesionales.length / itemsPerPage) || 1
  const paginatedProfesionales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProfesionales.slice(start, start + itemsPerPage)
  }, [filteredProfesionales, currentPage, itemsPerPage])

  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) {
      onNavigate(routeId)
    } else {
      showToast(`Navegando a: ${routeId}`)
    }
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
          className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-7 animate-view-popup"
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

          {/* Header de la Vista: Título y Subtítulo */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop-in stagger-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
                Gestión de Profesionales
              </h1>
              <p className="text-xs sm:text-sm text-sage font-medium mt-1">
                Administra el equipo médico y sus horarios de atención.
              </p>
            </div>
          </div>

          {/* Contenedor Unificado: Filtros + Tabla de Profesionales */}
          <div className="relative z-10 bg-white border border-border-tan rounded-2xl shadow-[0_4px_20px_rgba(35,78,70,0.04)] overflow-hidden animate-pop-in stagger-2 flex-1 flex flex-col">
            {/* Barra superior de Filtros y Buscador */}
            <div className="p-3.5 sm:p-4 border-b border-border-tan/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
              {/* Buscador */}
              <div className="relative flex-1 min-w-[240px]">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Buscar por nombre o CMP..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-border-tan bg-bone/30 focus:bg-white text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dropdown Especialidades */}
              <div className="shrink-0">
                <select
                  value={selectedEspecialidad}
                  onChange={(e) => {
                    setSelectedEspecialidad(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border-tan bg-bone/30 focus:bg-white text-xs sm:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer min-w-[190px]"
                >
                  <option value="all">Todas las especialidades</option>
                  {specialtyNames.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabla de Profesionales */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-bone/80 border-b border-border-tan/60 text-sage text-[0.72rem] font-bold tracking-wider uppercase">
                    <th className="py-3 px-4 sm:px-6 w-16 text-center">Foto</th>
                    <th className="py-3 px-4">Nombre & CMP</th>
                    <th className="py-3 px-4">Especialidad</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 sm:px-6 text-center w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
                  {paginatedProfesionales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sage font-medium">
                        No se encontraron profesionales con los filtros ingresados.
                      </td>
                    </tr>
                  ) : (
                    paginatedProfesionales.map((prof) => {
                      const isSelected = selectedProfesional?.id === prof.id
                      return (
                        <tr
                          key={prof.id}
                          onClick={() => setSelectedProfesionalId(prof.id)}
                          className={`cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'bg-[#EBF4F1] border-l-4 border-brand font-medium shadow-2xs'
                              : 'hover:bg-bone/60 border-l-4 border-transparent'
                          }`}
                        >
                          {/* Foto */}
                          <td className="py-3.5 px-4 sm:px-6 text-center">
                            {prof.avatarUrl ? (
                              <img
                                src={prof.avatarUrl}
                                alt={prof.name}
                                className="w-10 h-10 rounded-full object-cover border border-border-tan mx-auto shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-mint-soft text-brand font-bold text-sm flex items-center justify-center border border-brand/20 mx-auto shadow-2xs">
                                {prof.name.replace('Dr. ', '').replace('Dra. ', '').charAt(0)}
                              </div>
                            )}
                          </td>

                          {/* Nombre & CMP */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className={`font-bold ${isSelected ? 'text-brand' : 'text-charcoal'}`}>
                                {prof.name}
                              </span>
                              <span className="text-[11px] text-sage font-semibold tracking-wide">
                                CMP: {prof.cmp}
                              </span>
                            </div>
                          </td>

                          {/* Especialidad */}
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-2 font-medium text-charcoal/90">
                              <EspecialidadBadgeIcon especialidad={prof.especialidad} />
                              <span>{prof.especialidad}</span>
                            </div>
                          </td>

                          {/* Contacto */}
                          <td className="py-3.5 px-4 text-charcoal/80">
                            <div className="inline-flex items-center gap-2">
                              <MailIcon className="w-3.5 h-3.5 text-sage shrink-0" />
                              <span className="truncate max-w-[200px]">{prof.email}</span>
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                prof.status === 'Activo'
                                  ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                                  : 'bg-[#F1EFEA] text-sage border border-border-tan'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  prof.status === 'Activo' ? 'bg-brand' : 'bg-sage'
                                }`}
                              />
                              <span>{prof.status}</span>
                            </span>
                          </td>

                          {/* Acciones */}
                          <td
                            className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProfesional(prof)
                                setIsProfModalOpen(true)
                              }}
                              className="p-1.5 text-sage hover:text-brand hover:bg-white rounded-lg border border-transparent hover:border-border-tan transition cursor-pointer shadow-2xs inline-flex items-center justify-center"
                              aria-label={`Editar ${prof.name}`}
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer de Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border-tan/50 bg-white text-xs text-sage">
              <span>
                Mostrando {filteredProfesionales.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredProfesionales.length)} de{' '}
                {filteredProfesionales.length} profesionales
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center justify-center px-2.5 h-8 rounded-lg text-[0.75rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                  aria-label="Página anterior"
                >
                  Anterior
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[0.85rem] cursor-pointer transition-all duration-150 ${
                      currentPage === num
                        ? 'bg-brand text-white font-bold'
                        : 'font-semibold text-sage hover:bg-[#F5F3EE] hover:text-brand'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center justify-center px-2.5 h-8 rounded-lg text-[0.75rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                  aria-label="Página siguiente"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECCIÓN DE AGENDA / HORARIO DEL PROFESIONAL SELECCIONADO           */}
          {/* ================================================================= */}
          {selectedProfesional && (
            <div className="relative z-10 space-y-4 animate-view-popup pt-2 mb-4 sm:mb-6 shrink-0">
              {/* Header de la Agenda con Título y Botones */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className="w-5 h-5 text-brand shrink-0" />
                  <h2 className="text-lg sm:text-xl font-bold text-brand tracking-tight">
                    Horario: {selectedProfesional.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="bg-terracotta hover:bg-[#A34E35] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs active:translate-y-0.5"
                  >
                    <SaveIcon className="w-4 h-4 text-white" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>

              {/* Grid Semanal de 7 Columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
                {DIAS_SEMANA.map((dia) => {
                  const dayBlocks = selectedProfesional.horario.filter((b) => b.dia === dia)

                  return (
                    <div
                      key={dia}
                      className="bg-white/90 border border-border-tan rounded-2xl p-3 flex flex-col justify-between shadow-2xs min-h-[220px] transition-all hover:border-brand/30"
                    >
                      {/* Día Header */}
                      <div>
                        <div className="text-center font-bold text-[11px] sm:text-xs text-charcoal/80 uppercase tracking-wider pb-2 border-b border-border-tan/50 mb-2.5">
                          {dia}
                        </div>

                        {/* Bloques asignados */}
                        <div className="space-y-2">
                          {dayBlocks.length === 0 ? (
                            <div className="py-6 text-center text-sage/60 text-[11px] italic font-medium">
                              Sin turnos
                            </div>
                          ) : (
                            dayBlocks.map((block) => (
                              <div
                                key={block.id}
                                className="bg-[#FAF8F5] border-l-[3.5px] border-brand border border-border-tan/60 rounded-xl p-2.5 shadow-2xs group relative hover:bg-white transition"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-extrabold text-xs text-brand tabular-nums">
                                    {block.horaInicio} - {block.horaFin}
                                  </span>

                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedDiaForBlock(dia)
                                        setEditingBlock(block)
                                        setIsBlockModalOpen(true)
                                      }}
                                      className="text-sage hover:text-brand p-0.5 cursor-pointer"
                                      aria-label="Editar bloque"
                                    >
                                      <EditIcon className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBloque(block.id)}
                                      className="text-sage hover:text-danger p-0.5 cursor-pointer"
                                      aria-label="Eliminar bloque"
                                    >
                                      <TrashIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <p className="text-[11px] text-sage font-semibold mt-0.5 leading-snug">
                                  {block.tipoAtencion}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Botón Agregar Bloque al final de cada día */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDiaForBlock(dia)
                          setEditingBlock(null)
                          setIsBlockModalOpen(true)
                        }}
                        className="w-full mt-3 py-1.5 rounded-xl border border-dashed border-border-tan hover:border-brand/40 text-[11px] font-bold text-sage hover:text-brand hover:bg-mint-soft/30 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <PlusIcon className="w-3 h-3" />
                        <span>Agregar Bloque</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL / DRAWER: AGREGAR / EDITAR PROFESIONAL                           */}
      {/* ===================================================================== */}
      {isProfModalOpen && (
        <ProfesionalModal
          isOpen={isProfModalOpen}
          editingProfesional={editingProfesional}
          specialtyOptions={specialtyNames}
          onClose={() => {
            setIsProfModalOpen(false)
            setEditingProfesional(null)
          }}
          onSave={handleSaveProfesional}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL: AGREGAR / EDITAR BLOQUE DE HORARIO                             */}
      {/* ===================================================================== */}
      {isBlockModalOpen && (
        <BloqueHorarioModal
          isOpen={isBlockModalOpen}
          initialDia={selectedDiaForBlock}
          editingBlock={editingBlock}
          onClose={() => {
            setIsBlockModalOpen(false)
            setEditingBlock(null)
          }}
          onSave={handleSaveBloque}
        />
      )}
    </div>
  )
}

/* ============================================================================
   MODAL PARA AGREGAR / EDITAR PROFESIONAL
   ============================================================================ */
/* ============================================================================
   DRAWER / PANEL LATERAL PARA AGREGAR / EDITAR PROFESIONAL
   ============================================================================ */
function ProfesionalModal({
  isOpen,
  editingProfesional,
  specialtyOptions,
  onClose,
  onSave,
}: {
  isOpen: boolean
  editingProfesional: ProfesionalSuperAdmin | null
  specialtyOptions: string[]
  onClose: () => void
  onSave: (data: ProfesionalFormData) => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [name, setName] = useState(editingProfesional?.name || '')
  const [cmp, setCmp] = useState(editingProfesional?.cmp || '')
  const [especialidad, setEspecialidad] = useState(
    editingProfesional?.especialidad || specialtyOptions[0] || 'Medicina General',
  )
  const [email, setEmail] = useState(editingProfesional?.email || '')
  const [phone, setPhone] = useState(editingProfesional?.phone || '')
  const [status, setStatus] = useState<EstadoProfesional>(editingProfesional?.status || 'Activo')
  const [avatarUrl, setAvatarUrl] = useState(editingProfesional?.avatarUrl || '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setName(editingProfesional?.name || '')
      setCmp(editingProfesional?.cmp || '')
      setEspecialidad(
        editingProfesional?.especialidad || specialtyOptions[0] || 'Medicina General',
      )
      setEmail(editingProfesional?.email || '')
      setPhone(editingProfesional?.phone || '')
      setStatus(editingProfesional?.status || 'Activo')
      setAvatarUrl(editingProfesional?.avatarUrl || '')
      setError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [editingProfesional, isOpen, isRendered, specialtyOptions])

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
    if (!name.trim()) {
      setError('Por favor ingresa el nombre del profesional.')
      return
    }
    if (!cmp.trim()) {
      setError('Por favor ingresa el número de colegiatura (CMP).')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.')
      return
    }

    onSave({
      name: name.trim(),
      cmp: cmp.trim(),
      especialidad,
      email: email.trim(),
      phone: phone.trim() || undefined,
      status,
      avatarUrl: avatarUrl.trim() || undefined,
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
            <div className="w-9 h-9 rounded-xl bg-mint-soft text-brand flex items-center justify-center">
              <DoctorIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-brand">
              {editingProfesional ? 'Editar Profesional' : 'Agregar Profesional'}
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
              Nombre Completo <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Dra. Elena Vargas"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Colegiatura (CMP) <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={cmp}
              onChange={(e) => setCmp(e.target.value)}
              placeholder="Ej. 84729"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Especialidad <span className="text-terracotta">*</span>
            </label>
            <select
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              {specialtyOptions.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Correo Electrónico <span className="text-terracotta">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@vetpro.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Teléfono / Celular
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+51 987 654 321"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EstadoProfesional)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

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
              {editingProfesional ? 'Guardar Cambios' : 'Registrar Profesional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ============================================================================
   DRAWER / PANEL LATERAL PARA AGREGAR / EDITAR BLOQUE DE HORARIO
   ============================================================================ */
function BloqueHorarioModal({
  isOpen,
  initialDia,
  editingBlock,
  onClose,
  onSave,
}: {
  isOpen: boolean
  initialDia: DiaSemana
  editingBlock: BloqueHorario | null
  onClose: () => void
  onSave: (dia: DiaSemana, horaInicio: string, horaFin: string, tipoAtencion: string) => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [dia, setDia] = useState<DiaSemana>(editingBlock?.dia || initialDia)
  const [horaInicio, setHoraInicio] = useState(editingBlock?.horaInicio || '08:00')
  const [horaFin, setHoraFin] = useState(editingBlock?.horaFin || '12:00')
  const [tipoAtencion, setTipoAtencion] = useState(editingBlock?.tipoAtencion || 'Consulta General')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setDia(editingBlock?.dia || initialDia)
      setHoraInicio(editingBlock?.horaInicio || '08:00')
      setHoraFin(editingBlock?.horaFin || '12:00')
      setTipoAtencion(editingBlock?.tipoAtencion || 'Consulta General')
      setError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [editingBlock, initialDia, isOpen, isRendered])

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
    if (!horaInicio || !horaFin) {
      setError('Por favor selecciona hora de inicio y fin.')
      return
    }
    if (horaInicio >= horaFin) {
      setError('La hora de inicio debe ser anterior a la hora de fin.')
      return
    }

    onSave(dia, horaInicio, horaFin, tipoAtencion)
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-ochre-soft text-brand flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-brand">
              {editingBlock ? 'Editar Turno / Bloque' : 'Agregar Turno / Bloque'}
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
            <div className="p-3 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Día de la Semana</label>
            <select
              value={dia}
              onChange={(e) => setDia(e.target.value as DiaSemana)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              {DIAS_SEMANA.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Hora Inicio</label>
            <input
              type="time"
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Hora Fin</label>
            <input
              type="time"
              required
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Tipo de Atención / Servicio</label>
            <select
              value={tipoAtencion}
              onChange={(e) => setTipoAtencion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              {TIPOS_ATENCION_OPCIONES.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-border-tan/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone hover:text-charcoal transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition shadow-xs cursor-pointer"
            >
              {editingBlock ? 'Guardar Cambios' : 'Agregar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
