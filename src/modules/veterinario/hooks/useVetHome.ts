import { useEffect, useState, useCallback } from 'react'
import type { GrantedPermissions } from '@/global/navigation'
import type { VetDayAppointment, VetHomeDashboard } from '../types'
import { fetchVetHomeDashboard, fetchVetNavPermissions } from '../services'

const IMPLEMENTED_ROUTES = new Set(['inicio', 'agenda', 'mascotas', 'perfil'])

export function useVetHome() {
  const [dashboard, setDashboard] = useState<VetHomeDashboard | null>(null)
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
          fetchVetHomeDashboard(),
          fetchVetNavPermissions(),
        ])
        if (!cancelled) {
          setDashboard(data)
          setGrantedPermissions(permissions)
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el punto de inicio')
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
      showToast('Cerrar sesión estará disponible con autenticación')
      closeSidebar()
      return
    }

    setActiveRoute(routeId)
    closeSidebar()

    if (!IMPLEMENTED_ROUTES.has(routeId)) {
      showToast('Esta sección aún no está disponible')
    }
  }

  const handlePrimaryAction = (actionId: string) => {
    showToast(
      actionId === 'nueva-atencion'
        ? 'Nueva Atención: módulo pendiente'
        : `Acción: ${actionId}`,
    )
  }

  const handleViewFullAgenda = () => {
    setActiveRoute('agenda')
  }

  const handleAttendNow = (appointment: VetDayAppointment) => {
    showToast(`Atender ahora: ${appointment.petName}`)
  }

  const handleViewAppointment = (appointment: VetDayAppointment) => {
    showToast(`Ver detalle: ${appointment.petName}`)
  }

  const handleMoreActions = (appointment: VetDayAppointment) => {
    showToast(`Más acciones: ${appointment.petName}`)
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
    handlePrimaryAction,
    activeNotification,
    showToast,
    handleViewFullAgenda,
    handleAttendNow,
    handleViewAppointment,
    handleMoreActions,
  }
}
