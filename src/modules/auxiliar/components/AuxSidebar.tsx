import {
  Sidebar,
  type SidebarNavItem,
  type SidebarPrimaryAction,
} from '@/global/components'
import {
  AUX_DEFAULT_PERMISSIONS,
  AUX_NAV_CATALOG,
  resolveNavCatalog,
  splitNavCatalog,
  splitNavByPlacement,
  toSidebarNavItems,
  toSidebarPrimaryAction,
  type GrantedPermissions,
} from '@/global/navigation'

export interface AuxSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (routeId: string) => void
  onPrimaryAction?: (actionId: string) => void
  grantedPermissions?: GrantedPermissions
  onLogout?: () => void
}

// Resuelve menú + pie + CTA del auxiliar según permisos efectivos
export function resolveAuxSidebarNav(grantedPermissions?: GrantedPermissions): {
  navItems: SidebarNavItem[]
  footerNavItems: SidebarNavItem[]
  primaryAction: SidebarPrimaryAction | null
} {
  const visible = resolveNavCatalog(
    AUX_NAV_CATALOG,
    AUX_DEFAULT_PERMISSIONS,
    grantedPermissions,
  )
  const { actions, links } = splitNavCatalog(visible)
  const { main, footer } = splitNavByPlacement(links)

  return {
    navItems: toSidebarNavItems(main),
    footerNavItems: toSidebarNavItems(footer),
    primaryAction: toSidebarPrimaryAction(actions),
  }
}

// Sidebar del rol auxiliar (catálogo global + filtrado por permisos)
export function AuxSidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
  onPrimaryAction,
  grantedPermissions,
  onLogout,
}: AuxSidebarProps) {
  const { navItems, footerNavItems, primaryAction } =
    resolveAuxSidebarNav(grantedPermissions)

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
      primaryAction={primaryAction}
      onPrimaryAction={onPrimaryAction}
      showPanelHeader={false}
      showProfileButton={false}
      showLogoutButton={true}
      logoutLabel="Cerrar Sesión"
      sectionTitle="Navegación Auxiliar"
      panelTitle="Panel Auxiliar"
      onLogout={onLogout}
    />
  )
}
