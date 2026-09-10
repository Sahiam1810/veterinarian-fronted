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
import type { NotificacionSuperAdmin } from '@/modules/superadmin/types'
import { formatDateEs } from '@/modules/superadmin/utils/superAdminApiMappers'
import {
  buildVetHomeDashboard,
  findVeterinarianForProfile,
} from '../utils/buildVetHomeDashboard'

export interface VetHomeLoadResult {
  dashboard: VetHomeDashboard
  notifications: ApiNotification[]
  unreadNotificationsCount: number
}

function isUnreadStatus(status?: string | null): boolean {
  const normalized = (status || '').toLowerCase()
  return status ? normalized !== 'leída' && normalized !== 'leida' && normalized !== 'read' : true
}

function countUnreadNotifications(items: ApiNotification[]): number {
  return items.filter((item) => isUnreadStatus(item.status)).length
}

// Mapea la notificación cruda del API al mismo modelo que usa la campana del panel
// (compartido con SuperAdmin/Recepcionista) para poder reusar el mismo componente.
export function mapVetNotification(notification: ApiNotification): NotificacionSuperAdmin {
  return {
    id: notification.id,
    message: notification.message || 'Notificación del sistema.',
    dateLabel: formatDateEs(notification.sentAt),
    type: notification.type || 'General',
    isRead: !isUnreadStatus(notification.status),
    appointmentId: notification.appointmentId,
  }
}

// Marca una notificación como leída (mismo contrato que usa el panel SuperAdmin).
export async function markVetNotificationAsRead(notification: ApiNotification): Promise<void> {
  await vetApiFetch<void>(`/api/notifications/${notification.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      userId: notification.userId,
      appointmentId: notification.appointmentId,
      message: notification.message,
      sentAt: notification.sentAt,
      status: 'Leída',
      type: notification.type,
    }),
  })
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

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
  )

  return {
    dashboard,
    notifications: sortedNotifications,
    unreadNotificationsCount: countUnreadNotifications(notifications),
  }
}
