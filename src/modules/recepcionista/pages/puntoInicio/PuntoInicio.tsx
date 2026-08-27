import { AdminHeader } from '@/modules/administrador'
import {
  RecepAgendaDelDia,
  RecepHomeGreeting,
  RecepHomeStatCards,
  RecepQuickActions,
  RecepSidebar,
  ViewPopup,
} from '../../components'
import { useRecepHome } from '../../hooks'
import { AgendaPage } from '../agenda'
import { DuenosPage } from '../duenos'
import { MascotasPage } from '../mascotas'
import { PerfilPage } from '../perfil'

interface PuntoInicioProps {
  userName?: string
  userRole?: string
  onLogout?: () => void
}

// Shell del recepcionista: Home + Dueños + Agenda + Mascotas + Perfil
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
    handleQuickAction,
    handleViewFullMonth,
    handleRowAction,
  } = useRecepHome(onLogout)

  const isPerfil = activeRoute === 'perfil'
  const isMascotas = activeRoute === 'mascotas'
  const isAgenda = activeRoute === 'agenda'
  const isDuenos = activeRoute === 'duenos'
  const fillHeight = isMascotas || isAgenda || isDuenos

  return (
    <div className="h-screen max-h-screen overflow-hidden overflow-x-hidden flex flex-col bg-bone">
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        unreadNotificationsCount={3}
        userName={userName || dashboard?.profile.displayName || 'Carlos Méndez'}
        userRole={userRole || 'Recepcionista'}
      />

      <div className="flex flex-1 h-[calc(100vh-57px)] overflow-hidden overflow-x-hidden relative min-w-0">
        <RecepSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
          grantedPermissions={grantedPermissions}
          onLogout={onLogout}
        />

        <main
          className={`flex-1 h-full min-w-0 overflow-x-hidden flex flex-col max-w-[1400px] w-full mx-auto ${
            fillHeight
              ? 'overflow-y-hidden p-3 sm:p-4 lg:p-5 gap-3'
              : 'overflow-y-auto p-4 sm:p-5 lg:p-6 xl:p-7 gap-4 sm:gap-5'
          }`}
        >
          {activeRoute === 'inicio' && (
            <ViewPopup
              animationKey="inicio"
              className="flex flex-col gap-4 sm:gap-5 min-w-0"
            >
              {isLoading && (
                <p className="text-sm text-sage font-medium">
                  Cargando resumen de recepción…
                </p>
              )}

              {error && (
                <p className="text-sm text-danger font-medium" role="alert">
                  {error}
                </p>
              )}

              {dashboard && !isLoading && (
                <>
                  <ViewPopup delayMs={40}>
                    <RecepHomeGreeting
                      formattedDate={dashboard.formattedDate}
                      workstationLabel={dashboard.profile.workstationLabel}
                    />
                  </ViewPopup>

                  <ViewPopup delayMs={80}>
                    <RecepHomeStatCards stats={dashboard.stats} />
                  </ViewPopup>

                  <ViewPopup delayMs={120}>
                    <RecepQuickActions onAction={handleQuickAction} />
                  </ViewPopup>

                  <ViewPopup delayMs={160}>
                    <RecepAgendaDelDia
                      appointments={dashboard.appointments}
                      onViewFullMonth={handleViewFullMonth}
                      onRowAction={handleRowAction}
                    />
                  </ViewPopup>
                </>
              )}
            </ViewPopup>
          )}

          {isDuenos && <DuenosPage onNotice={showToast} />}

          {isAgenda && <AgendaPage onNotice={showToast} />}

          {isMascotas && <MascotasPage onNotice={showToast} />}

          {isPerfil && <PerfilPage onNotice={showToast} />}

          {activeRoute !== 'inicio' &&
            activeRoute !== 'perfil' &&
            activeRoute !== 'mascotas' &&
            activeRoute !== 'agenda' &&
            activeRoute !== 'duenos' && (
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
