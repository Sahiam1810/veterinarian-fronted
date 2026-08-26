import { useState } from 'react'
import { DashboardAdmin, UserAdmin } from '@/modules/administrador'
import { PuntoInicio } from '@/modules/veterinario'

// Shells separados: admin (develop) y veterinario (feature). Cambia solo esta constante.
type AppShell = 'admin' | 'veterinario'
const ACTIVE_SHELL: AppShell = 'veterinario'

export default function App() {
  if (ACTIVE_SHELL === 'veterinario') {
    return <PuntoInicio />
  }

  return <AdminApp />
}

// Shell administrador (UserAdmin / DashboardAdmin) sin mezclar con el módulo veterinario
function AdminApp() {
  const [currentRoute, setCurrentRoute] = useState<string>('inicio')
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  const handleNavigate = (routeId: string) => {
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
    />
  )
}
