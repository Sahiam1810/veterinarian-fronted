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
    // S48: solo visible si el SuperAdmin concede Ver sobre "Clientes" (Dueños),
    // vía rol o excepción por usuario — no forma parte del rol base veterinario.
    id: 'duenos',
    label: 'Dueños',
    permissionKey: 'vet.duenos',
    iconKey: 'owners',
    kind: 'link',
    order: 35,
    placement: 'main',
  },
  {
    id: 'especiesRazas',
    label: 'Especies y razas',
    permissionKey: 'vet.especiesRazas',
    iconKey: 'species',
    kind: 'link',
    order: 40,
    placement: 'main',
  },
  {
    id: 'servicios',
    label: 'Servicios',
    permissionKey: 'vet.servicios',
    iconKey: 'services',
    kind: 'link',
    order: 50,
    placement: 'main',
  },
  {
    id: 'hospitalizacion',
    label: 'Hospitalización',
    permissionKey: 'vet.hospitalizacion',
    iconKey: 'hospital',
    kind: 'link',
    order: 55,
    placement: 'main',
  },
  {
    id: 'profesionales',
    label: 'Profesionales',
    permissionKey: 'vet.profesionales',
    iconKey: 'doctors',
    kind: 'link',
    order: 60,
    placement: 'main',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    permissionKey: 'vet.reportes',
    iconKey: 'reports',
    kind: 'link',
    order: 80,
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
