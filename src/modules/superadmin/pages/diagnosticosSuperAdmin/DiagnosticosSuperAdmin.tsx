import { useState, useEffect, type FormEvent } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'
import { useDiagnosticosSuperAdmin } from '../../hooks/useDiagnosticosSuperAdmin'
import type {
  DiagnosticoCatalogo,
  DiagnosticoFormData,
  EstadoDiagnostico,
} from '../../types/diagnosticosSuperAdmin.types'
import type { ModuleId, NotificacionSuperAdmin } from '../../types'
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  MedicalHistoryIcon,
  PageToast,
} from '@/global/components'

export interface DiagnosticosSuperAdminProps {
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

export function DiagnosticosSuperAdmin({
  onNavigate,
  activeRoute = 'diagnosticos',
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
}: DiagnosticosSuperAdminProps = {}) {
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
    toastTone,
    showToast,
    isDrawerOpen,
    setIsDrawerOpen,
    editingDiagnostico,
    setEditingDiagnostico,
    totalPages,
    paginatedDiagnosticos,
    filteredDiagnosticos,
    handleSaveDiagnostico,
    handleDeactivateDiagnostico,
    isLoading,
  } = useDiagnosticosSuperAdmin()

  const [pendingDeactivate, setPendingDeactivate] = useState<DiagnosticoCatalogo | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)

  const requestDeactivate = (item: DiagnosticoCatalogo) => {
    if (item.status === 'Inactivo') {
      showToast('Este diagnóstico ya está inactivo.', 'warning')
      return
    }
    setPendingDeactivate(item)
  }

  const confirmDeactivate = async () => {
    if (!pendingDeactivate) return
    setIsDeactivating(true)
    try {
      await handleDeactivateDiagnostico(pendingDeactivate)
      setPendingDeactivate(null)
    } finally {
      setIsDeactivating(false)
    }
  }

  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) onNavigate(routeId)
    else showToast(`Navegando a: ${routeId}`)
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone relative text-charcoal">
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

          {activeNotification && (
            <PageToast message={activeNotification} tone={toastTone} />
          )}

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop-in stagger-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
                Diagnósticos
              </h1>
              <p className="text-xs sm:text-sm text-sage font-medium mt-1">
                Catálogo clínico para historias y vacunas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingDiagnostico(null)
                setIsDrawerOpen(true)
              }}
              className="bg-terracotta hover:bg-[#A34E35] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition cursor-pointer active:translate-y-0.5 shrink-0 self-start sm:self-auto"
            >
              <PlusIcon className="w-4 h-4 text-white" />
              <span>Nuevo diagnóstico</span>
            </button>
          </div>

          <div className="relative z-10 bg-white border border-border-tan rounded-2xl shadow-[0_4px_20px_rgba(35,78,70,0.04)] overflow-hidden animate-pop-in stagger-2 flex-1 flex flex-col">
            <div className="p-3.5 sm:p-4 border-b border-border-tan/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
              <div className="relative flex-1 min-w-[240px]">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Buscar por código, nombre o descripción..."
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

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-bone/80 border-b border-border-tan/60 text-sage text-[0.72rem] font-bold tracking-wider uppercase">
                    <th className="py-3 px-6 w-28">Código</th>
                    <th className="py-3 px-4 w-1/4">Nombre</th>
                    <th className="py-3 px-4">Descripción</th>
                    <th className="py-3 px-4 text-center w-24">Estado</th>
                    <th className="py-3 px-6 text-center w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sage font-medium">
                        Cargando diagnósticos…
                      </td>
                    </tr>
                  ) : paginatedDiagnosticos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sage font-medium">
                        No se encontraron diagnósticos. Crea el primero.
                      </td>
                    </tr>
                  ) : (
                    paginatedDiagnosticos.map((item) => (
                      <tr key={item.id} className="hover:bg-bone/40 transition">
                        <td className="py-3.5 px-6 font-bold text-brand font-mono text-xs">
                          {item.code}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-charcoal">{item.name}</td>
                        <td className="py-3.5 px-4 text-charcoal/80 text-[11px] sm:text-xs leading-relaxed max-w-[280px] truncate">
                          {item.description || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                              item.status === 'Activo'
                                ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                                : 'bg-[#F1EFEA] text-sage border border-border-tan'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'Activo' ? 'bg-brand' : 'bg-sage'
                              }`}
                            />
                            <span>{item.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDiagnostico(item)
                                setIsDrawerOpen(true)
                              }}
                              className="p-1.5 text-sage hover:text-brand hover:bg-white rounded-lg border border-transparent hover:border-border-tan transition cursor-pointer"
                              aria-label={`Editar ${item.name}`}
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDeactivate(item)}
                              disabled={item.status === 'Inactivo'}
                              title={
                                item.status === 'Inactivo'
                                  ? 'Ya está inactivo'
                                  : `Desactivar ${item.name}`
                              }
                              className="p-1.5 text-sage hover:text-danger hover:bg-white rounded-lg border border-transparent hover:border-border-tan transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:text-sage disabled:hover:bg-transparent disabled:hover:border-transparent"
                              aria-label={
                                item.status === 'Inactivo'
                                  ? `${item.name} ya está inactivo`
                                  : `Desactivar ${item.name}`
                              }
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border-tan/50 bg-white text-xs text-sage">
              <span>
                Mostrando{' '}
                {filteredDiagnosticos.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{' '}
                - {Math.min(currentPage * itemsPerPage, filteredDiagnosticos.length)} de{' '}
                {filteredDiagnosticos.length} diagnósticos
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

      <DiagnosticoDrawer
        isOpen={isDrawerOpen}
        editing={editingDiagnostico}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingDiagnostico(null)
        }}
        onSave={handleSaveDiagnostico}
      />

      {pendingDeactivate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] cursor-pointer"
            aria-label="Cerrar confirmación"
            disabled={isDeactivating}
            onClick={() => setPendingDeactivate(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-diagnostico-title"
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border-tan bg-white p-5 shadow-[0_16px_40px_rgba(35,78,70,0.18)]"
          >
            <h2
              id="deactivate-diagnostico-title"
              className="text-base font-bold text-brand tracking-tight"
            >
              ¿Desactivar diagnóstico?
            </h2>
            <p className="mt-2 text-sm text-charcoal leading-snug">
              Vas a desactivar{' '}
              <span className="font-bold">{pendingDeactivate.name}</span>. Las historias
              clínicas existentes se conservan; no se ofrecerá en registros nuevos.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeactivating}
                onClick={() => setPendingDeactivate(null)}
                className="px-3.5 py-2 rounded-xl border border-border-tan bg-bone text-charcoal text-xs font-semibold transition cursor-pointer hover:bg-cream disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeactivating}
                onClick={() => void confirmDeactivate()}
                className="px-3.5 py-2 rounded-xl bg-terracotta text-white text-xs font-bold transition cursor-pointer hover:bg-[#b55e43] disabled:opacity-50"
              >
                {isDeactivating ? 'Desactivando…' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DiagnosticoDrawer({
  isOpen,
  editing,
  onClose,
  onSave,
}: {
  isOpen: boolean
  editing: DiagnosticoCatalogo | null
  onClose: () => void
  onSave: (data: DiagnosticoFormData) => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [code, setCode] = useState(editing?.code || '')
  const [name, setName] = useState(editing?.name || '')
  const [description, setDescription] = useState(editing?.description || '')
  const [status, setStatus] = useState<EstadoDiagnostico>(editing?.status || 'Activo')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setCode(editing?.code || '')
      setName(editing?.name || '')
      setDescription(editing?.description || '')
      setStatus(editing?.status || 'Activo')
      setError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [editing, isOpen, isRendered])

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
    if (!code.trim()) {
      setError('Por favor ingresa el código del diagnóstico.')
      return
    }
    if (code.trim().length > 15) {
      setError('El código no puede superar 15 caracteres.')
      return
    }
    if (!name.trim()) {
      setError('Por favor ingresa el nombre del diagnóstico.')
      return
    }

    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
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
              <MedicalHistoryIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-brand">
              {editing ? 'Editar diagnóstico' : 'Nuevo diagnóstico'}
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
              Código <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={15}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. PREV"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Nombre <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Control preventivo / Vacunación de rutina"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Descripción</label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción clínica opcional"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
            />
          </div>

          {editing && (
            <div>
              <label className="block font-bold text-charcoal mb-1.5">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EstadoDiagnostico)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {status === 'Inactivo' && (
                <p className="mt-1.5 text-[11px] text-sage leading-snug">
                  No se ofrecerá en nuevos registros; las historias que ya lo usan se conservan.
                </p>
              )}
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
              {editing ? 'Guardar cambios' : 'Registrar diagnóstico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
