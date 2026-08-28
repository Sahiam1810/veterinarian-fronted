import type { NavCatalogItem, NavPermissionKey } from '../types'

// Catálogo completo de opciones del rol auxiliar
export const AUX_NAV_CATALOG: NavCatalogItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    permissionKey: 'aux.inicio',
    iconKey: 'home',
    kind: 'link',
    order: 10,
    placement: 'main',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    permissionKey: 'aux.agenda',
    iconKey: 'calendar',
    kind: 'link',
    order: 20,
    placement: 'main',
  },
  {
    id: 'preparacion',
    label: 'Preparación',
    permissionKey: 'aux.preparacion',
    iconKey: 'clinical-history',
    kind: 'link',
    order: 30,
    placement: 'main',
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    permissionKey: 'aux.mascotas',
    iconKey: 'paw',
    kind: 'link',
    order: 40,
    placement: 'main',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    permissionKey: 'aux.perfil',
    iconKey: 'user',
    kind: 'link',
    order: 90,
    placement: 'footer',
  },
]

export const AUX_DEFAULT_PERMISSIONS: NavPermissionKey[] = AUX_NAV_CATALOG.map(
  (item) => item.permissionKey,
)
