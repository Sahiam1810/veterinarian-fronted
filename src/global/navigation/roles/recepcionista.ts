import type { NavCatalogItem, NavPermissionKey } from '../types'

// Catálogo de navegación del rol recepcionista
export const RECEP_NAV_CATALOG: NavCatalogItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    permissionKey: 'recep.inicio',
    iconKey: 'home',
    kind: 'link',
    order: 10,
    placement: 'main',
  },
  {
    id: 'duenos',
    label: 'Dueños',
    permissionKey: 'recep.duenos',
    iconKey: 'owners',
    kind: 'link',
    order: 20,
    placement: 'main',
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    permissionKey: 'recep.mascotas',
    iconKey: 'paw',
    kind: 'link',
    order: 30,
    placement: 'main',
  },
  {
    id: 'agenda',
    label: 'Agenda y Citas',
    permissionKey: 'recep.agenda',
    iconKey: 'calendar',
    kind: 'link',
    order: 40,
    placement: 'main',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    permissionKey: 'recep.perfil',
    iconKey: 'user',
    kind: 'link',
    order: 90,
    placement: 'footer',
  },
]

export const RECEP_DEFAULT_PERMISSIONS: NavPermissionKey[] = RECEP_NAV_CATALOG.map(
  (item) => item.permissionKey,
)
