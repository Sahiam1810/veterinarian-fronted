import { apiClient } from '@/services'
import type { RecepDayAppointment, RecepHomeDashboard, RecepAppointmentStatus } from '../types'
import {
  fetchMyModulePermissions,
  filterNavKeysByModuleView,
  RECEP_ALWAYS_VISIBLE_NAV,
  RECEP_MODULE_TO_NAV,
} from '@/modules/auth'
import { RECEP_DEFAULT_PERMISSIONS } from '@/global/navigation'
import type { CurrentProfileResponse } from '@/modules/auth/types'
import type { ApiAppointmentResponse } from '@/modules/superadmin/services/superAdminAppointmentsService'
import type { ApiClientPetResponse } from '@/modules/superadmin/services/superAdminClientsPetsService'
import type { ApiPetResponse } from '@/modules/superadmin/services/superAdminPetsService'
import type { ApiClientResponse } from '@/modules/superadmin/services/superAdminClientsService'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'
import type { ApiServiceResponse } from '@/modules/superadmin/services/superAdminVetServicesService'
import type { ApiVeterinarianResponse } from '@/modules/superadmin/services/superAdminVeterinariansService'
import type { ApiStatusAppointmentResponse, ApiSpeciesResponse, ApiRaceResponse } from '@/modules/superadmin/services/superAdminCatalogService'

function formatTodayDateLabel(): string {
  const now = new Date()
  const formatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatTimeString(isoString: string): string {
  try {
    const d = new Date(isoString)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return '09:00'
  }
}

function mapStatus(rawStatus?: string | null): RecepAppointmentStatus {
  if (!rawStatus) return 'AGENDADO'
  const normalized = rawStatus.trim().toUpperCase()
  if (normalized.includes('CONSULT') || normalized.includes('CURSO') || normalized.includes('PROCES')) {
    return 'EN CONSULTORIO'
  }
  if (normalized.includes('ATEND') || normalized.includes('COMPLET') || normalized.includes('FINALIZ')) {
    return 'ATENDIDO'
  }
  if (normalized.includes('CANCEL') || normalized.includes('ANUL')) {
    return 'CANCELADO'
  }
  return 'AGENDADO'
}

// Carga el resumen de recepción conectando perfil y métricas reales del día
export async function fetchRecepHomeDashboard(): Promise<RecepHomeDashboard> {
  const [
    profileRes,
    aptsRes,
    cpRes,
    petsRes,
    clientsRes,
    usersRes,
    servicesRes,
    vetsRes,
    statusesRes,
    speciesRes,
    racesRes,
  ] = await Promise.allSettled([
    apiClient.get<CurrentProfileResponse>('/api/auth/me'),
    apiClient.get<ApiAppointmentResponse[]>('/api/Appointments'),
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<ApiPetResponse[]>('/api/Pets'),
    apiClient.get<ApiClientResponse[]>('/api/Clients'),
    apiClient.get<ApiUserResponse[]>('/api/Users'),
    apiClient.get<ApiServiceResponse[]>('/api/Services'),
    apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians'),
    apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments'),
    apiClient.get<ApiSpeciesResponse[]>('/api/Species'),
    apiClient.get<ApiRaceResponse[]>('/api/Races'),
  ])

  const profile = profileRes.status === 'fulfilled' ? profileRes.value : null
  const appointments = aptsRes.status === 'fulfilled' ? aptsRes.value : []
  const clientPets = cpRes.status === 'fulfilled' ? cpRes.value : []
  const pets = petsRes.status === 'fulfilled' ? petsRes.value : []
  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const users = usersRes.status === 'fulfilled' ? usersRes.value : []
  const services = servicesRes.status === 'fulfilled' ? servicesRes.value : []
  const vets = vetsRes.status === 'fulfilled' ? vetsRes.value : []
  const statuses = statusesRes.status === 'fulfilled' ? statusesRes.value : []
  const species = speciesRes.status === 'fulfilled' ? speciesRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []

  const cpMap = new Map(clientPets.map((cp) => [cp.id.toLowerCase(), cp]))
  const petsMap = new Map(pets.map((p) => [p.id.toLowerCase(), p]))
  const clientsMap = new Map(clients.map((c) => [c.id.toLowerCase(), c]))
  const usersMap = new Map(users.map((u) => [u.id.toLowerCase(), u]))
  const servicesMap = new Map(services.map((s) => [s.id.toLowerCase(), s.name]))
  const vetsMap = new Map(vets.map((v) => [v.id.toLowerCase(), v.userFullName || 'Veterinario']))
  const statusesMap = new Map(statuses.map((st) => [st.id.toLowerCase(), st.name]))
  const speciesMap = new Map(species.map((s) => [s.id.toLowerCase(), s.name]))
  const racesMap = new Map(races.map((r) => [r.id.toLowerCase(), r.name]))

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const now = new Date()
  const todayPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // Filtrar citas del día (o si no hay hoy, mostrar las citas más recientes para no dejar la vista vacía)
  let todayAppointments = appointments.filter((apt) => apt.scheduledStart?.startsWith(todayPrefix))
  if (todayAppointments.length === 0 && appointments.length > 0) {
    todayAppointments = appointments.slice(0, 8)
  }

  let pendientes = 0
  let mascotasAtendidas = 0
  let canceladas = 0

  const mappedAppointments: RecepDayAppointment[] = todayAppointments.map((apt) => {
    const cp = cpMap.get(apt.clientPetId?.toLowerCase())
    const pet = cp ? petsMap.get(cp.petId?.toLowerCase()) : undefined
    const client = cp ? clientsMap.get(cp.clientId?.toLowerCase()) : undefined
    const ownerUser = client ? usersMap.get(client.userId?.toLowerCase()) : undefined

    const petName = pet?.name || 'Paciente'
    const speciesName = pet ? speciesMap.get(pet.speciesId?.toLowerCase()) || 'Mascota' : 'Mascota'
    const raceName = pet ? racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo' : 'Mestizo'
    const ownerName = ownerUser?.fullName || 'Propietario'
    const professionalName = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Dr. Roberto Silva'
    const service = apt.serviceName || servicesMap.get(apt.serviceId?.toLowerCase()) || 'Consulta General'
    const statusName = apt.statusName || statusesMap.get(apt.statusId?.toLowerCase())
    const status = mapStatus(statusName)

    if (status === 'AGENDADO') pendientes++
    else if (status === 'ATENDIDO' || status === 'EN CONSULTORIO') mascotasAtendidas++
    else if (status === 'CANCELADO') canceladas++

    return {
      id: apt.id,
      time: formatTimeString(apt.scheduledStart),
      petName,
      petPhotoUrl: null,
      speciesBreed: `${speciesName} / ${raceName}`,
      ownerName,
      professionalName,
      service,
      status,
    }
  })

  return {
    profile: {
      displayName: profile?.fullName || 'Carlos Méndez',
      workstationLabel: 'Recepción Principal',
    },
    formattedDate: formatTodayDateLabel(),
    stats: {
      citasDelDia: mappedAppointments.length,
      pendientes,
      mascotasAtendidas,
      canceladas,
    },
    appointments: mappedAppointments,
    totalAppointmentsToday: mappedAppointments.length,
  }
}

// Permisos de menú del recepcionista desde GET /api/auth/permissions
export async function fetchRecepNavPermissions() {
  try {
    const permissions = await fetchMyModulePermissions()
    return filterNavKeysByModuleView(
      RECEP_DEFAULT_PERMISSIONS,
      permissions,
      RECEP_MODULE_TO_NAV,
      RECEP_ALWAYS_VISIBLE_NAV,
    )
  } catch (err) {
    console.error('No se pudieron cargar permisos de navegación del recepcionista', err)
    return RECEP_ALWAYS_VISIBLE_NAV.filter((key) =>
      RECEP_DEFAULT_PERMISSIONS.includes(key),
    )
  }
}
