import type {
  GrantedPermissions,
  NavPermissionKey,
} from '../../../global/navigation/types.ts'
import { RECEP_DEFAULT_PERMISSIONS } from '../../../global/navigation/roles/recepcionista.ts'
import {
  fetchMyModulePermissions,
  type MyPermissionsMap,
  RECEP_ALWAYS_VISIBLE_NAV,
} from '../../auth/services/myPermissionsService.ts'
import {
  createRecepPermissionHelpers,
  type RecepModuleId,
} from '../utils/recepModulePermissions.ts'

const RECEP_NAV_MODULES: Array<{
  navKey: NavPermissionKey
  moduleId: RecepModuleId
}> = [
  { navKey: 'recep.mascotas', moduleId: 'mascotas' },
  { navKey: 'recep.duenos', moduleId: 'duenos' },
  { navKey: 'recep.agenda', moduleId: 'agenda' },
  { navKey: 'recep.conversaciones', moduleId: 'conversaciones' },
]

export function resolveRecepNavPermissionsFromModules(
  permissions: MyPermissionsMap,
): GrantedPermissions {
  const helpers = createRecepPermissionHelpers(permissions)
  const granted = new Set(RECEP_DEFAULT_PERMISSIONS)

  for (const { navKey, moduleId } of RECEP_NAV_MODULES) {
    if (!helpers.canViewModule(moduleId)) {
      granted.delete(navKey)
    }
  }

  for (const key of RECEP_ALWAYS_VISIBLE_NAV) {
    if (RECEP_DEFAULT_PERMISSIONS.includes(key)) {
      granted.add(key)
    }
  }

  return RECEP_DEFAULT_PERMISSIONS.filter((key) => granted.has(key))
}

// Obtiene permisos de menú del recepcionista según GET /api/auth/permissions.
export async function fetchRecepNavPermissions(): Promise<GrantedPermissions> {
  try {
    const permissions = await fetchMyModulePermissions()
    return resolveRecepNavPermissionsFromModules(permissions)
  } catch (err) {
    console.error(
      'No se pudieron cargar permisos de navegación del recepcionista',
      err,
    )
    // Ante error de auth/red, no mostrar módulos sensibles.
    return RECEP_ALWAYS_VISIBLE_NAV.filter((key) =>
      RECEP_DEFAULT_PERMISSIONS.includes(key),
    )
  }
}
