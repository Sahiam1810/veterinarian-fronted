import type { NavCatalogItem, NavPermissionKey } from '../types'

// Catálogo completo de opciones del rol veterinario (fuente de verdad)
export const VET_NAV_CATALOG: NavCatalogItem[] = [
  {
    id: 'nueva-atencion',
    label: 'Nueva Atención',
    permissionKey: 'vet.nueva-atencion',
    iconKey: 'plus',
    kind: 'action',
    order: 0,
  },
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
