import { SuperAdminHeader, DashboardBackgroundDecoration } from '@/modules/superadmin'
import {
  ClienteHomeGreeting,
  ClienteInicioView,
  ClienteSidebar,
  ViewPopup,
} from '../../components'
import { useClienteHome } from '../../hooks'
import { CitasPage } from '../citas'
import { HistorialPage } from '../historial'
import { MascotasPage } from '../mascotas'
import { PerfilPage } from '../perfil'

interface PuntoInicioProps {
  userName?: string
  userRole?: string
  onLogout?: () => void
}

// Shell del portal cliente: Inicio + Mascotas + Citas + Historial + Perfil
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
    activeNotification,
    showToast,
    handleViewMascotas,
    handleViewCitas,
    handleRescheduleAppointment,
    handleViewAppointmentDetails,
  } = useClienteHome(onLogout)

  const isMascotas = activeRoute === 'mascotas'
  const isCitas = activeRoute === 'citas'
  const isHistorial = activeRoute === 'historial'
  const fillHeight = isMascotas || isCitas || isHistorial || activeRoute === 'perfil'

  return (
    <div className="h-screen max-h-screen overflow-hidden overflow-x-hidden flex flex-col bg-bone">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        unreadNotificationsCount={1}
        userName={userName || dashboard?.profile.displayName || 'Ana Gómez'}
        userRole={userRole || 'Cliente'}
      />

      <div className="flex flex-1 h-[calc(100vh-57px)] overflow-hidden overflow-x-hidden relative min-w-0">
        <ClienteSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
          grantedPermissions={grantedPermissions}
          onLogout={onLogout}
        />

        <main
          className={`flex-1 h-full min-w-0 overflow-x-hidden flex flex-col max-w-[1400px] w-full mx-auto relative ${
            fillHeight
              ? 'overflow-y-hidden p-3 sm:p-4 lg:p-5 gap-3'
              : 'overflow-y-auto p-4 sm:p-5 lg:p-6 xl:p-7 gap-4 sm:gap-5'
          }`}
        >
          <DashboardBackgroundDecoration />
          {activeRoute === 'inicio' && (
            <ViewPopup animationKey="inicio" className="flex flex-col gap-4 sm:gap-5 min-w-0">
              {isLoading && (
                <p className="text-sm text-sage font-medium">Cargando tu portal…</p>
              )}

              {error && (
                <p className="text-sm text-danger font-medium" role="alert">
                  {error}
                </p>
              )}

              {dashboard && !isLoading && (
                <>
                  <ViewPopup delayMs={40}>
                    <ClienteHomeGreeting
                      displayName={userName || dashboard.profile.displayName}
                      summarySubtitle={dashboard.summarySubtitle}
                    />
                  </ViewPopup>

                  <ViewPopup delayMs={80}>
                    <ClienteInicioView
                      stats={dashboard.stats}
                      nextAppointment={dashboard.nextAppointment}
                      onViewMascotas={handleViewMascotas}
                      onViewCitas={handleViewCitas}
                      onReschedule={handleRescheduleAppointment}
                      onViewDetails={handleViewAppointmentDetails}
                    />
                  </ViewPopup>
                </>
              )}
            </ViewPopup>
          )}

          {isMascotas && (
            <ViewPopup animationKey="mascotas" className="h-full min-h-0">
              <MascotasPage
                onNotice={showToast}
                onNavigateCitas={handleViewCitas}
                onNavigateHistorial={() => handleNavigate('historial')}
              />
            </ViewPopup>
          )}

          {isCitas && (
            <ViewPopup animationKey="citas" className="h-full min-h-0">
              <CitasPage onNotice={showToast} />
            </ViewPopup>
          )}

          {isHistorial && (
            <ViewPopup animationKey="historial" className="h-full min-h-0">
              <HistorialPage onNotice={showToast} onNavigateCitas={handleViewCitas} />
            </ViewPopup>
          )}

          {activeRoute === 'perfil' && (
            <ViewPopup animationKey="perfil" className="h-full min-h-0">
              <PerfilPage onNotice={showToast} />
            </ViewPopup>
          )}
        </main>
      </div>

      {activeNotification && (
        <div className="toast-pop-up-bottom fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]">
          <div className="bg-brand text-white px-5 py-2.5 rounded-full shadow-xl text-xs sm:text-sm font-medium border border-white/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ochre animate-pulse shrink-0" />
            <span className="truncate">{activeNotification}</span>
          </div>
        </div>
      )}
    </div>
  )
}
