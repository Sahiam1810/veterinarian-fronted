import { useState, useEffect, useCallback } from 'react'
import type { Appointment, DashboardStats } from '../types'
import {
  fetchAppointments,
  fetchVeterinarians,
  fetchPets,
  fetchClientsPets,
  fetchSpecies,
} from '../services'
import {
  buildDashboardStats,
  mapAppointmentToDashboard,
} from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

const ROUTE_NAMES: Record<string, string> = {
  inicio: 'Inicio',
  usuarios: 'Usuarios',
  mascotas: 'Mascotas',
  servicios: 'Servicios',
  veterinarios: 'Veterinarios',
  agenda: 'Agenda',
  reportes: 'Reportes',
  perfil: 'Perfil de Usuario',
}

const EMPTY_STATS: DashboardStats = {
  totalAppointments: 0,
  attendedAppointments: 0,
  attendedPercentage: 0,
  cancelledAppointments: 0,
  activeProfessionals: 0,
  formattedDate: new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
}

// Catálogos opcionales: Auxiliar con Citas/Mascotas.View no siempre tiene Veterinarios.
async function settleList<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 401)) {
      return []
    }
    throw err
  }
}

export function useSuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState('inicio')
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((current) => (current === message ? null : current))
    }, 3000)
  }, [])

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const [apiAppointments, veterinarians, pets, clientsPets, species] = await Promise.all([
        fetchAppointments(),
        settleList(fetchVeterinarians()),
        settleList(fetchPets()),
        settleList(fetchClientsPets()),
        settleList(fetchSpecies()),
      ])

      const speciesById = new Map(species.map((s) => [s.id, s.name]))
      const petsById = new Map(pets.map((p) => [p.id, p]))
      const vetsById = new Map(veterinarians.map((v) => [v.id, v]))

      const todayKey = new Date().toISOString().slice(0, 10)
      const todayAppointments = apiAppointments
        .filter((apt) => apt.scheduledStart.slice(0, 10) === todayKey)
        .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))

      const mapped = todayAppointments.map((apt) => {
        const clientPet = clientsPets.find((cp) => cp.id === apt.clientPetId)
        const pet = clientPet ? petsById.get(clientPet.petId) : undefined
        const speciesName = pet ? speciesById.get(pet.speciesId) : undefined
        const vet = vetsById.get(apt.veterinarianId)

        return mapAppointmentToDashboard(apt, {
          petName: pet?.name,
          species: speciesName,
          professionalName: vet?.userFullName ?? undefined,
        })
      })

      // Sin Veterinarios.View: contar profesionales distintos desde las citas del día
      const activeProfessionals =
        veterinarians.length > 0
          ? veterinarians.length
          : new Set(todayAppointments.map((a) => a.veterinarianId.toLowerCase())).size

      setAppointments(mapped)
      setStats(buildDashboardStats(todayAppointments, activeProfessionals))
    } catch (err) {
      const raw = err instanceof ApiError ? err.message : 'No se pudo cargar el dashboard.'
      // 403 de citas sí es un problema real para el resumen; no lo silenciamos.
      const message =
        raw === 'Unexpected error'
          ? 'Error del servidor al cargar el resumen. Si persiste, reinicia el API.'
          : raw === 'Forbidden' || raw === 'No tienes permisos para realizar esta acción.'
            ? 'No tienes permiso para ver el resumen de citas.'
            : raw
      showToast(message)
      setAppointments([])
      setStats(EMPTY_STATS)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const handleNavigate = (routeId: string) => {
    setActiveRoute(routeId)
    if (routeId === 'logout') {
      showToast('Cerrando sesión...')
    } else {
      showToast(`Navegando a: ${ROUTE_NAMES[routeId] || routeId}`)
    }
  }

  const handleCreateUser = () => {
    showToast('Abrir modal: Crear nuevo usuario clínico')
  }

  const handleRegisterOwner = () => {
    showToast('Abrir formulario: Registrar nuevo dueño')
  }

  const handleRegisterPet = () => {
    showToast('Abrir formulario: Registrar nueva mascota')
  }

  const handleScheduleAppointment = () => {
    showToast('Abrir calendario: Agendar nueva cita')
  }

  const handleViewAllAppointments = () => {
    showToast('Navegando a la lista completa de citas...')
  }

  const handleSelectAppointment = (appointment: Appointment) => {
    showToast(`Cita seleccionada: ${appointment.petName} (${appointment.time})`)
  }

  return {
    stats,
    appointments,
    setAppointments,
    isLoading,
    reload: loadDashboard,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    activeRoute,
    handleNavigate,
    activeNotification,
    handleCreateUser,
    handleRegisterOwner,
    handleRegisterPet,
    handleScheduleAppointment,
    handleViewAllAppointments,
    handleSelectAppointment,
  }
}
