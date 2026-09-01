import type { GrantedPermissions } from '@/global/navigation'

// Obtiene permisos de menú del veterinario asignados por el super admin
// null => usar VET_DEFAULT_PERMISSIONS (vet nuevo / recién asignado)
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
}
