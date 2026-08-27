import {
  Sidebar,
  type SidebarNavItem,
  HomeIcon,
  UsersIcon,
  OwnersIcon,
  PawIcon,
  StethoscopeIcon,
  DoctorIcon,
  CalendarIcon,
  MedicalHistoryIcon,
  BarChartIcon,
} from '@/global/components'
import type { ModuleId } from '../types'

export interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (route: string) => void
  canViewModule?: (moduleId: ModuleId) => boolean
  onLogout?: () => void
}

export const adminNavItems: (SidebarNavItem & { moduleId: ModuleId })[] = [
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
    id: 'duenos',
    moduleId: 'duenos',
    label: 'Dueños',
    icon: <OwnersIcon className="w-5 h-5 shrink-0" />,
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
    id: 'historiaClinica',
    moduleId: 'historiaClinica',
    label: 'Historia Clínica',
    icon: <MedicalHistoryIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'reportes',
    moduleId: 'reportes',
    label: 'Reportes',
    icon: <BarChartIcon className="w-5 h-5 shrink-0" />,
  },
]

export function AdminSidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
  canViewModule,
  onLogout,
}: AdminSidebarProps) {
  const visibleNavItems = canViewModule
    ? adminNavItems.filter((item) => canViewModule(item.moduleId))
    : adminNavItems

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      activeRoute={activeRoute}
      onNavigate={onNavigate}
      navItems={visibleNavItems}
      sectionTitle="Navegación Admin"
      panelTitle="Panel de Control"
      onLogout={onLogout}
    />
  )
}



