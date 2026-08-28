import { useState } from 'react'
import { LoginPage, useAuth, type AuthUser } from '@/modules/auth'
import {
  AdminHeader,
  DashboardAdmin,
  UserAdmin,
  MascotasAdmin,
  ProfesionalesAdmin,
  ServiciosAdmin,
  AgendaAdmin,
  ReportesAdmin,
  PerfilAdmin,
} from '@/modules/administrador'
import { PuntoInicio as VetPuntoInicio } from '@/modules/veterinario'
import { PuntoInicio as RecepPuntoInicio } from '@/modules/recepcionista'
import { InicioAux, AgendaAux, MascotasAux, PreparacionAux, AuxSidebar, ViewPopup } from '@/modules/auxiliar'
import { PuntoInicio as ClientePuntoInicio } from '@/modules/cliente'

export default function App() {
  const {
    currentUser,
    login,
    logout,
    isSubmitting,
    error,
  } = useAuth()

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={login}
        isSubmitting={isSubmitting}
        error={error}
      />
    )
  }

  const role = (currentUser.role || '').toLowerCase()
  const roleName = (currentUser.roleName || '').toLowerCase()

  if (role === 'veterinario' || roleName.includes('veterinario')) {
    return (
      <VetPuntoInicio
        userName={currentUser.name}
        userRole={currentUser.roleName}
        onLogout={logout}
      />
    )
  }

  if (role === 'recepcionista' || roleName.includes('recepcion')) {
    return (
      <RecepPuntoInicio
        userName={currentUser.name}
        userRole={currentUser.roleName}
        onLogout={logout}
      />
    )
  }

  if (role === 'auxiliar' || roleName.includes('auxiliar')) {
    return (
      <AuxApp
        user={currentUser}
        onLogout={logout}
      />
    )
  }

  if (role === 'cliente' || roleName.includes('cliente')) {
    return (
      <ClientePuntoInicio
        userName={currentUser.name}
        userRole={currentUser.roleName}
        onLogout={logout}
      />
    )
  }

  if (role === 'admin' || roleName.includes('admin')) {
    return <AdminApp user={currentUser} onLogout={logout} />
  }

  return (
    <AuxApp
      user={currentUser}
      onLogout={logout}
    />
  )
}

// Shell administrador (DashboardAdmin, UserAdmin, MascotasAdmin) conectado al usuario autenticado
function AdminApp({
  user,
  onLogout,
}: {
  user: AuthUser
  onLogout: () => void
}) {
  const [currentRoute, setCurrentRoute] = useState<string>('inicio')
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  const handleNavigate = (routeId: string) => {
    if (routeId === 'logout') {
      onLogout()
      return
    }
    setCurrentRoute(routeId)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  if (currentRoute === 'usuarios') {
    return (
      <UserAdmin
        onNavigate={handleNavigate}
        activeRoute="usuarios"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={closeSidebar}
        userName={user.name}
        userRole={user.roleName}
        onLogout={onLogout}
      />
    )
  }

  if (currentRoute === 'mascotas' || currentRoute === 'duenos') {
    return (
      <MascotasAdmin
        onNavigate={handleNavigate}
        activeRoute="mascotas"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={closeSidebar}
        userName={user.name}
        userRole={user.roleName}
        onLogout={onLogout}
      />
    )
  }

  if (currentRoute === 'profesionales') {
    return (
      <ProfesionalesAdmin
        onNavigate={handleNavigate}
        activeRoute="profesionales"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={closeSidebar}
        userName={user.name}
        userRole={user.roleName}
        onLogout={onLogout}
      />
    )
  }

  if (currentRoute === 'servicios') {
    return (
      <ServiciosAdmin
        onNavigate={handleNavigate}
        activeRoute="servicios"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={closeSidebar}
        userName={user.name}
        userRole={user.roleName}
        onLogout={onLogout}
      />
    )
  }

  if (currentRoute === 'agenda') {
    return (
      <AgendaAdmin
        onNavigate={handleNavigate}
        activeRoute="agenda"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={closeSidebar}
        userName={user.name}
        userRole={user.roleName}
        onLogout={onLogout}
      />
    )
  }

  if (currentRoute === 'reportes') {
    return (
      <ReportesAdmin
        onNavigate={handleNavigate}
        activeRoute="reportes"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={closeSidebar}
        userName={user.name}
        userRole={user.roleName}
        onLogout={onLogout}
      />
    )
  }

  if (currentRoute === 'perfil') {
    return (
      <PerfilAdmin
        onNavigate={handleNavigate}
        activeRoute="perfil"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={closeSidebar}
        userName={user.name}
        userRole={user.roleName}
        onLogout={onLogout}
      />
    )
  }
  return (
    <DashboardAdmin
      onNavigate={handleNavigate}
      activeRoute={currentRoute}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={toggleSidebar}
      onCloseSidebar={closeSidebar}
      userName={user.name}
      userRole={user.roleName}
      onLogout={onLogout}
    />
  )
}

// Shell auxiliar conectado directamente a la vista InicioAux y a su sidebar
function AuxApp({
  user,
  onLogout,
}: {
  user: AuthUser
  onLogout: () => void
}) {
  const [currentRoute, setCurrentRoute] = useState<string>('inicio')
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const handleNavigate = (routeId: string) => {
    if (routeId === 'logout') {
      onLogout()
      return
    }
    setCurrentRoute(routeId)
    setIsSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const showToast = (message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((curr) => (curr === message ? null : curr))
    }, 3500)
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden overflow-x-hidden flex flex-col bg-bone">
      {/* Header Superior */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        unreadNotificationsCount={3}
        userName={user.name}
        userRole={user.roleName || 'Auxiliar'}
      />

      {/* Cuerpo principal: Sidebar + Vista activa */}
      <div className="flex flex-1 h-[calc(100vh-57px)] overflow-hidden overflow-x-hidden relative min-w-0">
        <AuxSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={currentRoute}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />

        <main className="flex-1 h-full min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-5 lg:p-6 xl:p-7 flex flex-col gap-4 sm:gap-5 max-w-[1400px] w-full mx-auto">
          {currentRoute === 'inicio' && (
            <ViewPopup animationKey="inicio" className="w-full">
              <InicioAux
                userName={user.name?.split(' ')[0] || 'Laura'}
                onNotice={showToast}
              />
            </ViewPopup>
          )}

          {currentRoute === 'agenda' && (
            <ViewPopup animationKey="agenda" className="w-full">
              <AgendaAux
                userName={user.name?.split(' ')[0] || 'Laura'}
                onNotice={showToast}
              />
            </ViewPopup>
          )}

          {currentRoute === 'mascotas' && (
            <ViewPopup animationKey="mascotas" className="w-full">
              <MascotasAux
                onNotice={showToast}
              />
            </ViewPopup>
          )}

          {currentRoute === 'preparacion' && (
            <ViewPopup animationKey="preparacion" className="w-full">
              <PreparacionAux
                onNotice={showToast}
              />
            </ViewPopup>
          )}

          {currentRoute !== 'inicio' && currentRoute !== 'agenda' && currentRoute !== 'mascotas' && currentRoute !== 'preparacion' && (
            <ViewPopup animationKey={currentRoute} className="w-full">
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 bg-white rounded-3xl border border-border-tan shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-terracotta-soft text-terracotta flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-brand capitalize">
                  Módulo de {currentRoute}
                </h2>
                <p className="text-sm text-sage mt-1 max-w-sm">
                  Esta sección está en desarrollo. Puedes regresar al inicio para gestionar las citas y preparación de pacientes.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentRoute('inicio')}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer"
                >
                  Volver al Inicio
                </button>
              </div>
            </ViewPopup>
          )}
        </main>
      </div>

      {activeNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]">
          <div className="view-popup bg-brand text-white px-5 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-medium border border-white/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ochre animate-pulse shrink-0" />
            <span className="truncate">{activeNotification}</span>
          </div>
        </div>
      )}
    </div>
  )
}

