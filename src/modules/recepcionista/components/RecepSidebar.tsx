import {
  Sidebar,
  type SidebarNavItem,
} from '@/global/components'
import {
  RECEP_DEFAULT_PERMISSIONS,
  RECEP_NAV_CATALOG,
  resolveNavCatalog,
  splitNavCatalog,
  splitNavByPlacement,
  toSidebarNavItems,
  type GrantedPermissions,
} from '@/global/navigation'

export interface RecepSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (routeId: string) => void
  grantedPermissions?: GrantedPermissions
  onLogout?: () => void
}

export function resolveRecepSidebarNav(grantedPermissions?: GrantedPermissions): {
  navItems: SidebarNavItem[]
  footerNavItems: SidebarNavItem[]
} {
  const visible = resolveNavCatalog(
    RECEP_NAV_CATALOG,
    RECEP_DEFAULT_PERMISSIONS,
    grantedPermissions,
  )
  const { links } = splitNavCatalog(visible)
  const { main, footer } = splitNavByPlacement(links)

  return {
    navItems: toSidebarNavItems(main),
    footerNavItems: toSidebarNavItems(footer),
  }
}

// Sidebar recepcionista: mismos efectos/plantilla; solo cambian las opciones
export function RecepSidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
  grantedPermissions,
  onLogout,
}: RecepSidebarProps) {
  const { navItems, footerNavItems } = resolveRecepSidebarNav(grantedPermissions)

  return (
    <Sidebar
      variant="illustrated"
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
      sectionTitle="Navegación Recepción"
      panelTitle="Panel Recepción"
      onLogout={onLogout}
    />
  )
}
