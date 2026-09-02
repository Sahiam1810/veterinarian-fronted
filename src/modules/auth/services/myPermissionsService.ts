import { apiClient } from '@/services'
import type { NavPermissionKey } from '@/global/navigation'

// Permiso de un módulo tal como lo devuelve GET /api/auth/permissions
export interface MyModulePermission {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export type MyPermissionsMap = Record<string, MyModulePermission>

interface AuthPermissionsResponse {
  permissions?: MyPermissionsMap
}

// Mapa módulo Oracle/API → clave de menú del veterinario
export const VET_MODULE_TO_NAV: Record<string, NavPermissionKey> = {
  Mascotas: 'vet.mascotas',
  Citas: 'vet.agenda',
}

// Claves de menú que siempre quedan visibles (no dependen de un módulo CRUD)
export const VET_ALWAYS_VISIBLE_NAV: NavPermissionKey[] = [
  'vet.inicio',
  'vet.perfil',
  'vet.nueva-atencion',
]

// Mapa módulo → menú del recepcionista
export const RECEP_MODULE_TO_NAV: Record<string, NavPermissionKey> = {
  Mascotas: 'recep.mascotas',
  Clientes: 'recep.duenos',
  Citas: 'recep.agenda',
}

export const RECEP_ALWAYS_VISIBLE_NAV: NavPermissionKey[] = [
  'recep.inicio',
  'recep.perfil',
]

// Mapa módulo → menú del auxiliar
export const AUX_MODULE_TO_NAV: Record<string, NavPermissionKey> = {
  Mascotas: 'aux.mascotas',
  Citas: 'aux.agenda',
  'Historiales Clínicos': 'aux.preparacion',
}

export const AUX_ALWAYS_VISIBLE_NAV: NavPermissionKey[] = [
  'aux.inicio',
  'aux.perfil',
]

// Mapa módulo → menú del cliente
export const CLIENTE_MODULE_TO_NAV: Record<string, NavPermissionKey> = {
  Mascotas: 'cliente.mascotas',
  Citas: 'cliente.citas',
  'Historiales Clínicos': 'cliente.historial',
}

export const CLIENTE_ALWAYS_VISIBLE_NAV: NavPermissionKey[] = [
  'cliente.inicio',
  'cliente.perfil',
]

// true si la ruta aún no está filtrada o el permiso está en la lista concedida
export function isNavPermissionGranted(
  granted: NavPermissionKey[] | null | undefined,
  permissionKey: NavPermissionKey,
): boolean {
  if (!granted || !Array.isArray(granted)) return true
  return granted.includes(permissionKey)
}

// Lee permisos efectivos del usuario autenticado
export async function fetchMyModulePermissions(): Promise<MyPermissionsMap> {
  const raw = await apiClient.get<AuthPermissionsResponse | MyPermissionsMap>(
    '/api/auth/permissions',
  )

  if (raw && typeof raw === 'object' && 'permissions' in raw) {
    const wrapped = raw as AuthPermissionsResponse
    if (wrapped.permissions && typeof wrapped.permissions === 'object') {
      return normalizePermissionKeys(wrapped.permissions)
    }
  }

  return normalizePermissionKeys((raw || {}) as MyPermissionsMap)
}

function normalizePermissionKeys(map: MyPermissionsMap): MyPermissionsMap {
  const out: MyPermissionsMap = {}
  for (const [key, value] of Object.entries(map)) {
    if (!value || typeof value !== 'object') continue
    out[key] = {
      canView: Boolean(value.canView),
      canCreate: Boolean(value.canCreate),
      canEdit: Boolean(value.canEdit),
      canDelete: Boolean(value.canDelete),
    }
  }
  return out
}

// Parte de los defaults del rol y quita keys cuyo módulo no tenga canView
export function filterNavKeysByModuleView(
  roleDefaults: NavPermissionKey[],
  permissions: MyPermissionsMap,
  moduleToNav: Record<string, NavPermissionKey>,
  alwaysVisible: NavPermissionKey[],
): NavPermissionKey[] {
  const granted = new Set(roleDefaults)

  for (const [moduleName, navKey] of Object.entries(moduleToNav)) {
    const perm = permissions[moduleName]
    if (!perm?.canView) {
      granted.delete(navKey)
    }
  }

  for (const key of alwaysVisible) {
    if (roleDefaults.includes(key)) {
      granted.add(key)
    }
  }

  return roleDefaults.filter((key) => granted.has(key))
}
