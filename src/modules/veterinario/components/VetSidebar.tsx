import {
  Sidebar,
  type SidebarNavItem,
  type SidebarPrimaryAction,
} from '@/global/components'
import {
  VET_DEFAULT_PERMISSIONS,
  VET_NAV_CATALOG,
  resolveNavCatalog,
  splitNavCatalog,
  splitNavByPlacement,
  toSidebarNavItems,
  toSidebarPrimaryAction,
  type GrantedPermissions,
} from '@/global/navigation'

export interface VetSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeRoute?: string
  onNavigate?: (routeId: string) => void
  onPrimaryAction?: (actionId: string) => void
  // null/undefined = defaults del rol; array = permisos del super admin para este vet
  grantedPermissions?: GrantedPermissions
}

// Resuelve menú + pie + CTA del veterinario según permisos efectivos
export function resolveVetSidebarNav(grantedPermissions?: GrantedPermissions): {
  navItems: SidebarNavItem[]
  footerNavItems: SidebarNavItem[]
  primaryAction: SidebarPrimaryAction | null
} {
  const visible = resolveNavCatalog(
    VET_NAV_CATALOG,
    VET_DEFAULT_PERMISSIONS,
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

// Sidebar del rol veterinario (catálogo global + filtrado por permisos)
export function VetSidebar({
  isOpen = false,
  onClose,
  activeRoute = 'inicio',
  onNavigate,
  onPrimaryAction,
  grantedPermissions,
}: VetSidebarProps) {
  const { navItems, footerNavItems, primaryAction } =
    resolveVetSidebarNav(grantedPermissions)

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
      sectionTitle="Navegación Veterinario"
      panelTitle="Panel Veterinario"
    />
  )
}
