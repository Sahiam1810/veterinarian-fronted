import { SuperAdminHeader, DashboardBackgroundDecoration } from '@/modules/superadmin'
import { PageToast } from '@/global/components'
import {
  VetHomeGreeting,
  VetHomeStatCards,
  VetAgendaDelDia,
  VetSidebar,
  ViewPopup,
  CitaAccionesModal,
  RegistrarAtencionModal,
  HistoriaClinicaModal,
} from '../../components'
import { AgendaPage } from '../agenda'
import { MascotasPage } from '../mascotas'
import { DuenosPage } from '../duenos'
import { PerfilPage } from '../perfil'
import { ReportesPage } from '../reportes'
import { EspeciesRazasPage } from '../especiesRazas'
import { ServiciosPage } from '../servicios'
import { ProfesionalesPage } from '../profesionales'
import { HospitalizacionPage } from '@/modules/hospitalizacion'
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
    canViewModule,
    canCreateModule,
    canEditModule,
    canDeleteModule,
    notifications,
    onMarkNotificationRead,
    unreadNotificationsCount,
    isLoading,
    error,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    activeRoute,
    handleNavigate,
    activeNotification,
    showToast,
    selectedAppointment,
    isActionModalOpen,
    isRegistrarOpen,
    historiaModalTarget,
    isHistoriaModalOpen,
    isUpdatingStatus,
    handleViewFullAgenda,
    handleCloseActionModal,
    handleCloseRegistrar,
    handleCloseHistoria,
    handleUpdateStatus,
    handleAttendAndRegister,
    handleViewHistoria,
    handleRegistrationSuccess,
  } = useVetHome()

  const isAgenda = activeRoute === 'agenda'
  const isMascotas = activeRoute === 'mascotas'
  const isDuenos = activeRoute === 'duenos'
  const isReportes = activeRoute === 'reportes'
  const isEspeciesRazas = activeRoute === 'especiesRazas'
  const isServicios = activeRoute === 'servicios'
  const isProfesionales = activeRoute === 'profesionales'
  const isHospitalizacion = activeRoute === 'hospitalizacion'
  const isPerfil = activeRoute === 'perfil'
  const fillHeight =
    isAgenda || isMascotas || isDuenos || isEspeciesRazas || isServicios || isProfesionales || isHospitalizacion
  // Perfil ya no fuerza alto completo: se alinea al contenido

  return (
    <div className="h-screen max-h-screen overflow-hidden overflow-x-hidden flex flex-col bg-bone">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        notifications={notifications}
        unreadNotificationsCount={unreadNotificationsCount}
        onMarkNotificationRead={onMarkNotificationRead}
        userName={userName || dashboard?.profile.displayName || 'Veterinario'}
        userRole={userRole || 'Veterinario'}
        onProfileClick={() => handleNavigate('perfil')}
      />

      <div className="flex flex-1 h-[calc(100vh-57px)] overflow-hidden overflow-x-hidden relative min-w-0">
        <VetSidebar
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
              ? 'overflow-y-hidden p-2.5 sm:p-4 lg:p-6 xl:p-7 gap-2.5 sm:gap-4'
              : 'overflow-y-auto p-4 sm:p-5 lg:p-6 xl:p-7 gap-4 sm:gap-5'
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
                      canViewFullAgenda={canViewModule('agenda')}
                    />
                  </ViewPopup>
                </>
              )}
            </ViewPopup>
          )}

          {isAgenda && <AgendaPage onNotice={showToast} />}

          {isMascotas && <MascotasPage onNotice={showToast} />}

          {isDuenos && <DuenosPage onNotice={showToast} />}

          {isReportes && <ReportesPage onNotice={showToast} />}

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

          {isHospitalizacion && (
            <HospitalizacionPage
              canView={canViewModule('hospitalizacion')}
              canCreate={canCreateModule('hospitalizacion')}
              canEdit={canEditModule('hospitalizacion')}
              canViewSupplies={canViewModule('insumos')}
              canCreateSupplies={canCreateModule('insumos')}
              canViewOrders={canViewModule('ordenesMedicas')}
              canCreateOrders={canCreateModule('ordenesMedicas')}
              canEditOrders={canEditModule('ordenesMedicas')}
            />
          )}

          {isPerfil && <PerfilPage onNotice={showToast} />}

          {activeRoute !== 'inicio' &&
            activeRoute !== 'agenda' &&
            activeRoute !== 'mascotas' &&
            activeRoute !== 'duenos' &&
            activeRoute !== 'reportes' &&
            activeRoute !== 'especiesRazas' &&
            activeRoute !== 'servicios' &&
            activeRoute !== 'profesionales' &&
            activeRoute !== 'hospitalizacion' &&
            activeRoute !== 'perfil' && (
              <ViewPopup animationKey={activeRoute}>
                <p className="text-sm text-sage font-medium">
                  Módulo “{activeRoute}” pendiente de implementación.
                </p>
              </ViewPopup>
            )}
        </main>
      </div>

      {isActionModalOpen && selectedAppointment && (
        <CitaAccionesModal
          isOpen={isActionModalOpen}
          appointment={selectedAppointment}
          onClose={handleCloseActionModal}
          onAttendAndRegister={handleAttendAndRegister}
          onChangeStatus={handleUpdateStatus}
          onViewHistoriaClinica={(petId) => {
            void handleViewHistoria(petId)
          }}
          isUpdatingStatus={isUpdatingStatus}
          canRegisterClinical={canCreateModule('historiaClinica')}
          canViewClinicalHistory={canViewModule('historiaClinica')}
          canEditAppointmentStatus={canEditModule('agenda')}
          canCancelAppointment={canDeleteModule('agenda')}
        />
      )}

      {isRegistrarOpen && selectedAppointment && (
        <RegistrarAtencionModal
          isOpen={isRegistrarOpen}
          petId={selectedAppointment.petId || ''}
          petName={selectedAppointment.petName || 'Mascota'}
          speciesBreed={selectedAppointment.speciesBreed || selectedAppointment.species}
          clientPetId={selectedAppointment.clientPetId || ''}
          appointmentId={selectedAppointment.id}
          serviceName={selectedAppointment.service}
          statusName={selectedAppointment.rawStatusName || selectedAppointment.status}
          scheduledStart={selectedAppointment.startTime}
          initialWeight={selectedAppointment.weightKg}
          initialTemperature={selectedAppointment.temperature}
          canCreateOrders={canCreateModule('ordenesMedicas')}
          canEditOrders={canEditModule('ordenesMedicas')}
          onClose={handleCloseRegistrar}
          onSuccess={(result) => {
            void handleRegistrationSuccess(result)
          }}
        />
      )}

      {isHistoriaModalOpen && historiaModalTarget && (
        <HistoriaClinicaModal
          historia={historiaModalTarget}
          onClose={handleCloseHistoria}
        />
      )}

      {activeNotification && <PageToast message={activeNotification} />}
    </div>
  )
}

