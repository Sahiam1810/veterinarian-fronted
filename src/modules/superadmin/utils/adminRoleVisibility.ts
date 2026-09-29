import { isPersistedClientRole } from '../../auth/utils/systemRoles.ts'

// Cliente es el rol técnico del bot/portal: no se lista ni se asigna en Usuarios/Roles.
export function excludeClientRole<T extends { id: string }>(roles: readonly T[]): T[] {
  return roles.filter((role) => !isPersistedClientRole(role.id))
}

export function excludeClientRoleUsers<T extends { roleId: string }>(users: readonly T[]): T[] {
  return users.filter((user) => !isPersistedClientRole(user.roleId))
}
