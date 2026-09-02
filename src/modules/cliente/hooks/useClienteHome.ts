import { useCallback, useEffect, useState } from 'react'
import type { GrantedPermissions, NavPermissionKey } from '@/global/navigation'
import { isNavPermissionGranted } from '@/modules/auth'
import type {
  ClienteHomeDashboard,
} from '../types'
import { fetchClienteHomeDashboard, fetchClienteNavPermissions } from '../services'

const IMPLEMENTED_ROUTES = new Set([
  'inicio',
  'mascotas',
  'citas',
  'historial',
  'perfil',
])

const GATED_ROUTES: Record<string, NavPermissionKey> = {
  mascotas: 'cliente.mascotas',
  citas: 'cliente.citas',
  historial: 'cliente.historial',
}

export function useClienteHome(onLogout?: () => void) {
  const [dashboard, setDashboard] = useState<ClienteHomeDashboard | null>(null)
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
          fetchClienteHomeDashboard(),
          fetchClienteNavPermissions(),
        ])
        if (!cancelled) {
          setDashboard(data)
          setGrantedPermissions(permissions)
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar tu portal')
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
      closeSidebar()
      return
    }

    setActiveRoute(routeId)
    closeSidebar()

    if (!IMPLEMENTED_ROUTES.has(routeId)) {
      showToast('Esta sección aún no está disponible')
    }
  }

  const handleViewMascotas = () => {
    handleNavigate('mascotas')
  }

  const handleViewCitas = () => {
    handleNavigate('citas')
  }

  const handleRescheduleAppointment = (appointmentId: string) => {
    showToast(`Reprogramar cita ${appointmentId}: disponible próximamente`)
  }

  const handleViewAppointmentDetails = (appointmentId: string) => {
    handleNavigate('citas')
    showToast(`Abriendo detalle de cita ${appointmentId}`)
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
    handleViewMascotas,
    handleViewCitas,
    handleRescheduleAppointment,
    handleViewAppointmentDetails,
  }
}
