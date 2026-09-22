import type {
  MyModulePermission,
  MyPermissionsMap,
} from '@/modules/auth/services/myPermissionsService'

export type VetModuleId =
  | 'agenda'
  | 'mascotas'
  | 'duenos'
  | 'historiaClinica'
  | 'reportes'
  | 'especiesRazas'
  | 'servicios'
  | 'profesionales'
  | 'ordenesMedicas'

export const VET_MODULE_ID_TO_API_MODULE: Record<VetModuleId, string> = {
  agenda: 'Citas',
  mascotas: 'Mascotas',
  duenos: 'Clientes',
  historiaClinica: 'Historiales Clínicos',
  reportes: 'Reportes',
  especiesRazas: 'Especies y Razas',
  servicios: 'Servicios',
  profesionales: 'Veterinarios',
  ordenesMedicas: 'Órdenes Médicas',
}

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

export interface VetPermissionHelpers {
  canViewModule: (moduleId: VetModuleId) => boolean
  canCreateModule: (moduleId: VetModuleId) => boolean
  canEditModule: (moduleId: VetModuleId) => boolean
  canDeleteModule: (moduleId: VetModuleId) => boolean
}

export function createVetPermissionHelpers(
  permissions: MyPermissionsMap | null | undefined,
): VetPermissionHelpers {
  const getPermission = (moduleId: VetModuleId) =>
    getVetModulePermission(permissions, VET_MODULE_ID_TO_API_MODULE[moduleId])

  const canViewModule = (moduleId: VetModuleId) =>
    getPermission(moduleId).canView

  return {
    canViewModule,
    canCreateModule: (moduleId) => {
      const permission = getPermission(moduleId)
      return permission.canView && permission.canCreate
    },
    canEditModule: (moduleId) => {
      const permission = getPermission(moduleId)
      return permission.canView && permission.canEdit
    },
    canDeleteModule: (moduleId) => {
      const permission = getPermission(moduleId)
      return permission.canView && permission.canDelete
    },
  }
}
