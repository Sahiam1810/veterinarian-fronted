import type { UserRole } from '../types/auth'

export const SUPERADMIN_ROLE_ID = '99999999-9999-9999-9999-999999999999'

export function isPersistedSuperAdminRole(roleId: string | undefined | null): boolean {
  return roleId?.trim().toLowerCase() === SUPERADMIN_ROLE_ID
}

export function resolvePersistedRoleIdentity(
  roleId: string | undefined | null,
  fallbackRole: UserRole,
): { role: UserRole; isPlatformSuperAdmin: boolean } {
  const isPlatformSuperAdmin = isPersistedSuperAdminRole(roleId)

  return {
    role: isPlatformSuperAdmin ? 'superadmin' : fallbackRole,
    isPlatformSuperAdmin,
  }
}
