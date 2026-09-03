import {
  Sidebar,
  type SidebarNavItem,
  HomeIcon,
  UsersIcon,
  PawIcon,
  StethoscopeIcon,
  DoctorIcon,
  CalendarIcon,
  BarChartIcon,
} from '@/global/components'

import type { ModuleId } from '../types'

export interface SuperAdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (route: string) => void
  canViewModule?: (moduleId: ModuleId) => boolean
  onLogout?: () => void
}

export const superAdminNavItems: (SidebarNavItem & { moduleId: ModuleId })[] = [
  {
    id: 'inicio',
    moduleId: 'inicio',
    label: 'Inicio',
    icon: <HomeIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'usuarios',
    moduleId: 'usuarios',
    label: 'Usuarios',
    icon: <UsersIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'mascotas',
    moduleId: 'mascotas',
    label: 'Mascotas',
    icon: <PawIcon className="w-4.5 h-4.5 shrink-0" />,
  },

  {
    id: 'servicios',
    moduleId: 'servicios',
    label: 'Servicios',
    icon: <StethoscopeIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'profesionales',
    moduleId: 'profesionales',
    label: 'Profesionales',
    icon: <DoctorIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'agenda',
    moduleId: 'agenda',
    label: 'Agenda',
    icon: <CalendarIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'reportes',
    moduleId: 'reportes',
    label: 'Reportes',
    icon: <BarChartIcon className="w-5 h-5 shrink-0" />,
  },
]

export function SuperAdminSidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
  canViewModule,
  onLogout,
}: SuperAdminSidebarProps) {
  const visibleNavItems = canViewModule
    ? superAdminNavItems.filter((item) => canViewModule(item.moduleId))
    : superAdminNavItems

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      activeRoute={activeRoute}
      onNavigate={onNavigate}
      navItems={visibleNavItems}
      sectionTitle="Navegación SuperAdmin"
      panelTitle="Panel de Control"
      onLogout={onLogout}
    />
  )
}



