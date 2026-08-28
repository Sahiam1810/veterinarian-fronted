import {
  Sidebar,
  type SidebarNavItem,
} from '@/global/components'
import {
  CLIENTE_DEFAULT_PERMISSIONS,
  CLIENTE_NAV_CATALOG,
  resolveNavCatalog,
  splitNavCatalog,
  splitNavByPlacement,
  toSidebarNavItems,
  type GrantedPermissions,
} from '@/global/navigation'

export interface ClienteSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (routeId: string) => void
  grantedPermissions?: GrantedPermissions
  onLogout?: () => void
}

export function resolveClienteSidebarNav(grantedPermissions?: GrantedPermissions): {
  navItems: SidebarNavItem[]
  footerNavItems: SidebarNavItem[]
} {
  const visible = resolveNavCatalog(
    CLIENTE_NAV_CATALOG,
    CLIENTE_DEFAULT_PERMISSIONS,
    grantedPermissions,
  )
  const { links } = splitNavCatalog(visible)
  const { main, footer } = splitNavByPlacement(links)

  return {
    navItems: toSidebarNavItems(main),
    footerNavItems: toSidebarNavItems(footer),
  }
}

// Sidebar del portal cliente (dueño de mascota)
export function ClienteSidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
  grantedPermissions,
  onLogout,
}: ClienteSidebarProps) {
  const { navItems, footerNavItems } = resolveClienteSidebarNav(grantedPermissions)

  return (
    <Sidebar
      variant="plain"
      activeTone="soft"
      isOpen={isOpen}
      onClose={onClose}
      activeRoute={activeRoute}
      onNavigate={onNavigate}
      navItems={navItems}
      footerNavItems={footerNavItems}
      showPanelHeader={false}
      showProfileButton={false}
      showLogoutButton={true}
      logoutLabel="Cerrar Sesión"
      sectionTitle="Mi Portal"
      panelTitle="Portal Cliente"
      onLogout={onLogout}
    />
  )
}
