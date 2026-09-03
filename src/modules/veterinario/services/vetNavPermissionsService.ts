import type { GrantedPermissions } from '@/global/navigation'
import { VET_DEFAULT_PERMISSIONS } from '@/global/navigation'
import {
  fetchMyModulePermissions,
  filterNavKeysByModuleView,
  VET_ALWAYS_VISIBLE_NAV,
  VET_MODULE_TO_NAV,
} from '@/modules/auth'

// Obtiene permisos de menú del veterinario según GET /api/auth/permissions
// null => usar VET_DEFAULT_PERMISSIONS solo si falla la red de forma irrecuperable
export async function fetchVetNavPermissions(
  _userId?: string,
): Promise<GrantedPermissions> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${_userId}/nav-permissions`)
  // return res.json()
  //
  // Para probar ocultar Agenda, el admin devolvería algo como:
  // ['vet.inicio','vet.mascotas','vet.perfil']
  return Promise.resolve(null)

  try {
    const permissions = await fetchMyModulePermissions()
    return filterNavKeysByModuleView(
      VET_DEFAULT_PERMISSIONS,
      permissions,
      VET_MODULE_TO_NAV,
      VET_ALWAYS_VISIBLE_NAV,
    )
  } catch (err) {
    console.error('No se pudieron cargar permisos de navegación del veterinario', err)
    // Ante error de auth/red, no mostrar módulos sensibles
    return VET_ALWAYS_VISIBLE_NAV.filter((key) =>
      VET_DEFAULT_PERMISSIONS.includes(key),
    )
  }
}
