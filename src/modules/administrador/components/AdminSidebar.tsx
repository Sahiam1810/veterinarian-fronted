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

export interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (route: string) => void
}

export const adminNavItems: SidebarNavItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: <HomeIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: <UsersIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    icon: <PawIcon className="w-4.5 h-4.5 shrink-0" />,
  },
  {
    id: 'servicios',
    label: 'Servicios',
    icon: <StethoscopeIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'veterinarios',
    label: 'Veterinarios',
    icon: <DoctorIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: <CalendarIcon className="w-5 h-5 shrink-0" />,
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: <BarChartIcon className="w-5 h-5 shrink-0" />,
  },
]

export function AdminSidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
}: AdminSidebarProps) {
  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      activeRoute={activeRoute}
      onNavigate={onNavigate}
      navItems={adminNavItems}
      sectionTitle="Navegación Admin"
      panelTitle="Panel de Control"
    />
  )
}

