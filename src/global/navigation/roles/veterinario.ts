import type { NavCatalogItem, NavPermissionKey } from '../types'

// Catálogo del veterinario: agenda, atención e historia; no agenda citas (eso es recepción).
export const VET_NAV_CATALOG: NavCatalogItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    permissionKey: 'vet.inicio',
    iconKey: 'home',
    kind: 'link',
    order: 10,
    placement: 'main',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    permissionKey: 'vet.agenda',
    iconKey: 'calendar',
    kind: 'link',
    order: 20,
    placement: 'main',
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    permissionKey: 'vet.mascotas',
    iconKey: 'paw',
    kind: 'link',
    order: 30,
    placement: 'main',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    permissionKey: 'vet.perfil',
    iconKey: 'user',
    kind: 'link',
    order: 90,
    placement: 'footer',
  },
]

// Permisos por defecto al crear / asignar rol veterinario
export const VET_DEFAULT_PERMISSIONS: NavPermissionKey[] = VET_NAV_CATALOG.map(
  (item) => item.permissionKey,
)
