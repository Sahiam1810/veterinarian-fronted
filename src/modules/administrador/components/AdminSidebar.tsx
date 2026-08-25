import sidebarIllustration from '../assets/sidebar-illustration.jpg'
import {
  HomeIcon,
  UsersIcon,
  PawIcon,
  StethoscopeIcon,
  DoctorIcon,
  CalendarIcon,
  BarChartIcon,
  UserAvatarIcon,
  LogOutIcon,
} from './DashboardIcons'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (route: string) => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

export function AdminSidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
}: AdminSidebarProps) {
  const navItems: NavItem[] = [
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

  const handleItemClick = (id: string) => {
    onNavigate?.(id)
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#2C3A38]/30 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Column Container */}
      <aside
        className={`
          fixed lg:relative top-[57px] lg:top-0 bottom-0 left-0 z-40 lg:z-10
          w-60 sm:w-64 lg:w-60 xl:w-64 shrink-0 h-[calc(100vh-57px)] lg:h-full
          bg-[#FAF5EC] border-r border-[#E8DCCF]
          overflow-hidden select-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Layer 1: Vertical Illustration (corre hacia abajo al abrir el menú) */}
        <div
          className={`
            absolute inset-0 w-full h-full flex flex-col justify-start items-center pointer-events-none overflow-hidden
            transition-all duration-500 ease-in-out transform
            ${isOpen ? 'translate-y-full opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'}
          `}
        >
          <img
            src={sidebarIllustration}
            alt="Ilustración botánica veterinaria Huellitas"
            className="w-full h-full object-cover object-top opacity-95"
            loading="eager"
          />
        </div>

        {/* Layer 2: Menú de navegación desplegable (color Warm Cream #F6EDE0, se despliega desde arriba) */}
        <div
          className={`
            absolute inset-0 w-full h-full bg-[#F6EDE0] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto
            transition-all duration-500 ease-in-out transform
            ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}
          `}
        >
          {/* Top navigation section */}
          <div className="space-y-3.5">
            {/* Header del menú */}
            <div className="pb-3 border-b border-[#E8DCCF]">
              <span className="text-[11px] font-bold text-[#658E83] uppercase tracking-wider block">
                Navegación Admin
              </span>
              <span className="text-sm font-bold text-[#2C3A38]">
                Panel de Control
              </span>
            </div>

            {/* Links list */}
            <nav className="flex flex-col gap-1.5" aria-label="Menú del Administrador">
              {navItems.map((item) => {
                const isActive = activeRoute === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-left
                      ${
                        isActive
                          ? 'bg-[#234E46] text-white shadow-xs'
                          : 'text-[#2C3A38] hover:bg-[#E8DCCF]/60 hover:text-[#234E46]'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-white' : 'text-[#658E83]'}>
                      {item.icon}
                    </span>
                    <span className="leading-tight">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Bottom section: Perfil & Cerrar Sesión buttons */}
          <div className="pt-3 border-t border-[#E8DCCF] flex flex-col gap-1.5">
            {/* Botón Perfil */}
            <button
              type="button"
              onClick={() => handleItemClick('perfil')}
              className={`
                w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-left
                ${
                  activeRoute === 'perfil'
                    ? 'bg-[#234E46] text-white shadow-xs'
                    : 'text-[#2C3A38] hover:bg-[#E8DCCF]/60 hover:text-[#234E46]'
                }
              `}
            >
              <span className={activeRoute === 'perfil' ? 'text-white' : 'text-[#658E83]'}>
                <UserAvatarIcon className="w-5 h-5 shrink-0" />
              </span>
              <span className="leading-tight">Perfil</span>
            </button>

            {/* Botón Cerrar Sesión */}
            <button
              type="button"
              onClick={() => onNavigate?.('logout')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#C86D51] hover:bg-[#FBECE8] transition-colors cursor-pointer text-left"
            >
              <LogOutIcon className="w-5 h-5 shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
