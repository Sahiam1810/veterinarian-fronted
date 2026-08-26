import type { ReactNode } from 'react'
import defaultIllustration from '@/assets/branding/sidebar-illustration.jpg'
import { UserAvatarIcon, LogOutIcon } from './Icons'

export interface SidebarNavItem {
  id: string
  label: string
  icon: ReactNode
  badge?: string | number
}

export interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (routeId: string) => void
  navItems?: SidebarNavItem[]
  sectionTitle?: string
  panelTitle?: string
  illustrationSrc?: string
  illustrationAlt?: string
  showProfileButton?: boolean
  showLogoutButton?: boolean
  profileLabel?: string
  logoutLabel?: string
  profileRouteId?: string
  logoutRouteId?: string
  onLogout?: () => void
  footerSlot?: ReactNode
  className?: string
}

export function Sidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
  navItems = [],
  sectionTitle = 'Navegación',
  panelTitle = 'Panel de Control',
  illustrationSrc = defaultIllustration,
  illustrationAlt = 'Ilustración botánica veterinaria Huellitas',
  showProfileButton = true,
  showLogoutButton = true,
  profileLabel = 'Perfil',
  logoutLabel = 'Cerrar Sesión',
  profileRouteId = 'perfil',
  logoutRouteId = 'logout',
  onLogout,
  footerSlot,
  className = '',
}: SidebarProps) {
  const handleItemClick = (id: string) => {
    onNavigate?.(id)
  }

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    } else {
      onNavigate?.(logoutRouteId)
    }
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-charcoal/30 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Column Container */}
      <aside
        className={`
          fixed lg:relative top-[57px] lg:top-0 bottom-0 left-0 z-40 lg:z-10
          w-60 sm:w-64 lg:w-60 xl:w-64 shrink-0 h-[calc(100vh-57px)] lg:h-full
          bg-bone border-r border-border-tan
          overflow-hidden select-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
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
            src={illustrationSrc}
            alt={illustrationAlt}
            className="w-full h-full object-cover object-top opacity-95"
            loading="eager"
          />
        </div>

        {/* Layer 2: Menú de navegación desplegable (color Warm Cream, se despliega desde arriba) */}
        <div
          className={`
            absolute inset-0 w-full h-full bg-cream p-4 sm:p-5 flex flex-col justify-between overflow-y-auto
            transition-all duration-500 ease-in-out transform
            ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}
          `}
        >
          {/* Top navigation section */}
          <div className="space-y-3.5">
            {/* Header del menú */}
            <div className="pb-3 border-b border-border-tan">
              <span className="text-[11px] font-bold text-sage uppercase tracking-wider block">
                {sectionTitle}
              </span>
              <span className="text-sm font-bold text-charcoal">
                {panelTitle}
              </span>
            </div>

            {/* Links list */}
            <nav className="flex flex-col gap-1.5" aria-label={sectionTitle}>
              {navItems.map((item) => {
                const isActive = activeRoute === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-left
                      ${
                        isActive
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-charcoal hover:bg-border-tan/60 hover:text-brand'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? 'text-white' : 'text-sage'}>
                        {item.icon}
                      </span>
                      <span className="leading-tight truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-border-tan text-sage'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Bottom section: Perfil, Cerrar Sesión & Custom Footer Slot */}
          <div className="pt-3 border-t border-border-tan flex flex-col gap-1.5">
            {footerSlot}

            {/* Botón Perfil */}
            {showProfileButton && (
              <button
                type="button"
                onClick={() => handleItemClick(profileRouteId)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-left
                  ${
                    activeRoute === profileRouteId
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-charcoal hover:bg-border-tan/60 hover:text-brand'
                  }
                `}
              >
                <span className={activeRoute === profileRouteId ? 'text-white' : 'text-sage'}>
                  <UserAvatarIcon className="w-5 h-5 shrink-0" />
                </span>
                <span className="leading-tight">{profileLabel}</span>
              </button>
            )}

            {/* Botón Cerrar Sesión */}
            {showLogoutButton && (
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-terracotta hover:bg-terracotta-soft transition-colors cursor-pointer text-left"
              >
                <LogOutIcon className="w-5 h-5 shrink-0" />
                <span>{logoutLabel}</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
