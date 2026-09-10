import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardSummaryCards,
  UpcomingAppointmentsTable,
  DashboardBackgroundDecoration,
} from '../../components'
import { PageToast } from '@/global/components'
import { useSuperAdminDashboard } from '../../hooks'
import type { ModuleId, NotificacionSuperAdmin } from '../../types'

export interface DashboardSuperAdminProps {
  onNavigate?: (routeId: string) => void
  onProfileClick?: () => void
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

export function DashboardSuperAdmin({
  onNavigate,
  onProfileClick: externalOnProfileClick,
  activeRoute: externalActiveRoute,
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
}: DashboardSuperAdminProps = {}) {
  const {
    stats,
    appointments,
    isSidebarOpen: internalIsSidebarOpen,
    toggleSidebar: internalToggleSidebar,
    closeSidebar: internalCloseSidebar,
    activeRoute: internalActiveRoute,
    handleNavigate: internalHandleNavigate,
    activeNotification,
  } = useSuperAdminDashboard()

  const currentRoute = externalActiveRoute || internalActiveRoute
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar = externalOnToggleSidebar || internalToggleSidebar
  const closeSidebar = externalOnCloseSidebar || internalCloseSidebar

  const handleNavigate = (routeId: string) => {
    if (onNavigate) {
      onNavigate(routeId)
    } else {
      internalHandleNavigate(routeId)
    }
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone text-slate">
      {/* Top Header - Siempre fijo y visible con z-50 y hamburguesa animada a X */}
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        notifications={notifications}
        isLoadingNotifications={isLoadingNotifications}
        notificationsError={notificationsError}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onReloadNotifications={onReloadNotifications}
        userName={userName}
        userRole={userRole}
        onProfileClick={externalOnProfileClick || (() => handleNavigate('perfil'))}
      />

      {/* Main Body with Left Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Vertical Illustration Sidebar with Animated Reveal Menu */}
        <SuperAdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={currentRoute}
          onNavigate={handleNavigate}
          canViewModule={canViewModule}
          onLogout={onLogout}
        />

        {/* Central Dashboard Content with Themed Background Decorations */}
        <main
          key={currentRoute}
          className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7 xl:p-8 flex flex-col gap-6 sm:gap-7 relative animate-view-popup"
        >
          {/* Subtle Themed Ambient Background Layer (Paws, botanical leaves & soft glow) */}
          <DashboardBackgroundDecoration />

          {/* Section 1: Resumen de Hoy (Metrics Cards) */}
          <div className="relative z-10 animate-pop-in stagger-1">
            <DashboardSummaryCards stats={stats} />
          </div>

          {/* Section 2: Próximas Citas Table (Full Width) */}
          <section className="relative z-10 w-full animate-pop-in stagger-2">
            <UpcomingAppointmentsTable
              appointments={appointments}
              onViewAll={() => handleNavigate('agenda')}
              onSelectAppointment={() => handleNavigate('agenda')}
            />
          </section>
        </main>
      </div>

      {/* Interactive Toast Notification Feedback */}
      {activeNotification && <PageToast message={activeNotification} />}
    </div>
  )
}
