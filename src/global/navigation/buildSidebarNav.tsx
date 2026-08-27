import type { ReactNode } from 'react'
import {
  CalendarIcon,
  HomeIcon,
  PawIcon,
  UserAvatarIcon,
  ClinicalHistoryIcon,
  PlusIcon,
  SettingsIcon,
  OwnersIcon,
} from '../components/Icons'
import type { NavCatalogItem, NavIconKey } from './types'
import type { SidebarNavItem, SidebarPrimaryAction } from '../components/Sidebar'

// Mapea iconKey del catálogo a componente SVG global
export function renderNavIcon(iconKey: NavIconKey, className = 'w-5 h-5 shrink-0'): ReactNode {
  switch (iconKey) {
    case 'home':
      return <HomeIcon className={className} />
    case 'calendar':
      return <CalendarIcon className={className} />
    case 'paw':
      return <PawIcon className="w-4.5 h-4.5 shrink-0" />
    case 'clinical-history':
      return <ClinicalHistoryIcon className={className} />
    case 'user':
      return <UserAvatarIcon className={className} />
    case 'plus':
      return <PlusIcon className={className} />
    case 'settings':
      return <SettingsIcon className={className} />
    case 'owners':
      return <OwnersIcon className={className} />
    default:
      return null
  }
}

// Convierte links del catálogo a ítems listos para <Sidebar />
export function toSidebarNavItems(links: NavCatalogItem[]): SidebarNavItem[] {
  return links.map((item) => ({
    id: item.id,
    label: item.label,
    icon: renderNavIcon(item.iconKey),
    permissionKey: item.permissionKey,
  }))
}

// Separa menú principal vs pie (perfil / configuración)
export function splitNavByPlacement(links: NavCatalogItem[]) {
  const main = links.filter((item) => (item.placement ?? 'main') === 'main')
  const footer = links.filter((item) => item.placement === 'footer')
  return { main, footer }
}

// Convierte la primera acción del catálogo al CTA de la sidebar
export function toSidebarPrimaryAction(
  actions: NavCatalogItem[],
): SidebarPrimaryAction | null {
  const action = actions[0]
  if (!action) return null

  return {
    id: action.id,
    label: action.label,
    icon: renderNavIcon(action.iconKey, 'w-4 h-4 shrink-0'),
    permissionKey: action.permissionKey,
  }
}
