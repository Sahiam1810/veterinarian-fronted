import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMyModulePermissions, type MyPermissionsMap } from '@/modules/auth'
import type { ModuleId } from '../types'
import { resolveUiShellOverrides } from '../utils/uiShellPermissionsStorage'
import { superAdminNavItems } from '../components/SuperAdminSidebar'

// Módulos Oracle → ids del menú del panel admin
const API_MODULE_TO_SHELL: Record<string, ModuleId> = {
  Usuarios: 'usuarios',
  Mascotas: 'mascotas',
  Clientes: 'duenos',
  Servicios: 'servicios',
  Veterinarios: 'profesionales',
  Citas: 'agenda',
  'Historiales Clínicos': 'historiaClinica',
}

function buildViewMap(
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
      servicios: true,
      profesionales: true,
      disponibilidad: true,
      agenda: true,
      historiaClinica: true,
      reportes: true,
    }
  }

  // Por defecto: Inicio/Reportes visibles; el resto sale de la API (false si no hay fila)
  const views: Record<ModuleId, boolean> = {
    inicio: true,
    usuarios: false,
    duenos: false,
    mascotas: false,
    servicios: false,
    profesionales: false,
    disponibilidad: false,
    agenda: false,
    historiaClinica: false,
    reportes: true,
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

// Primera ruta del menú que el usuario puede ver
export function resolveFirstAllowedAdminRoute(
  canViewModule: (moduleId: ModuleId) => boolean,
): string {
  const first = superAdminNavItems.find((item) => canViewModule(item.moduleId))
  return first?.id ?? 'perfil'
}

// Permisos de menú del panel para el admin autenticado
export function useAdminShellAccess(options: {
  personId: string
  accountId?: string
  email?: string
  roleId?: string
  isPlatformSuperAdmin?: boolean
}) {
  const { personId, accountId, email, roleId, isPlatformSuperAdmin } = options
  const [apiPermissions, setApiPermissions] = useState<MyPermissionsMap | null>(null)

  useEffect(() => {
    if (isPlatformSuperAdmin) {
      setApiPermissions(null)
      return
    }
    let cancelled = false
    void fetchMyModulePermissions()
      .then((perms) => {
        if (!cancelled) setApiPermissions(perms)
      })
      .catch(() => {
        if (!cancelled) setApiPermissions({})
      })
    return () => {
      cancelled = true
    }
  }, [isPlatformSuperAdmin, personId])

  const viewMap = useMemo(
    () =>
      buildViewMap(apiPermissions, {
        personId,
        accountId,
        email,
        roleId,
        isPlatformSuperAdmin,
      }),
    [apiPermissions, personId, accountId, email, roleId, isPlatformSuperAdmin],
  )

  const canViewModule = useCallback(
    (moduleId: ModuleId) => viewMap[moduleId] !== false,
    [viewMap],
  )

  const firstAllowedRoute = useMemo(
    () => resolveFirstAllowedAdminRoute(canViewModule),
    [canViewModule],
  )

  return { canViewModule, viewMap, firstAllowedRoute }
}
