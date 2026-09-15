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
    id: 'mascotas',
    label: 'Mascotas',
    permissionKey: 'aux.mascotas',
    iconKey: 'paw',
    kind: 'link',
    order: 40,
    placement: 'main',
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    permissionKey: 'aux.usuarios',
    iconKey: 'users',
    kind: 'link',
    order: 30,
    placement: 'main',
  },
  {
    id: 'duenos',
    label: 'Dueños',
    permissionKey: 'aux.duenos',
    iconKey: 'owners',
    kind: 'link',
    order: 50,
    placement: 'main',
  },
  {
    id: 'especies-razas',
    label: 'Especies y razas',
    permissionKey: 'aux.especiesRazas',
    iconKey: 'paw',
    kind: 'link',
    order: 60,
    placement: 'main',
  },
  {
    id: 'servicios',
    label: 'Servicios',
    permissionKey: 'aux.servicios',
    iconKey: 'clinical-history',
    kind: 'link',
    order: 70,
    placement: 'main',
  },
  {
    id: 'diagnosticos',
    label: 'Diagnósticos',
    permissionKey: 'aux.historiaClinica',
    iconKey: 'clinical-history',
    kind: 'link',
    order: 75,
    placement: 'main',
  },
  {
    id: 'profesionales',
    label: 'Profesionales',
    permissionKey: 'aux.profesionales',
    iconKey: 'users',
    kind: 'link',
    order: 80,
    placement: 'main',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    permissionKey: 'aux.reportes',
    iconKey: 'settings',
    kind: 'link',
    order: 85,
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

// Permisos base del auxiliar. Los restantes elementos del catálogo empiezan
// apagados y se agregan exclusivamente al conceder Ver sobre su módulo.
export const AUX_DEFAULT_PERMISSIONS: NavPermissionKey[] = [
  'aux.inicio',
  'aux.agenda',
  'aux.mascotas',
  'aux.perfil',
]

export const AUX_NAV_PERMISSION_KEYS: NavPermissionKey[] = AUX_NAV_CATALOG.map(
  (item) => item.permissionKey,
)
