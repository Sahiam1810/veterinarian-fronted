import type { GrantedPermissions } from '@/global/navigation'
import { AUX_DEFAULT_PERMISSIONS } from '@/global/navigation'
import {
  AUX_ALWAYS_VISIBLE_NAV,
  AUX_MODULE_TO_NAV,
  fetchMyModulePermissions,
  filterNavKeysByModuleView,
} from '@/modules/auth'

// Permisos de menú del auxiliar desde GET /api/auth/permissions
export async function fetchAuxNavPermissions(): Promise<GrantedPermissions> {
  try {
    const permissions = await fetchMyModulePermissions()
    return filterNavKeysByModuleView(
      AUX_DEFAULT_PERMISSIONS,
      permissions,
      AUX_MODULE_TO_NAV,
      AUX_ALWAYS_VISIBLE_NAV,
    )
  } catch (err) {
    console.error('No se pudieron cargar permisos de navegación del auxiliar', err)
    return AUX_ALWAYS_VISIBLE_NAV.filter((key) =>
      AUX_DEFAULT_PERMISSIONS.includes(key),
    )
  }
}
