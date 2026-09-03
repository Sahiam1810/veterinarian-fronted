import { vetApiFetch } from '../api/vetHttp'
import type {
  ApiAppointment,
  ApiClient,
  ApiClientPet,
  ApiCurrentProfile,
  ApiNamedCatalog,
  ApiNotification,
  ApiPet,
  ApiVeterinarian,
} from '../api/apiTypes'
import type { VetHomeDashboard } from '../types'
import {
  buildVetHomeDashboard,
  findVeterinarianForProfile,
} from '../utils/buildVetHomeDashboard'

export interface VetHomeLoadResult {
  dashboard: VetHomeDashboard
  unreadNotificationsCount: number
}

function countUnreadNotifications(items: ApiNotification[]): number {
  return items.filter((item) => {
    const status = (item.status || '').toLowerCase()
    return status === 'unread' || status === 'pendiente' || status === 'nueva' || status === 'new'
  }).length
}

// Carga el inicio del veterinario desde endpoints Staff existentes.
export async function fetchVetHomeDashboard(): Promise<VetHomeDashboard> {
  const result = await fetchVetHomeBundle()
  return result.dashboard
}

export async function fetchVetHomeBundle(): Promise<VetHomeLoadResult> {
  const profile = await vetApiFetch<ApiCurrentProfile>('/api/auth/me')

  const [
    veterinarians,
    appointments,
    pets,
    clients,
    clientPets,
    species,
    races,
    notifications,
  ] = await Promise.all([
    vetApiFetch<ApiVeterinarian[]>('/api/veterinarians'),
    vetApiFetch<ApiAppointment[]>('/api/appointments'),
    vetApiFetch<ApiPet[]>('/api/pets'),
    vetApiFetch<ApiClient[]>('/api/clients'),
    vetApiFetch<ApiClientPet[]>('/api/clientspets'),
    vetApiFetch<ApiNamedCatalog[]>('/api/species'),
    vetApiFetch<ApiNamedCatalog[]>('/api/races'),
    vetApiFetch<ApiNotification[]>(`/api/notifications/user/${profile.personId}`).catch(
      () => [] as ApiNotification[],
    ),
  ])

  const veterinarian = findVeterinarianForProfile(veterinarians, profile)

  const dashboard = buildVetHomeDashboard({
    profile,
    veterinarian,
    appointments,
    pets,
    clients,
    clientPets,
    species,
    races,
  })

  return {
    dashboard,
    unreadNotificationsCount: countUnreadNotifications(notifications),
  }
}
