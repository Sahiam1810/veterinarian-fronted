import { useCallback, useEffect, useState } from 'react'
import type { GrantedPermissions, NavPermissionKey } from '@/global/navigation'
import { isNavPermissionGranted } from '@/modules/auth'
import type {
  RecepDayAppointment,
  RecepHomeDashboard,
  RecepQuickActionId,
} from '../types'
import { fetchRecepHomeDashboard, fetchRecepNavPermissions } from '../services'

const IMPLEMENTED_ROUTES = new Set([
  'inicio',
  'perfil',
  'mascotas',
  'agenda',
  'duenos',
])

const GATED_ROUTES: Record<string, NavPermissionKey> = {
  mascotas: 'recep.mascotas',
  agenda: 'recep.agenda',
  duenos: 'recep.duenos',
}

export function useRecepHome(onLogout?: () => void) {
  const [dashboard, setDashboard] = useState<RecepHomeDashboard | null>(null)
  const [grantedPermissions, setGrantedPermissions] =
    useState<GrantedPermissions>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState('inicio')
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadHome() {
      setIsLoading(true)
      setError(null)
      try {
        const [data, permissions] = await Promise.all([
          fetchRecepHomeDashboard(),
          fetchRecepNavPermissions(),
        ])
        if (!cancelled) {
          setDashboard(data)
          setGrantedPermissions(permissions)
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

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((current) => (current === message ? null : current))
    }, 2800)
  }, [])

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
      handleNavigate('agenda')
      return
    }
    if (actionId === 'registrar-mascota') {
      handleNavigate('mascotas')
      return
    }
    if (actionId === 'registrar-dueno') {
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

  const handleRowAction = (appointment: RecepDayAppointment) => {
    showToast(`Acciones: ${appointment.petName}`)
  }

  return {
    dashboard,
    grantedPermissions,
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
    handleRowAction,
  }
}
