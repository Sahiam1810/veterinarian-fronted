import { useEffect, useState, useCallback, useMemo } from 'react'
import type { GrantedPermissions, NavPermissionKey } from '@/global/navigation'
import { isNavPermissionGranted, getAccessToken, getStoredUser } from '@/modules/auth'
import type {
  HistoriaClinicaPayload,
  VetDayAppointment,
  VetHomeDashboard,
} from '../types'
import {
  fetchVetHomeBundle,
  fetchVetNavPermissions,
  fetchStatusAppointments,
  updateAppointmentStatus,
  findStatusId,
  fetchHistoriaClinica,
  markVetNotificationAsRead,
  mapVetNotification,
} from '../services'
import type { ApiNotification } from '../api/apiTypes'
import type { CitaActionTarget } from '../components'
import {
  useNotificationsRealtime,
  prependNotificationById,
  isRealtimeNotificationUnread,
  type RealtimeNotificationPayload,
} from '@/global/notifications'

const IMPLEMENTED_ROUTES = new Set(['inicio', 'agenda', 'mascotas', 'perfil'])

const GATED_ROUTES: Record<string, NavPermissionKey> = {
  mascotas: 'vet.mascotas',
  agenda: 'vet.agenda',
}

export function useVetHome() {
  const [dashboard, setDashboard] = useState<VetHomeDashboard | null>(null)
  const [grantedPermissions, setGrantedPermissions] =
    useState<GrantedPermissions>(null)
  const [rawNotifications, setRawNotifications] = useState<ApiNotification[]>([])
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState('inicio')
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  // Modales desde Inicio
  const [selectedAppointment, setSelectedAppointment] = useState<CitaActionTarget | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false)
  const [historiaModalTarget, setHistoriaModalTarget] = useState<HistoriaClinicaPayload | null>(null)
  const [isHistoriaModalOpen, setIsHistoriaModalOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((current) => (current === message ? null : current))
    }, 2800)
  }, [])

  const loadHome = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [home, permissions] = await Promise.all([
        fetchVetHomeBundle(),
        fetchVetNavPermissions(),
      ])
      setDashboard(home.dashboard)
      setRawNotifications(home.notifications)
      setUnreadNotificationsCount(home.unreadNotificationsCount)
      setGrantedPermissions(permissions)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo cargar el punto de inicio'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadHome()
  }, [loadHome])

  // Tiempo real: prepend a rawNotifications; si el hub falla, sigue el bundle REST.
  const handleRealtimeNotification = useCallback((incoming: RealtimeNotificationPayload) => {
    const sessionUserId = getStoredUser()?.personId
    if (
      sessionUserId &&
      incoming.userId.toLowerCase() !== sessionUserId.toLowerCase()
    ) {
      return
    }

    const record: ApiNotification = {
      id: incoming.id,
      userId: incoming.userId,
      userFullName: incoming.userFullName,
      appointmentId: incoming.appointmentId,
      message: incoming.message ?? 'Notificación del sistema.',
      sentAt: incoming.sentAt,
      status: incoming.status ?? '',
      type: incoming.type ?? 'General',
      createdAt: incoming.createdAt,
      updatedAt: incoming.updatedAt,
    }

    setRawNotifications((curr) => {
      if (curr.some((n) => n.id === record.id)) return curr
      if (isRealtimeNotificationUnread(record.status)) {
        setUnreadNotificationsCount((count) => count + 1)
      }
      return prependNotificationById(curr, record)
    })
  }, [])

  useNotificationsRealtime({
    enabled: Boolean(getAccessToken()),
    onNotification: handleRealtimeNotification,
  })

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const handleNavigate = (routeId: string) => {
    if (routeId === 'logout') {
      showToast('Cerrar sesión estará disponible con autenticación')
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

  const handleViewFullAgenda = () => {
    handleNavigate('agenda')
  }

  const handleAttendNow = (appointment: VetDayAppointment) => {
    const target: CitaActionTarget = {
      id: appointment.id,
      startTime: appointment.time,
      status: appointment.status,
      petName: appointment.petName,
      speciesBreed: appointment.speciesBreed,
      service: appointment.service,
      clientPetId: appointment.clientPetId,
      petId: appointment.petId,
      ownerName: appointment.ownerName,
      ownerPhone: appointment.ownerPhone,
      rawStatusName: appointment.rawStatusName,
    }

    setSelectedAppointment(target)
    setIsRegistrarOpen(true)
  }

  const handleViewAppointment = (appointment: VetDayAppointment) => {
    const target: CitaActionTarget = {
      id: appointment.id,
      startTime: appointment.time,
      status: appointment.status,
      petName: appointment.petName,
      speciesBreed: appointment.speciesBreed,
      service: appointment.service,
      clientPetId: appointment.clientPetId,
      petId: appointment.petId,
      ownerName: appointment.ownerName,
      ownerPhone: appointment.ownerPhone,
      rawStatusName: appointment.rawStatusName,
    }

    setSelectedAppointment(target)
    setIsActionModalOpen(true)
  }

  const handleMoreActions = (appointment: VetDayAppointment) => {
    handleViewAppointment(appointment)
  }

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false)
  }

  const handleCloseRegistrar = () => {
    setIsRegistrarOpen(false)
  }

  const handleCloseHistoria = () => {
    setIsHistoriaModalOpen(false)
    setHistoriaModalTarget(null)
  }

  const handleUpdateStatus = async (
    appointmentId: string,
    statusKeyword: 'atendida' | 'cancelada' | 'no_asistio',
    comment?: string | null,
  ) => {
    setIsUpdatingStatus(true)
    try {
      const statuses = await fetchStatusAppointments()
      const targetId = findStatusId(statuses, statusKeyword)
      if (!targetId) {
        showToast(`No se encontró el estado ${statusKeyword.toUpperCase()} en el catálogo.`)
        return
      }

      await updateAppointmentStatus(appointmentId, {
        statusId: targetId,
        comment: comment || null,
      })

      showToast(`Estado de la cita actualizado a ${statusKeyword.toUpperCase()}.`)
      await loadHome()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el estado de la cita'
      showToast(msg)
      throw err
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAttendAndRegister = (appointment: CitaActionTarget) => {
    setSelectedAppointment(appointment)
    setIsActionModalOpen(false)
    setIsRegistrarOpen(true)
  }

  const handleViewHistoria = async (petId: string) => {
    try {
      const data = await fetchHistoriaClinica(petId)
      if (!data) {
        showToast('No se encontró historia clínica para esta mascota')
        return
      }
      setHistoriaModalTarget(data)
      setIsHistoriaModalOpen(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar la historia clínica'
      showToast(msg)
    }
  }

  const handleRegistrationSuccess = async (result: {
    recordId: string
    petId: string
    appointmentId: string
  }) => {
    setIsRegistrarOpen(false)
    showToast('¡Consulta médica registrada con éxito!')
    await loadHome()

    if (result.petId) {
      try {
        const data = await fetchHistoriaClinica(result.petId)
        if (data) {
          setHistoriaModalTarget(data)
          setIsHistoriaModalOpen(true)
        }
      } catch {
        // Silently handle
      }
    }
  }

  const notifications = useMemo(
    () => rawNotifications.map(mapVetNotification),
    [rawNotifications],
  )

  const handleMarkNotificationRead = useCallback(
    async (id: string) => {
      const target = rawNotifications.find((n) => n.id === id)
      if (!target) return
      try {
        await markVetNotificationAsRead(target)
        setRawNotifications((current) =>
          current.map((n) => (n.id === id ? { ...n, status: 'Leída' } : n)),
        )
        setUnreadNotificationsCount((current) => Math.max(0, current - 1))
      } catch {
        // Silencioso: marcar como leída es una acción secundaria, no bloquea la vista.
      }
    },
    [rawNotifications],
  )

  return {
    dashboard,
    grantedPermissions,
    notifications,
    onMarkNotificationRead: handleMarkNotificationRead,
    unreadNotificationsCount,
    isLoading,
    error,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    activeRoute,
    handleNavigate,
    activeNotification,
    showToast,
    selectedAppointment,
    isActionModalOpen,
    isRegistrarOpen,
    historiaModalTarget,
    isHistoriaModalOpen,
    isUpdatingStatus,
    handleViewFullAgenda,
    handleAttendNow,
    handleViewAppointment,
    handleMoreActions,
    handleCloseActionModal,
    handleCloseRegistrar,
    handleCloseHistoria,
    handleUpdateStatus,
    handleAttendAndRegister,
    handleViewHistoria,
    handleRegistrationSuccess,
    reloadHome: loadHome,
  }
}

