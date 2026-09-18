import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GrantedPermissions, NavPermissionKey } from '@/global/navigation'
import {
  fetchMyModulePermissions,
  isNavPermissionGranted,
  type MyPermissionsMap,
} from '@/modules/auth'
import type {
  RecepHomeDashboard,
  RecepQuickActionId,
} from '../types'
import {
  fetchRecepHomeDashboard,
  fetchEscalatedConversations,
  resolveRecepNavPermissionsFromModules,
} from '../services'
import { createRecepPermissionHelpers } from '../utils/recepModulePermissions'
import {
  useChatEscalationsRealtime,
  type ChatEscalationCreatedPayload,
  type ChatEscalationResolvedPayload,
} from '@/global/notifications'

const IMPLEMENTED_ROUTES = new Set([
  'inicio',
  'perfil',
  'mascotas',
  'agenda',
  'duenos',
  'conversaciones',
])

const GATED_ROUTES: Record<string, NavPermissionKey> = {
  mascotas: 'recep.mascotas',
  agenda: 'recep.agenda',
  duenos: 'recep.duenos',
  conversaciones: 'recep.conversaciones',
}

export function useRecepHome(onLogout?: () => void) {
  const [dashboard, setDashboard] = useState<RecepHomeDashboard | null>(null)
  const [modulePermissions, setModulePermissions] =
    useState<MyPermissionsMap | null>(null)
  const [grantedPermissions, setGrantedPermissions] =
    useState<GrantedPermissions>(null)
  const [unreadEscalationsCount, setUnreadEscalationsCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState('inicio')
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((current) => (current === message ? null : current))
    }, 3500)
  }, [])

  const permissionHelpers = useMemo(
    () => createRecepPermissionHelpers(modulePermissions),
    [modulePermissions],
  )

  const allowedQuickActions = useMemo<RecepQuickActionId[]>(() => {
    const actions: RecepQuickActionId[] = []
    if (permissionHelpers.canCreateModule('agenda')) {
      actions.push('agendar-cita')
    }
    if (permissionHelpers.canCreateModule('duenos')) {
      actions.push('registrar-dueno')
    }
    if (permissionHelpers.canCreateModule('mascotas')) {
      actions.push('registrar-mascota')
    }
    return actions
  }, [permissionHelpers])

  useEffect(() => {
    let cancelled = false

    async function loadHome() {
      setIsLoading(true)
      setError(null)
      try {
        const [data, permissions, escalations] = await Promise.all([
          fetchRecepHomeDashboard(),
          fetchMyModulePermissions().catch(() => ({} as MyPermissionsMap)),
          fetchEscalatedConversations().catch(() => null),
        ])
        if (!cancelled) {
          setDashboard(data)
          setModulePermissions(permissions)
          setGrantedPermissions(resolveRecepNavPermissionsFromModules(permissions))
          if (escalations) {
            setUnreadEscalationsCount(escalations.pendingCount)
          }
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el resumen de recepción')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadHome()
    return () => {
      cancelled = true
    }
  }, [])

  // Suscripción a eventos SignalR de escalamiento a nivel global del shell de Recepción
  const handleRealtimeEscalationCreated = useCallback(
    (payload: ChatEscalationCreatedPayload) => {
      setUnreadEscalationsCount((prev) => prev + 1)
      if (activeRoute !== 'conversaciones') {
        const client = payload.clientName || 'Cliente'
        showToast(`🔔 Nueva conversación escalada: ${client}`)
      }
    },
    [activeRoute, showToast],
  )

  const handleRealtimeEscalationResolved = useCallback(
    (_payload: ChatEscalationResolvedPayload) => {
      setUnreadEscalationsCount((prev) => Math.max(0, prev - 1))
    },
    [],
  )

  useChatEscalationsRealtime({
    enabled: true,
    onEscalationCreated: handleRealtimeEscalationCreated,
    onEscalationResolved: handleRealtimeEscalationResolved,
  })

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const handleNavigate = (routeId: string) => {
    if (routeId === 'logout') {
      onLogout?.()
      return
    }

    const gatedKey = GATED_ROUTES[routeId]
    if (
      gatedKey &&
      !isNavPermissionGranted(grantedPermissions ?? undefined, gatedKey)
    ) {
      showToast('No tienes permiso para ver esta sección')
      setActiveRoute('inicio')
      return
    }

    setActiveRoute(routeId)

    if (!IMPLEMENTED_ROUTES.has(routeId)) {
      showToast('Esta sección aún no está disponible')
    }
  }

  const handleQuickAction = (actionId: RecepQuickActionId) => {
    if (actionId === 'agendar-cita') {
      if (!permissionHelpers.canCreateModule('agenda')) {
        showToast('No tienes permiso para crear citas')
        return
      }
      handleNavigate('agenda')
      return
    }
    if (actionId === 'registrar-mascota') {
      if (!permissionHelpers.canCreateModule('mascotas')) {
        showToast('No tienes permiso para crear mascotas')
        return
      }
      handleNavigate('mascotas')
      return
    }
    if (actionId === 'registrar-dueno') {
      if (!permissionHelpers.canCreateModule('duenos')) {
        showToast('No tienes permiso para crear dueños')
        return
      }
      handleNavigate('duenos')
      return
    }

    const labels: Record<RecepQuickActionId, string> = {
      'agendar-cita': 'Agendar cita',
      'registrar-dueno': 'Registrar dueño',
      'registrar-mascota': 'Registrar mascota',
    }
    showToast(`${labels[actionId]}: módulo pendiente`)
  }

  const handleViewFullMonth = () => {
    handleNavigate('agenda')
  }

  return {
    dashboard,
    grantedPermissions,
    modulePermissions,
    allowedQuickActions,
    unreadEscalationsCount,
    isLoading,
    error,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    activeRoute,
    handleNavigate,
    activeNotification,
    showToast,
    handleQuickAction,
    handleViewFullMonth,
  }
}
