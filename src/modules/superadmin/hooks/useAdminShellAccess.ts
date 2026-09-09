import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMyModulePermissions, type MyPermissionsMap } from '@/modules/auth'
import type { ModuleId } from '../types'
import { superAdminNavItems } from '../components/SuperAdminSidebar'
import { buildViewMap } from '../utils/buildAdminShellViewMap'

export { buildViewMap } from '../utils/buildAdminShellViewMap'

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
