import type {
  MyModulePermission,
  MyPermissionsMap,
} from '../../auth/services/myPermissionsService.ts'

export type RecepModuleId =
  | 'agenda'
  | 'mascotas'
  | 'duenos'
  | 'conversaciones'
  | 'signosVitales'
  | 'especiesRazas'
  | 'servicios'
  | 'profesionales'
  | 'reportes'

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
  // Módulo propio del backend (separado de "Citas" a propósito): Recepcionista
  // no lo tiene por defecto -- si SuperAdmin se lo otorga desde el panel, el
  // botón debe aparecer solo, sin tocar código.
  signosVitales: {
    viewModules: ['Signos Vitales'],
    createModule: 'Signos Vitales',
    editModule: 'Signos Vitales',
    deleteModule: 'Signos Vitales',
  },
  especiesRazas: {
    viewModules: ['Especies y Razas'],
    createModule: 'Especies y Razas',
    editModule: 'Especies y Razas',
    deleteModule: 'Especies y Razas',
  },
  servicios: {
    viewModules: ['Servicios'],
    createModule: 'Servicios',
    editModule: 'Servicios',
    deleteModule: 'Servicios',
  },
  profesionales: {
    viewModules: ['Veterinarios'],
    createModule: 'Veterinarios',
    editModule: 'Veterinarios',
    deleteModule: 'Veterinarios',
  },
  reportes: {
    viewModules: ['Reportes'],
    createModule: 'Reportes',
    editModule: 'Reportes',
    deleteModule: 'Reportes',
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

  const canViewModule = (moduleId: RecepModuleId) => {
    const rule = RECEP_MODULE_PERMISSION_RULES[moduleId]
    if (!rule) return false
    return rule.viewModules.every(
      (moduleName) => getPermission(moduleName).canView,
    )
  }

  return {
    canViewModule,
    canCreateModule: (moduleId) => {
      const rule = RECEP_MODULE_PERMISSION_RULES[moduleId]
      if (!rule) return false
      return canViewModule(moduleId) && getPermission(rule.createModule).canCreate
    },
    canEditModule: (moduleId) => {
      const rule = RECEP_MODULE_PERMISSION_RULES[moduleId]
      if (!rule) return false
      return canViewModule(moduleId) && getPermission(rule.editModule).canEdit
    },
    canDeleteModule: (moduleId) => {
      const rule = RECEP_MODULE_PERMISSION_RULES[moduleId]
      if (!rule) return false
      return canViewModule(moduleId) && getPermission(rule.deleteModule).canDelete
    },
  }
}
