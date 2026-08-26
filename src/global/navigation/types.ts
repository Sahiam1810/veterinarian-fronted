// Tipos de navegación por rol (catálogo + permisos del super admin)

// Clave de permiso estable; el backend/super admin asigna estas mismas keys
export type NavPermissionKey = string

// Identificadores de icono del catálogo (se resuelven a SVG en runtime)
export type NavIconKey =
  | 'home'
  | 'calendar'
  | 'paw'
  | 'clinical-history'
  | 'user'
  | 'plus'
  | 'settings'

// Entrada del catálogo (fuente de verdad por rol; no es UI aún)
export interface NavCatalogItem {
  id: string
  label: string
  permissionKey: NavPermissionKey
  iconKey: NavIconKey
  // link = ítem de menú; action = CTA primario (ej. Nueva Atención)
  kind: 'link' | 'action'
  order: number
  // main = menú superior; footer = anclado abajo (perfil, configuración)
  placement?: 'main' | 'footer'
}

// Permisos efectivos de un usuario concreto
export type GrantedPermissions = NavPermissionKey[] | null | undefined
