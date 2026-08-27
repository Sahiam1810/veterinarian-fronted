import {
  AdminHeader,
  AdminSidebar,
  DashboardSummaryCards,
  UpcomingAppointmentsTable,
  QuickActionsCard,
  DashboardBackgroundDecoration,
} from '../../components'
import { useAdminDashboard } from '../../hooks'

interface DashboardAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
}

export function DashboardAdmin({
  onNavigate,
  activeRoute: externalActiveRoute,
  isSidebarOpen: externalIsSidebarOpen,
  onToggleSidebar: externalOnToggleSidebar,
  onCloseSidebar: externalOnCloseSidebar,
  userName = 'Admin Veterinario',
  userRole = 'Administrador',
  onLogout,
}: DashboardAdminProps = {}) {
  const {
    stats,
    appointments,
    isSidebarOpen: internalIsSidebarOpen,
    toggleSidebar: internalToggleSidebar,
    closeSidebar: internalCloseSidebar,
    activeRoute: internalActiveRoute,
    handleNavigate: internalHandleNavigate,
    activeNotification,
    handleRegisterOwner,
    handleRegisterPet,
    handleScheduleAppointment,
    handleViewAllAppointments,
    handleSelectAppointment,
  } = useAdminDashboard()

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

  const handleCreateUser = () => {
    handleNavigate('usuarios')
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone text-slate">
      {/* Top Header - Siempre fijo y visible con z-50 y hamburguesa animada a X */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        unreadNotificationsCount={2}
        userName={userName}
        userRole={userRole}
      />


      {/* Main Body with Left Sidebar & Content */}
      <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden relative">
        {/* Left Vertical Illustration Sidebar with Animated Reveal Menu */}
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={currentRoute}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />



        {/* Central Dashboard Content with Themed Background Decorations */}
        <main
          key={currentRoute}
          className="flex-1 h-full overflow-y-auto p-5 sm:p-6 lg:p-7 xl:p-8 flex flex-col gap-6 sm:gap-7 max-w-[1600px] w-full mx-auto relative animate-view-popup"
        >
          {/* Subtle Themed Ambient Background Layer (Paws, botanical leaves & soft glow) */}
          <DashboardBackgroundDecoration />

          {/* Section 1: Resumen de Hoy (Metrics Cards) */}
          <div className="relative z-10 animate-pop-in stagger-1">
            <DashboardSummaryCards stats={stats} />
          </div>

          {/* Section 2: Split Layout (Próximas Citas & Accesos Rápidos) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-7 items-start relative z-10">
            {/* Left: Próximas Citas Table */}
            <div className="lg:col-span-8 xl:col-span-8 animate-pop-in stagger-2">
              <UpcomingAppointmentsTable
                appointments={appointments}
                onViewAll={handleViewAllAppointments}
                onSelectAppointment={handleSelectAppointment}
              />
            </div>

            {/* Right: Accesos Rápidos Buttons */}
            <div className="lg:col-span-4 xl:col-span-4 animate-pop-in stagger-3">
              <QuickActionsCard
                onCreateUser={handleCreateUser}
                onRegisterOwner={handleRegisterOwner}
                onRegisterPet={handleRegisterPet}
                onScheduleAppointment={handleScheduleAppointment}
              />
            </div>
          </section>
        </main>

      </div>

      {/* Interactive Toast Notification Feedback */}
      {activeNotification && (
        <div
          role="status"
          aria-live="polite"
          className="dashboard-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand text-white px-5 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-medium border border-white/20 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-ochre animate-pulse" />
          <span>{activeNotification}</span>
        </div>
      )}
    </div>
  )
}
