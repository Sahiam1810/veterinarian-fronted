import type { MyPermissionsMap } from '../../auth/services/myPermissionsService.ts'
import type { ModuleId } from '../types'

// Módulos Oracle → ids del menú del panel admin (mapa canónico FE ↔ BE)
export const API_MODULE_TO_SHELL: Record<string, ModuleId> = {
  Usuarios: 'usuarios',
  Mascotas: 'mascotas',
  Clientes: 'duenos',
  'Especies y Razas': 'especiesRazas',
  Servicios: 'servicios',
  Veterinarios: 'profesionales',
  Citas: 'agenda',
  'Historiales Clínicos': 'historiaClinica',
  Reportes: 'reportes',
  'Órdenes Médicas': 'ordenesMedicas',
  Insumos: 'insumos',
  Hospitalización: 'hospitalizacion',
}

// Acción CRUD sobre un módulo del shell
export type ModuleAction = 'view' | 'create' | 'edit' | 'delete'

const ALL_TRUE_ACTIONS: Record<ModuleAction, boolean> = {
  view: true,
  create: true,
  edit: true,
  delete: true,
}

const ALL_FALSE_ACTIONS: Record<ModuleAction, boolean> = {
  view: false,
  create: false,
  edit: false,
  delete: false,
}

// Acciones por ModuleId del shell (permission-first)
export type ShellActionMap = Record<ModuleId, Record<ModuleAction, boolean>>

function emptyActionMap(inicioView: boolean): ShellActionMap {
  return {
    inicio: { ...ALL_FALSE_ACTIONS, view: inicioView },
    usuarios: { ...ALL_FALSE_ACTIONS },
    duenos: { ...ALL_FALSE_ACTIONS },
    mascotas: { ...ALL_FALSE_ACTIONS },
    especiesRazas: { ...ALL_FALSE_ACTIONS },
    servicios: { ...ALL_FALSE_ACTIONS },
    profesionales: { ...ALL_FALSE_ACTIONS },
    disponibilidad: { ...ALL_FALSE_ACTIONS },
    agenda: { ...ALL_FALSE_ACTIONS },
    historiaClinica: { ...ALL_FALSE_ACTIONS },
    reportes: { ...ALL_FALSE_ACTIONS },
    ordenesMedicas: { ...ALL_FALSE_ACTIONS },
    insumos: { ...ALL_FALSE_ACTIONS },
    hospitalizacion: { ...ALL_FALSE_ACTIONS },
  }
}

function platformFullActionMap(): ShellActionMap {
  const ids: ModuleId[] = [
    'inicio',
    'usuarios',
    'duenos',
    'mascotas',
    'especiesRazas',
    'servicios',
    'profesionales',
    'disponibilidad',
    'agenda',
    'historiaClinica',
    'reportes',
    'ordenesMedicas',
    'insumos',
    'hospitalizacion',
  ]
  const map = {} as ShellActionMap
  for (const id of ids) {
    map[id] = { ...ALL_TRUE_ACTIONS }
  }
  return map
}

// Construye mapa completo View/Create/Edit/Delete por módulo del shell
export function buildActionMap(
  apiPermissions: MyPermissionsMap | null,
  options: {
    id?: string
    email?: string
    roleId?: string
    isPlatformSuperAdmin?: boolean
  },
): ShellActionMap {
  if (options.isPlatformSuperAdmin) {
    return platformFullActionMap()
  }

  // Fail-closed: sin API aún o vacía, solo Inicio visible
  const actions = emptyActionMap(true)

  if (apiPermissions) {
    for (const [apiName, perm] of Object.entries(apiPermissions)) {
      const shellId = API_MODULE_TO_SHELL[apiName]
      if (!shellId) continue
      const isViewAllowed = !!perm.canView
      actions[shellId] = {
        view: isViewAllowed,
        create: isViewAllowed && !!perm.canCreate,
        edit: isViewAllowed && !!perm.canEdit,
        delete: isViewAllowed && !!perm.canDelete,
      }
    }
  }

  return actions
}

// Mapa de visibilidad del shell admin (menú + route guard)
export function buildViewMap(
  apiPermissions: MyPermissionsMap | null,
  options: {
    id?: string
    email?: string
    roleId?: string
    isPlatformSuperAdmin?: boolean
  },
): Record<ModuleId, boolean> {
  const actions = buildActionMap(apiPermissions, options)
  const views = {} as Record<ModuleId, boolean>
  for (const [id, perms] of Object.entries(actions) as [ModuleId, Record<ModuleAction, boolean>][]) {
    views[id] = perms.view
  }
  return views
}
