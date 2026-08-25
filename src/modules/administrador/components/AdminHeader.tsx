import { BrandLogo } from '@/global/components'
import { BellPlusIcon, UserAvatarIcon } from './DashboardIcons'

interface AdminHeaderProps {
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  unreadNotificationsCount?: number
  userName?: string
  userRole?: string
}

export function AdminHeader({
  isSidebarOpen = false,
  onToggleSidebar,
  unreadNotificationsCount = 2,
  userName = 'Admin Veterinario',
  userRole = 'Administrador',
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-[#FAF5EC] border-b border-[#E8DCCF] transition-all duration-200">
      {/* Left side: Animated Hamburger / Close X Toggle & Logo */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-1.5 text-[#234E46] hover:text-[#1B3E37] hover:bg-[#E8DCCF]/50 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#234E46]/20 flex items-center justify-center w-10 h-10"
          aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
          aria-expanded={isSidebarOpen}
        >
          {/* Symmetrical Animated Hamburger to X transformation */}
          <div className="w-6 h-6 relative flex items-center justify-center pointer-events-none">
            <span
              className={`absolute h-[2px] w-5 bg-[#234E46] rounded-full transition-all duration-300 ease-in-out ${
                isSidebarOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 bg-[#234E46] rounded-full transition-all duration-200 ease-in-out ${
                isSidebarOpen ? 'opacity-0 scale-x-0' : 'opacity-100 translate-y-0'
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 bg-[#234E46] rounded-full transition-all duration-300 ease-in-out ${
                isSidebarOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
              }`}
            />
          </div>
        </button>

        <div className="flex items-center">
          <BrandLogo
            mark="wordmark"
            variant="transparent"
            alt="Huellitas Veterinaria"
            className="h-8 sm:h-9 w-auto object-contain cursor-pointer transition hover:opacity-95"
          />
        </div>
      </div>

      {/* Right side: Notifications & Profile Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Notifications Button */}
        <button
          type="button"
          className="relative p-2 text-[#234E46] hover:text-[#1B3E37] hover:bg-[#E8DCCF]/50 rounded-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#234E46]/20 group"
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <BellPlusIcon className="w-6 h-6 transition-transform group-hover:scale-105" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C86D51] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C86D51]"></span>
            </span>
          )}
        </button>

        {/* User Profile */}
        <button
          type="button"
          className="flex items-center gap-2 p-1.5 text-[#234E46] hover:text-[#1B3E37] hover:bg-[#E8DCCF]/50 rounded-full sm:rounded-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#234E46]/20 group"
          aria-label={`Perfil de ${userName}`}
          title={`${userName} (${userRole})`}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E8DCCF]/60 text-[#234E46] flex items-center justify-center border border-[#234E46]/15 group-hover:border-[#234E46]/40 transition">
            <UserAvatarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-[#2C3A38] leading-tight">
              {userName}
            </span>
            <span className="text-[10px] text-[#658E83] font-medium leading-tight">
              {userRole}
            </span>
          </div>
        </button>
      </div>
    </header>
  )
}
