import { AdminHeader, DashboardBackgroundDecoration } from '@/modules/administrador'
import {
  VetHomeGreeting,
  VetHomeStatCards,
  VetAgendaDelDia,
  VetSidebar,
  ViewPopup,
} from '../../components'
import { AgendaPage } from '../agenda'
import { MascotasPage } from '../mascotas'
import { PerfilPage } from '../perfil'
import { useVetHome } from '../../hooks'

interface PuntoInicioProps {
  userName?: string
  userRole?: string
  onLogout?: () => void
}

// Shell del veterinario: Inicio, Agenda, Mascotas y Perfil
export function PuntoInicio({
  userName,
  userRole,
  onLogout,
}: PuntoInicioProps = {}) {
  const {
    dashboard,
    grantedPermissions,
    isLoading,
    error,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    activeRoute,
    handleNavigate,
    handlePrimaryAction,
    activeNotification,
    showToast,
    handleViewFullAgenda,
    handleAttendNow,
    handleViewAppointment,
    handleMoreActions,
  } = useVetHome()

  const isAgenda = activeRoute === 'agenda'
  const isMascotas = activeRoute === 'mascotas'
  const isPerfil = activeRoute === 'perfil'
  const fillHeight = isAgenda || isMascotas
  // Perfil ya no fuerza alto completo: se alinea al contenido

  return (
    <div className="h-screen max-h-screen overflow-hidden overflow-x-hidden flex flex-col bg-bone">
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        unreadNotificationsCount={2}
        userName={userName || dashboard?.profile.displayName || 'Dr. Roberto Silva'}
        userRole={userRole || 'Veterinario'}
      />


      <div className="flex flex-1 h-[calc(100vh-57px)] overflow-hidden overflow-x-hidden relative min-w-0">
        <VetSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
          onPrimaryAction={handlePrimaryAction}
          grantedPermissions={grantedPermissions}
          onLogout={onLogout}
        />


        <main
          className={`flex-1 h-full min-w-0 overflow-x-hidden p-4 sm:p-5 lg:p-6 xl:p-7 flex flex-col gap-4 sm:gap-5 max-w-[1400px] w-full mx-auto relative ${
            fillHeight ? 'overflow-y-hidden' : 'overflow-y-auto'
          }`}
        >
          <DashboardBackgroundDecoration />
          {activeRoute === 'inicio' && (
            <ViewPopup animationKey="inicio" className="flex flex-col gap-4 sm:gap-5 min-w-0">
              {isLoading && (
                <p className="text-sm text-sage font-medium">Cargando punto de inicio…</p>
              )}

              {error && (
                <p className="text-sm text-danger font-medium" role="alert">
                  {error}
                </p>
              )}

              {dashboard && !isLoading && (
                <>
                  <ViewPopup delayMs={40}>
                    <VetHomeGreeting
                      profile={dashboard.profile}
                      formattedDate={dashboard.formattedDate}
                    />
                  </ViewPopup>

                  <ViewPopup delayMs={90}>
                    <VetHomeStatCards stats={dashboard.stats} />
                  </ViewPopup>

                  <ViewPopup delayMs={140}>
                    <VetAgendaDelDia
                      appointments={dashboard.appointments}
                      totalAppointmentsToday={dashboard.totalAppointmentsToday}
                      onViewFullAgenda={handleViewFullAgenda}
                      onAttendNow={handleAttendNow}
                      onViewAppointment={handleViewAppointment}
                      onMoreActions={handleMoreActions}
                    />
                  </ViewPopup>
                </>
              )}
            </ViewPopup>
          )}

          {isAgenda && <AgendaPage onNotice={showToast} />}

          {isMascotas && <MascotasPage onNotice={showToast} />}

          {isPerfil && <PerfilPage onNotice={showToast} />}

          {activeRoute !== 'inicio' &&
            activeRoute !== 'agenda' &&
            activeRoute !== 'mascotas' &&
            activeRoute !== 'perfil' && (
              <ViewPopup animationKey={activeRoute}>
                <p className="text-sm text-sage font-medium">
                  Módulo “{activeRoute}” pendiente de implementación.
                </p>
              </ViewPopup>
            )}
        </main>
      </div>

      {activeNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]">
          <div
            role="status"
            aria-live="polite"
            className="view-popup bg-brand text-white px-5 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-medium border border-white/20 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-ochre animate-pulse shrink-0" />
            <span className="truncate">{activeNotification}</span>
          </div>
        </div>
      )}
    </div>
  )
}
