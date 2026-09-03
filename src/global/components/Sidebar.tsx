import type { ReactNode } from 'react'
import defaultIllustration from '@/assets/branding/sidebar-illustration.jpg'
import { UserAvatarIcon, LogOutIcon } from './Icons'

export interface SidebarNavItem {
  id: string
  label: string
  icon: ReactNode
  badge?: string | number
  // Clave de permiso (opcional; útil para depurar / auditoría UI)
  permissionKey?: string
}

// CTA superior (ej. Nueva Atención); también filtrable por permiso
export interface SidebarPrimaryAction {
  id: string
  label: string
  icon?: ReactNode
  permissionKey?: string
}

export type SidebarVariant = 'illustrated' | 'plain'
export type SidebarActiveTone = 'brand' | 'soft'

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
  // illustrated = superadmin (imagen + menú); plain = menú siempre visible (vet)
  variant?: SidebarVariant
  // brand = activo sólido; soft = activo con tinte brand (vet, recepción, etc.)
  activeTone?: SidebarActiveTone
  // Botón de acción primaria arriba del menú
  primaryAction?: SidebarPrimaryAction | null
  onPrimaryAction?: (actionId: string) => void
  showPanelHeader?: boolean
  // Ítems anclados al pie (perfil, configuración)
  footerNavItems?: SidebarNavItem[]
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
  variant = 'illustrated',
  activeTone = 'brand',
  primaryAction = null,
  onPrimaryAction,
  showPanelHeader = true,
  footerNavItems = [],
}: SidebarProps) {
  const isPlain = variant === 'plain'

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

  const handlePrimaryClick = () => {
    if (!primaryAction) return
    if (onPrimaryAction) {
      onPrimaryAction(primaryAction.id)
    } else {
      onNavigate?.(primaryAction.id)
    }
  }

  const activeClasses =
    activeTone === 'soft'
      ? 'bg-brand/12 text-brand ring-1 ring-brand/20'
      : 'bg-brand text-white shadow-xs'

  const inactiveClasses = 'text-charcoal hover:bg-border-tan/60 hover:text-brand'

  const activeIconClass = activeTone === 'soft' ? 'text-brand' : 'text-white'
  const inactiveIconClass = 'text-sage'

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-charcoal/30 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

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
        {/* Capa ilustración solo en variante illustrated */}
        {!isPlain && (
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
        )}

        {/* Menú: siempre visible en plain; animado en illustrated */}
        <div
          className={`
            absolute inset-0 w-full h-full bg-cream p-4 sm:p-5 flex flex-col justify-between overflow-y-auto
            transition-all duration-500 ease-in-out transform
            ${
              isPlain
                ? 'translate-y-0 opacity-100 pointer-events-auto'
                : isOpen
                  ? 'translate-y-0 opacity-100 pointer-events-auto'
                  : '-translate-y-full opacity-0 pointer-events-none'
            }
          `}
        >
          <div className="space-y-3.5">
            {showPanelHeader && (
              <div className="pb-3 border-b border-border-tan">
                <span className="text-[11px] font-bold text-sage uppercase tracking-wider block">
                  {sectionTitle}
                </span>
                <span className="text-sm font-bold text-charcoal">{panelTitle}</span>
              </div>
            )}

            {primaryAction && (
              <button
                type="button"
                onClick={handlePrimaryClick}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-terracotta text-white text-sm font-bold hover:bg-terracotta/90 transition-colors cursor-pointer shadow-sm"
              >
                {primaryAction.icon ?? <span className="text-base leading-none">+</span>}
                <span>{primaryAction.label}</span>
              </button>
            )}

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
                      ${isActive ? activeClasses : inactiveClasses}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? activeIconClass : inactiveIconClass}>
                        {item.icon}
                      </span>
                      <span className="leading-tight truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive && activeTone === 'brand'
                            ? 'bg-white/20 text-white'
                            : isActive
                              ? 'bg-brand/15 text-brand'
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

          {(footerSlot ||
            showProfileButton ||
            showLogoutButton ||
            footerNavItems.length > 0) && (
            <div className="pt-3 border-t border-border-tan flex flex-col gap-1.5">
              {footerNavItems.map((item) => {
                const isActive = activeRoute === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-left
                      ${isActive ? activeClasses : inactiveClasses}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? activeIconClass : inactiveIconClass}>
                        {item.icon}
                      </span>
                      <span className="leading-tight truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive && activeTone === 'brand'
                            ? 'bg-white/20 text-white'
                            : isActive
                              ? 'bg-brand/15 text-brand'
                              : 'bg-border-tan text-sage'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}

              {footerSlot}

              {showProfileButton && (
                <button
                  type="button"
                  onClick={() => handleItemClick(profileRouteId)}
                  className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-left
                  ${
                    activeRoute === profileRouteId
                      ? activeClasses
                      : inactiveClasses
                  }
                `}
                >
                  <span
                    className={
                      activeRoute === profileRouteId ? activeIconClass : inactiveIconClass
                    }
                  >
                    <UserAvatarIcon className="w-5 h-5 shrink-0" />
                  </span>
                  <span className="leading-tight">{profileLabel}</span>
                </button>
              )}

              {showLogoutButton && (
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-left
                    ${
                      activeTone === 'soft'
                        ? inactiveClasses
                        : 'text-terracotta hover:bg-terracotta-soft'
                    }
                  `}
                >
                  <LogOutIcon className="w-5 h-5 shrink-0" />
                  <span>{logoutLabel}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
