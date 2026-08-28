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
import { PuntoInicio as AuxPuntoInicio } from '@/modules/auxiliar'

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
      <AuxPuntoInicio
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
    <AuxPuntoInicio
      userName={currentUser.name}
      userRole={currentUser.roleName}
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

