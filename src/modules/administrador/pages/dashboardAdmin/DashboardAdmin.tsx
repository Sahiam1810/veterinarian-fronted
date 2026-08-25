import {
  AdminHeader,
  AdminSidebar,
  DashboardSummaryCards,
  UpcomingAppointmentsTable,
  QuickActionsCard,
  DashboardBackgroundDecoration,
} from '../../components'
import { useAdminDashboard } from '../../hooks'
import './DashboardAdmin.css'

export function DashboardAdmin() {
  const {
    stats,
    appointments,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    activeRoute,
    handleNavigate,
    activeNotification,
    handleCreateUser,
    handleRegisterOwner,
    handleRegisterPet,
    handleScheduleAppointment,
    handleViewAllAppointments,
    handleSelectAppointment,
  } = useAdminDashboard()

  return (
    <div className="dashboard-admin h-screen max-h-screen overflow-hidden flex flex-col bg-[#FAF5EC]">
      {/* Top Header - Siempre fijo y visible con z-50 y hamburguesa animada a X */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        unreadNotificationsCount={2}
        userName="Admin Veterinario"
        userRole="Administrador"
      />

      {/* Main Body with Left Sidebar & Content */}
      <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden relative">
        {/* Left Vertical Illustration Sidebar with Animated Reveal Menu (No modificado) */}
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
        />

        {/* Central Dashboard Content with Themed Background Decorations */}
        <main className="dashboard-admin__main-content flex-1 h-full overflow-y-auto p-5 sm:p-6 lg:p-7 xl:p-8 flex flex-col gap-6 sm:gap-7 max-w-[1600px] w-full mx-auto relative">
          {/* Subtle Themed Ambient Background Layer (Paws, botanical leaves & soft glow) */}
          <DashboardBackgroundDecoration />

          {/* Section 1: Resumen de Hoy (Metrics Cards) */}
          <div className="relative z-10">
            <DashboardSummaryCards stats={stats} />
          </div>

          {/* Section 2: Split Layout (Próximas Citas & Accesos Rápidos) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-7 items-start relative z-10">
            {/* Left: Próximas Citas Table */}
            <div className="lg:col-span-8 xl:col-span-8">
              <UpcomingAppointmentsTable
                appointments={appointments}
                onViewAll={handleViewAllAppointments}
                onSelectAppointment={handleSelectAppointment}
              />
            </div>

            {/* Right: Accesos Rápidos Buttons */}
            <div className="lg:col-span-4 xl:col-span-4">
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
          className="dashboard-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#234E46] text-white px-5 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-medium border border-white/20 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-[#E4A67A] animate-pulse"></span>
          <span>{activeNotification}</span>
        </div>
      )}
    </div>
  )
}
