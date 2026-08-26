import { useState } from 'react'
import { DashboardAdmin, UserAdmin } from '@/modules/administrador'

export default function App() {
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
