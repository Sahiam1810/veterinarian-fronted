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

// S43: endpoint dedicado (dueño de la notificación) — ya no depende del
// permiso "Notificaciones.Edit" que ningún rol tiene.
export async function markVetNotificationAsRead(notification: ApiNotification): Promise<void> {
  await vetApiFetch<void>(`/api/notifications/${notification.id}/read`, {
    method: 'PATCH',
  })
}

// Carga el inicio del veterinario desde endpoints Staff existentes.
export async function fetchVetHomeDashboard(): Promise<VetHomeDashboard> {
  const result = await fetchVetHomeBundle()
  return result.dashboard
}

export async function fetchVetHomeBundle(): Promise<VetHomeLoadResult> {
  const profile = await vetApiFetch<ApiCurrentProfile>('/api/auth/me')

  // Solo "appointments" es indispensable para Inicio. Los demás son catálogos
  // de apoyo (nombre de especie/raza, dueño, veterinario) usados para armar
  // etiquetas: si el SuperAdmin le quita a este usuario el permiso de Ver de
  // Especies y Razas, Clientes o Profesionales, esas etiquetas quedan vacías
  // en vez de tumbar toda la pantalla de Inicio (antes usaba Promise.all).
  const appointments = await vetApiFetch<ApiAppointment[]>('/api/appointments')

  const [
    veterinarians,
    pets,
    clients,
    clientPets,
    species,
    races,
    notifications,
  ] = await Promise.all([
    vetApiFetch<ApiVeterinarian[]>('/api/veterinarians').catch(() => [] as ApiVeterinarian[]),
    vetApiFetch<ApiPet[]>('/api/pets').catch(() => [] as ApiPet[]),
    vetApiFetch<ApiClient[]>('/api/clients').catch(() => [] as ApiClient[]),
    vetApiFetch<ApiClientPet[]>('/api/clientspets').catch(() => [] as ApiClientPet[]),
    vetApiFetch<ApiNamedCatalog[]>('/api/species').catch(() => [] as ApiNamedCatalog[]),
    vetApiFetch<ApiNamedCatalog[]>('/api/races').catch(() => [] as ApiNamedCatalog[]),
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
