import { SuperAdminHeader, DashboardBackgroundDecoration } from '@/modules/superadmin'
import { PageToast } from '@/global/components'
import {
  RecepAgendaDelDia,
  RecepAgendamientoRapidoModal,
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
import { EscalacionesPage } from '../escalaciones'
import { EspeciesRazasPage } from '../especiesRazas'
import { ServiciosPage } from '../servicios'
import { ProfesionalesPage } from '../profesionales'
import { ReportesPage } from '../reportes'

interface PuntoInicioProps {
  userName?: string
  userRole?: string
  onLogout?: () => void
}

// Shell del recepcionista: Home + Dueños + Asesor/Conversaciones + Agenda + Mascotas + Especies + Servicios + Profesionales + Reportes + Perfil
export function PuntoInicio({
  userName,
  userRole,
  onLogout,
}: PuntoInicioProps = {}) {
  const {
    dashboard,
    grantedPermissions,
    allowedQuickActions,
    unreadEscalationsCount,
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
    isQuickBookingOpen,
    setIsQuickBookingOpen,
    reloadHome,
    canCreateModule,
    canEditModule,
    canDeleteModule,
  } = useRecepHome(onLogout)

  const isPerfil = activeRoute === 'perfil'
  const isMascotas = activeRoute === 'mascotas'
  const isAgenda = activeRoute === 'agenda'
  const isDuenos = activeRoute === 'duenos'
  const isConversaciones = activeRoute === 'conversaciones'
  const isEspeciesRazas = activeRoute === 'especiesRazas'
  const isServicios = activeRoute === 'servicios'
  const isProfesionales = activeRoute === 'profesionales'
  const isReportes = activeRoute === 'reportes'
  const fillHeight =
    isMascotas ||
    isAgenda ||
    isDuenos ||
    isConversaciones ||
    isEspeciesRazas ||
    isServicios ||
    isProfesionales ||
    isReportes

  return (
    <div className="h-screen max-h-screen overflow-hidden overflow-x-hidden flex flex-col bg-bone">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        userName={userName || dashboard?.profile.displayName || 'Carlos Méndez'}
        userRole={userRole || 'Recepcionista'}
        onProfileClick={() => handleNavigate('perfil')}
      />

      <div className="flex flex-1 h-[calc(100vh-57px)] overflow-hidden overflow-x-hidden relative min-w-0">
        <RecepSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
          grantedPermissions={grantedPermissions}
          unreadEscalationsCount={unreadEscalationsCount}
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
                    <RecepQuickActions
                      allowedActions={allowedQuickActions}
                      onAction={handleQuickAction}
                    />
                  </ViewPopup>

                  <ViewPopup delayMs={160}>
                    <RecepAgendaDelDia
                      appointments={dashboard.appointments}
                      onViewFullMonth={handleViewFullMonth}
                    />
                  </ViewPopup>
                </>
              )}
            </ViewPopup>
          )}

          {isDuenos && <DuenosPage onNotice={showToast} />}

          {isConversaciones && <EscalacionesPage onNotice={showToast} />}

          {isAgenda && <AgendaPage onNotice={showToast} />}

          {isMascotas && <MascotasPage onNotice={showToast} />}

          {isEspeciesRazas && (
            <EspeciesRazasPage
              onNotice={showToast}
              canCreateModule={canCreateModule}
              canEditModule={canEditModule}
              canDeleteModule={canDeleteModule}
            />
          )}

          {isServicios && (
            <ServiciosPage
              onNotice={showToast}
              canCreateModule={canCreateModule}
              canEditModule={canEditModule}
              canDeleteModule={canDeleteModule}
            />
          )}

          {isProfesionales && (
            <ProfesionalesPage
              onNotice={showToast}
              canCreateModule={canCreateModule}
              canEditModule={canEditModule}
              canDeleteModule={canDeleteModule}
            />
          )}

          {isReportes && <ReportesPage onNotice={showToast} />}

          {isPerfil && <PerfilPage onNotice={showToast} />}

          {activeRoute !== 'inicio' &&
            activeRoute !== 'perfil' &&
            activeRoute !== 'mascotas' &&
            activeRoute !== 'agenda' &&
            activeRoute !== 'duenos' &&
            activeRoute !== 'conversaciones' &&
            activeRoute !== 'especiesRazas' &&
            activeRoute !== 'servicios' &&
            activeRoute !== 'profesionales' &&
            activeRoute !== 'reportes' && (
              <ViewPopup animationKey={activeRoute}>
                <p className="text-sm text-sage font-medium">
                  Módulo “{activeRoute}” pendiente de implementación.
                </p>
              </ViewPopup>
            )}
        </main>
      </div>

      {activeNotification && <PageToast message={activeNotification} />}

      <RecepAgendamientoRapidoModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        onSuccess={(msg) => {
          showToast(msg)
          void reloadHome()
        }}
      />
    </div>
  )
}
