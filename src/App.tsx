import { useState } from 'react'
import { LoginPage, useAuth, type AuthUser } from '@/modules/auth'
import {
  AdminHeader,
  DashboardAdmin,
  UserAdmin,
  MascotasAdmin,
  ProfesionalesAdmin,
} from '@/modules/administrador'
import { PuntoInicio } from '@/modules/veterinario'

export default function App() {
  const {
    currentUser,
    login,
    logout,
    isSubmitting,
    error,
  } = useAuth()

  // 1. Si no hay sesión iniciada, mostrar la pantalla de Login
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={login}
        isSubmitting={isSubmitting}
        error={error}
      />
    )
  }

  // 2. Si el usuario autenticado es Veterinario, renderizar PuntoInicio (Veterinario)
  if (currentUser.role === 'veterinario') {
    return (
      <PuntoInicio
        userName={currentUser.name}
        userRole={currentUser.roleName}
        onLogout={logout}
      />
    )
  }

  // 3. Si el usuario autenticado es Administrador, renderizar AdminApp
  if (currentUser.role === 'admin') {
    return <AdminApp user={currentUser} onLogout={logout} />
  }

  // 4. Fallback amigable para otros roles (Recepcionista, Auxiliar)
  return <FallbackRoleApp user={currentUser} onLogout={logout} />
}


// Shell administrador (DashboardAdmin y UserAdmin) conectado al usuario autenticado
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

// Vista provisional para roles adicionales (ej. Recepcionista o Auxiliar)
function FallbackRoleApp({
  user,
  onLogout,
}: {
  user: AuthUser
  onLogout: () => void
}) {
  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone">
      <AdminHeader
        userName={user.name}
        userRole={user.roleName}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 border border-border-tan shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-terracotta-soft text-terracotta flex items-center justify-center mx-auto text-3xl">
            🐾
          </div>
          <h2 className="text-xl font-bold text-brand">
            Módulo de {user.roleName}
          </h2>
          <p className="text-sm text-sage">
            Bienvenido, <strong>{user.name}</strong>. Las vistas específicas para el rol de {user.roleName} están en construcción.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover transition cursor-pointer"
            >
              Cerrar sesión y cambiar de usuario
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
