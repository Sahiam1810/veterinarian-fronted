import { useState } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'
import { ReportesKpiCards } from '../../components/reportes/ReportesKpiCards'
import { ReportesChartsPanel } from '../../components/reportes/ReportesChartsPanel'
import { ReportesCitasDetalleTable } from '../../components/reportes/ReportesCitasDetalleTable'
import { PageToast } from '@/global/components'
import { useReportesSuperAdmin } from '../../hooks'
import type { ModuleId, NotificacionSuperAdmin, ReportesPeriodoId } from '../../types'

export interface ReportesSuperAdminProps {
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

// Vista Reportes del panel Admin/SuperAdmin (sin cablear /api/Reports todavía)
export function ReportesSuperAdmin({
  onNavigate,
  activeRoute = 'reportes',
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
}: ReportesSuperAdminProps = {}) {
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  const {
    period,
    setPeriod,
    periodOptions,
    range,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredCitas,
    dashboard,
    activeNotification,
    showToast,
    exportCsv,
    isLoading,
    usingReportsApi,
  } = useReportesSuperAdmin()

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
        onProfileClick={() => showToast('Abriendo panel de perfil')}
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

          {activeNotification && <PageToast message={activeNotification} />}

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop-in stagger-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
                Reportes Administrativos
              </h1>
              <p className="text-xs sm:text-sm text-sage font-medium mt-1">
                Indicadores del periodo {range.from} → {range.to}.
                {usingReportsApi
                  ? ' Datos desde API de Reportes.'
                  : ' Vista preparada para /api/Reports; métricas provisionales desde citas.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as ReportesPeriodoId)}
                className="px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-bold focus:outline-none cursor-pointer shadow-2xs"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={exportCsv}
                className="bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs active:translate-y-0.5"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {isLoading && (
            <p className="relative z-10 text-sm text-sage font-medium animate-pop-in">
              Cargando reportes...
            </p>
          )}

          <div className="relative z-10 border-b border-border-tan/70 flex items-center justify-between gap-4 animate-pop-in stagger-1.5">
            <div className="flex items-center gap-6 sm:gap-8">
              <TabButton
                active={activeTab === 'resumen'}
                onClick={() => setActiveTab('resumen')}
                label="Resumen General"
              />
              <TabButton
                active={activeTab === 'detalles'}
                onClick={() => setActiveTab('detalles')}
                label="Detalle de Citas"
              />
            </div>
          </div>

          {activeTab === 'resumen' && !isLoading && (
            <div className="flex-1 flex flex-col gap-6 sm:gap-7 animate-view-popup">
              <ReportesKpiCards summary={dashboard.summary} topServices={dashboard.topServices} />
              <ReportesChartsPanel
                byStatus={dashboard.byStatus}
                byVeterinarian={dashboard.byVeterinarian}
                byDay={dashboard.byDay}
                topServices={dashboard.topServices}
              />
            </div>
          )}

          {activeTab === 'detalles' && !isLoading && (
            <ReportesCitasDetalleTable
              citas={filteredCitas}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-5 pt-3 pb-3.5 text-sm sm:text-[15px] font-semibold transition-colors cursor-pointer ${
        active
          ? "text-brand font-bold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full"
          : 'text-sage hover:text-brand'
      }`}
    >
      {label}
    </button>
  )
}
