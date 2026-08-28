import type { NavCatalogItem, NavPermissionKey } from '../types'

// Catálogo de navegación del portal cliente (dueño de mascota)
export const CLIENTE_NAV_CATALOG: NavCatalogItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    permissionKey: 'cliente.inicio',
    iconKey: 'home',
    kind: 'link',
    order: 10,
    placement: 'main',
  },
  {
    id: 'mascotas',
    label: 'Mis Mascotas',
    permissionKey: 'cliente.mascotas',
    iconKey: 'paw',
    kind: 'link',
    order: 20,
    placement: 'main',
  },
  {
    id: 'citas',
    label: 'Mis Citas',
    permissionKey: 'cliente.citas',
    iconKey: 'calendar',
    kind: 'link',
    order: 30,
    placement: 'main',
  },
  {
    id: 'historial',
    label: 'Historial Clínico',
    permissionKey: 'cliente.historial',
    iconKey: 'clinical-history',
    kind: 'link',
    order: 40,
    placement: 'main',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    permissionKey: 'cliente.perfil',
    iconKey: 'user',
    kind: 'link',
    order: 90,
    placement: 'footer',
  },
]

export const CLIENTE_DEFAULT_PERMISSIONS: NavPermissionKey[] = CLIENTE_NAV_CATALOG.map(
  (item) => item.permissionKey,
)
