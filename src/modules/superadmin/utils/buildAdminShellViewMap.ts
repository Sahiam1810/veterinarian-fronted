import type { MyPermissionsMap } from '../../auth/services/myPermissionsService.ts'
import type { ModuleId } from '../types'
import { resolveUiShellOverrides } from './uiShellPermissionsStorage.ts'

// Módulos Oracle → ids del menú del panel admin
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
}

// Mapa de visibilidad del shell admin (menú + route guard).
export function buildViewMap(
  apiPermissions: MyPermissionsMap | null,
  options: {
    personId: string
    accountId?: string
    email?: string
    roleId?: string
    isPlatformSuperAdmin?: boolean
  },
): Record<ModuleId, boolean> {
  if (options.isPlatformSuperAdmin) {
    return {
      inicio: true,
      usuarios: true,
      duenos: true,
      mascotas: true,
      especiesRazas: true,
      servicios: true,
      profesionales: true,
      disponibilidad: true,
      agenda: true,
      historiaClinica: true,
      reportes: true,
    }
  }

  // Por defecto: Inicio visible; el resto (incluido Reportes) sale de la API (false si no hay fila)
  const views: Record<ModuleId, boolean> = {
    inicio: true,
    usuarios: false,
    duenos: false,
    mascotas: false,
    especiesRazas: false,
    servicios: false,
    profesionales: false,
    disponibilidad: false,
    agenda: false,
    historiaClinica: false,
    reportes: false,
  }

  if (apiPermissions) {
    for (const [apiName, perm] of Object.entries(apiPermissions)) {
      const shellId = API_MODULE_TO_SHELL[apiName]
      if (shellId) views[shellId] = !!perm.canView
    }
  }

  // Excepciones UI: rol base, luego usuario (personId/accountId/email)
  const ui = resolveUiShellOverrides({
    roleId: options.roleId,
    personId: options.personId,
    accountId: options.accountId,
    email: options.email,
  })
  if (ui.inicio) views.inicio = !!ui.inicio.view
  if (ui.reportes) views.reportes = !!ui.reportes.view

  return views
}
