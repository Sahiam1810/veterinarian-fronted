import { useState, useEffect, type FormEvent } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'
import { useServiciosSuperAdmin } from '../../hooks'
import type {
  ServicioSuperAdmin,
  ServicioFormData,
  EstadoServicio,
} from '../../types'
import type { ModuleId, NotificacionSuperAdmin } from '../../types'
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  StethoscopeIcon,
  CheckIcon,
} from '@/global/components'

export interface ServiciosSuperAdminProps {
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

export function ServiciosSuperAdmin({
  onNavigate,
  activeRoute = 'servicios',
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
}: ServiciosSuperAdminProps = {}) {
  // Navigation & Sidebar state
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
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    activeNotification,
    showToast,
    isDrawerOpen,
    setIsDrawerOpen,
    editingServicio,
    setEditingServicio,
    totalPages,
    paginatedServicios,
    filteredServicios,
    handleSaveServicio,
    handleDeleteServicio,
    typeServices,
  } = useServiciosSuperAdmin()

  // Navigation helper
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

          {/* Header de la Vista */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop-in stagger-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
                Servicios
              </h1>
              <p className="text-xs sm:text-sm text-sage font-medium mt-1">
                Catálogo de prestaciones veterinarias.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingServicio(null)
                setIsDrawerOpen(true)
              }}
              className="bg-terracotta hover:bg-[#A34E35] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition cursor-pointer active:translate-y-0.5 shrink-0 self-start sm:self-auto"
            >
              <PlusIcon className="w-4 h-4 text-white" />
              <span>Nuevo servicio</span>
            </button>
          </div>

          {/* Contenedor Unificado: Filtros + Tabla */}
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
                  placeholder="Buscar por nombre o descripción..."
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

              {/* Dropdown Estado */}
              <div className="shrink-0">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border-tan bg-bone/30 focus:bg-white text-xs sm:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer min-w-[170px]"
                >
                  <option value="all">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>

            {/* Tabla de Servicios */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-bone/80 border-b border-border-tan/60 text-sage text-[0.72rem] font-bold tracking-wider uppercase">
                    <th className="py-3 px-6 w-1/4">Servicio</th>
                    <th className="py-3 px-4 w-1/3">Descripción</th>
                    <th className="py-3 px-4 text-center w-24">Duración</th>
                    <th className="py-3 px-4 text-center w-24">Precio</th>
                    <th className="py-3 px-4 text-center w-24">Estado</th>
                    <th className="py-3 px-6 text-center w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
                  {paginatedServicios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sage font-medium">
                        No se encontraron servicios registrados.
                      </td>
                    </tr>
                  ) : (
                    paginatedServicios.map((srv) => (
                      <tr key={srv.id} className="hover:bg-bone/40 transition">
                        {/* Servicio */}
                        <td className="py-3.5 px-6 font-bold text-charcoal">
                          {srv.name}
                        </td>

                        {/* Descripción */}
                        <td className="py-3.5 px-4 text-charcoal/80 text-[11px] sm:text-xs leading-relaxed max-w-[250px] truncate">
                          {srv.description}
                        </td>

                        {/* Duración */}
                        <td className="py-3.5 px-4 text-center text-charcoal/80 font-medium whitespace-nowrap">
                          {srv.duration} min
                        </td>

                        {/* Precio */}
                        <td className="py-3.5 px-4 text-center text-charcoal font-semibold whitespace-nowrap">
                          ${srv.price.toFixed(2)}
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                              srv.status === 'Activo'
                                ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                                : 'bg-[#F1EFEA] text-sage border border-border-tan'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                srv.status === 'Activo' ? 'bg-brand' : 'bg-sage'
                              }`}
                            />
                            <span>{srv.status}</span>
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingServicio(srv)
                                setIsDrawerOpen(true)
                              }}
                              className="p-1.5 text-sage hover:text-brand hover:bg-white rounded-lg border border-transparent hover:border-border-tan transition cursor-pointer"
                              aria-label={`Editar ${srv.name}`}
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteServicio(srv.id)}
                              className="p-1.5 text-sage hover:text-danger hover:bg-white rounded-lg border border-transparent hover:border-border-tan transition cursor-pointer"
                              aria-label={`Desactivar ${srv.name}`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer de Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border-tan/50 bg-white text-xs text-sage">
              <span>
                Mostrando {filteredServicios.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredServicios.length)} de{' '}
                {filteredServicios.length} servicios
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
        </main>
      </div>

      {/* Side-over Drawer para Crear / Editar Servicio */}
      <ServicioDrawer
        isOpen={isDrawerOpen}
        editingServicio={editingServicio}
        typeServices={typeServices}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingServicio(null)
        }}
        onSave={handleSaveServicio}
      />
    </div>
  )
}

/* ============================================================================
   DRAWER / PANEL LATERAL PARA AGREGAR / EDITAR SERVICIO
   ============================================================================ */
function ServicioDrawer({
  isOpen,
  editingServicio,
  typeServices,
  onClose,
  onSave,
}: {
  isOpen: boolean
  editingServicio: ServicioSuperAdmin | null
  typeServices: { id: string; name: string }[]
  onClose: () => void
  onSave: (data: ServicioFormData) => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  // Form states
  const [name, setName] = useState(editingServicio?.name || '')
  const [description, setDescription] = useState(editingServicio?.description || '')
  const [duration, setDuration] = useState<string>(editingServicio?.duration.toString() || '30')
  const [price, setPrice] = useState<string>(editingServicio?.price.toString() || '45')
  const [status, setStatus] = useState<EstadoServicio>(editingServicio?.status || 'Activo')
  const [typeServiceId, setTypeServiceId] = useState(
    editingServicio?.typeServiceId || typeServices[0]?.id || '',
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setName(editingServicio?.name || '')
      setDescription(editingServicio?.description || '')
      setDuration(editingServicio?.duration.toString() || '30')
      setPrice(editingServicio?.price.toString() || '45')
      setStatus(editingServicio?.status || 'Activo')
      setTypeServiceId(editingServicio?.typeServiceId || typeServices[0]?.id || '')
      setError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [editingServicio, isOpen, isRendered, typeServices])

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
      setError('Por favor ingresa el nombre del servicio.')
      return
    }
    if (!description.trim()) {
      setError('Por favor ingresa una descripción del servicio.')
      return
    }
    const dVal = parseInt(duration, 10)
    if (isNaN(dVal) || dVal <= 0) {
      setError('Por favor ingresa una duración válida (mayor a 0).')
      return
    }
    const pVal = parseFloat(price)
    if (isNaN(pVal) || pVal < 0) {
      setError('Por favor ingresa un precio válido (mayor o igual a 0).')
      return
    }

    if (!typeServiceId) {
      setError('Selecciona un tipo de servicio.')
      return
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      duration: dVal,
      price: pVal,
      status,
      typeServiceId,
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
              <StethoscopeIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-brand">
              {editingServicio ? 'Editar Servicio' : 'Nuevo servicio'}
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
              Nombre del Servicio <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Consulta General"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Tipo de servicio <span className="text-terracotta">*</span>
            </label>
            <select
              required
              value={typeServiceId}
              onChange={(e) => setTypeServiceId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
            >
              {typeServices.length === 0 ? (
                <option value="">Sin tipos disponibles</option>
              ) : (
                typeServices.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Descripción <span className="text-terracotta">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Evaluación médica básica para mascotas de todas las edades."
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Duración (minutos) <span className="text-terracotta">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ej. 30"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Precio ($) <span className="text-terracotta">*</span>
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej. 45.00"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EstadoServicio)}
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
              {editingServicio ? 'Guardar Cambios' : 'Registrar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
