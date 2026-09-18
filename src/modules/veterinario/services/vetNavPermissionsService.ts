import type { GrantedPermissions } from '../../../global/navigation/types.ts'
import { VET_DEFAULT_PERMISSIONS } from '../../../global/navigation/roles/veterinario.ts'
import {
  fetchMyModulePermissions,
  filterNavKeysByModuleView,
  type MyPermissionsMap,
  VET_ALWAYS_VISIBLE_NAV,
  VET_MODULE_TO_NAV,
} from '../../auth/services/myPermissionsService.ts'

export function resolveVetNavPermissionsFromModules(
  permissions: MyPermissionsMap,
): GrantedPermissions {
  return filterNavKeysByModuleView(
    VET_DEFAULT_PERMISSIONS,
    permissions,
    VET_MODULE_TO_NAV,
    VET_ALWAYS_VISIBLE_NAV,
  )
}

// Obtiene permisos de menú del veterinario según GET /api/auth/permissions.
export async function fetchVetNavPermissions(
  _userId?: string,
): Promise<GrantedPermissions> {
  try {
    const permissions = await fetchMyModulePermissions()
    return resolveVetNavPermissionsFromModules(permissions)
  } catch (err) {
    console.error('No se pudieron cargar permisos de navegación del veterinario', err)
    // Ante error de auth/red, no mostrar módulos sensibles.
    return VET_ALWAYS_VISIBLE_NAV.filter((key) =>
      VET_DEFAULT_PERMISSIONS.includes(key),
    )
  }
}

