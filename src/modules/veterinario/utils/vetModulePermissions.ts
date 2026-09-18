import type { MyModulePermission, MyPermissionsMap } from '@/modules/auth'

export const EMPTY_VET_MODULE_PERMISSION: MyModulePermission = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
}

export function getVetModulePermission(
  permissions: MyPermissionsMap | null | undefined,
  moduleName: string,
): MyModulePermission {
  return permissions?.[moduleName] ?? EMPTY_VET_MODULE_PERMISSION
}

