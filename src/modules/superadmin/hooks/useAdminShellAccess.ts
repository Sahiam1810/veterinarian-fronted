import { useCallback, useMemo } from 'react'
import { useCurrentPermissions } from '@/modules/auth'
import type { ModuleId } from '../types'
import { superAdminNavItems } from '../components/SuperAdminSidebar'
import { buildActionMap, buildViewMap } from '../utils/buildAdminShellViewMap'

export { buildViewMap, buildActionMap } from '../utils/buildAdminShellViewMap'

// Primera ruta del menú que el usuario puede ver
export function resolveFirstAllowedAdminRoute(
  canViewModule: (moduleId: ModuleId) => boolean,
): string {
  const first = superAdminNavItems.find((item) => canViewModule(item.moduleId))
  return first?.id ?? 'perfil'
}

// Permisos de menú y acciones del panel para el usuario autenticado
export function useAdminShellAccess(options: {
  personId: string
  accountId?: string
  email?: string
  roleId?: string
  isPlatformSuperAdmin?: boolean
}) {
  const { personId, accountId, email, roleId, isPlatformSuperAdmin } = options

  const { permissions: apiPermissions, isLoading, refresh } = useCurrentPermissions({
    skip: !!isPlatformSuperAdmin,
    reloadKey: personId,
  })

  const actionMap = useMemo(
    () =>
      buildActionMap(apiPermissions, {
        personId,
        accountId,
        email,
        roleId,
        isPlatformSuperAdmin,
      }),
    [apiPermissions, personId, accountId, email, roleId, isPlatformSuperAdmin],
  )

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
    (moduleId: ModuleId) => actionMap[moduleId]?.view === true,
    [actionMap],
  )

  const canCreateModule = useCallback(
    (moduleId: ModuleId) => actionMap[moduleId]?.create === true,
    [actionMap],
  )

  const canEditModule = useCallback(
    (moduleId: ModuleId) => actionMap[moduleId]?.edit === true,
    [actionMap],
  )

  const canDeleteModule = useCallback(
    (moduleId: ModuleId) => actionMap[moduleId]?.delete === true,
    [actionMap],
  )

  const firstAllowedRoute = useMemo(
    () => resolveFirstAllowedAdminRoute(canViewModule),
    [canViewModule],
  )

  return {
    canViewModule,
    canCreateModule,
    canEditModule,
    canDeleteModule,
    viewMap,
    actionMap,
    firstAllowedRoute,
    isLoadingPermissions: isLoading,
    refreshPermissions: refresh,
  }
}
