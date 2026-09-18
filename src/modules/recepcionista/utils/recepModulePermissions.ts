import type {
  MyModulePermission,
  MyPermissionsMap,
} from '../../auth/services/myPermissionsService.ts'

export type RecepModuleId =
  | 'agenda'
  | 'mascotas'
  | 'duenos'
  | 'conversaciones'

interface RecepModulePermissionRule {
  viewModules: string[]
  createModule: string
  editModule: string
  deleteModule: string
}

export const RECEP_MODULE_PERMISSION_RULES: Record<
  RecepModuleId,
  RecepModulePermissionRule
> = {
  agenda: {
    viewModules: ['Citas'],
    createModule: 'Citas',
    editModule: 'Citas',
    deleteModule: 'Citas',
  },
  mascotas: {
    viewModules: ['Mascotas'],
    createModule: 'Mascotas',
    editModule: 'Mascotas',
    deleteModule: 'Mascotas',
  },
  duenos: {
    viewModules: ['Clientes'],
    createModule: 'Clientes',
    editModule: 'Clientes',
    deleteModule: 'Clientes',
  },
  conversaciones: {
    viewModules: ['Chat', 'Escalamientos'],
    createModule: 'Chat',
    editModule: 'Escalamientos',
    deleteModule: 'Escalamientos',
  },
}

export const EMPTY_RECEP_MODULE_PERMISSION: MyModulePermission = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
}

export function getRecepModulePermission(
  permissions: MyPermissionsMap | null | undefined,
  moduleName: string,
): MyModulePermission {
  return permissions?.[moduleName] ?? EMPTY_RECEP_MODULE_PERMISSION
}

export interface RecepPermissionHelpers {
  canViewModule: (moduleId: RecepModuleId) => boolean
  canCreateModule: (moduleId: RecepModuleId) => boolean
  canEditModule: (moduleId: RecepModuleId) => boolean
  canDeleteModule: (moduleId: RecepModuleId) => boolean
}

export function createRecepPermissionHelpers(
  permissions: MyPermissionsMap | null | undefined,
): RecepPermissionHelpers {
  const getPermission = (moduleName: string) =>
    getRecepModulePermission(permissions, moduleName)

  const canViewModule = (moduleId: RecepModuleId) =>
    RECEP_MODULE_PERMISSION_RULES[moduleId].viewModules.every(
      (moduleName) => getPermission(moduleName).canView,
    )

  return {
    canViewModule,
    canCreateModule: (moduleId) => {
      const rule = RECEP_MODULE_PERMISSION_RULES[moduleId]
      return canViewModule(moduleId) && getPermission(rule.createModule).canCreate
    },
    canEditModule: (moduleId) => {
      const rule = RECEP_MODULE_PERMISSION_RULES[moduleId]
      return canViewModule(moduleId) && getPermission(rule.editModule).canEdit
    },
    canDeleteModule: (moduleId) => {
      const rule = RECEP_MODULE_PERMISSION_RULES[moduleId]
      return canViewModule(moduleId) && getPermission(rule.deleteModule).canDelete
    },
  }
}
