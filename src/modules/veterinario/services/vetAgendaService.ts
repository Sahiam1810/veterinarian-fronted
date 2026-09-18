import { vetApiFetch } from '../api/vetHttp'
import { fetchMyVetAppointments } from '../api/fetchMyVetAppointments'
import type {
  ApiAvailability,
  ApiClientPet,
  ApiCurrentProfile,
  ApiNamedCatalog,
  ApiPet,
  ApiVeterinarian,
} from '../api/apiTypes'
import type { AgendaViewMode, AgendaWeekPayload } from '../types'
import { findVeterinarianForProfile } from '../utils/buildVetHomeDashboard'
import { buildVetAgendaPayload } from '../utils/buildVetAgenda'

export interface FetchVetAgendaParams {
  viewMode: AgendaViewMode
  anchorDate: Date
}

async function fetchVetAvailabilities(
  veterinarian: ApiVeterinarian | undefined,
): Promise<ApiAvailability[]> {
  if (!veterinarian) return []

  return vetApiFetch<ApiAvailability[]>(
    `/api/availabilities/by-veterinarian/${veterinarian.id}`,
  ).catch(async () => {
    try {
      const all = await vetApiFetch<ApiAvailability[]>('/api/availabilities')
      return all.filter(
        (item) => item.veterinarianId.toLowerCase() === veterinarian.id.toLowerCase(),
      )
    } catch {
      return [] as ApiAvailability[]
    }
  })
}

// Carga la agenda del veterinario autenticado. Las citas vienen filtradas por
// backend en /api/appointments/me; Veterinarios solo se usa para disponibilidad.
export async function fetchVetAgendaWeek(
  params: FetchVetAgendaParams = {
    viewMode: 'semana',
    anchorDate: new Date(),
  },
): Promise<AgendaWeekPayload> {
  const profile = await vetApiFetch<ApiCurrentProfile>('/api/auth/me')
  const veterinarians = await vetApiFetch<ApiVeterinarian[]>('/api/veterinarians').catch(
    () => [] as ApiVeterinarian[],
  )
  const veterinarian = findVeterinarianForProfile(veterinarians, profile)

  const [appointments, availabilitiesRaw, pets, clientPets, species] = await Promise.all([
    fetchMyVetAppointments(),
    fetchVetAvailabilities(veterinarian),
    vetApiFetch<ApiPet[]>('/api/pets').catch(() => [] as ApiPet[]),
    vetApiFetch<ApiClientPet[]>('/api/clientspets').catch(() => [] as ApiClientPet[]),
    vetApiFetch<ApiNamedCatalog[]>('/api/species').catch(() => [] as ApiNamedCatalog[]),
  ])

  return buildVetAgendaPayload({
    viewMode: params.viewMode,
    anchorDate: params.anchorDate,
    appointments,
    availabilities: availabilitiesRaw,
    pets,
    clientPets,
    species,
  })
}

export interface ApiStatusAppointment {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export interface ApiUpdateAppointmentStatusRequest {
  statusId: string
  comment?: string | null
}

export async function fetchStatusAppointments(): Promise<ApiStatusAppointment[]> {
  return vetApiFetch<ApiStatusAppointment[]>('/api/statusappointments').catch(async () => {
    return vetApiFetch<ApiStatusAppointment[]>('/api/StatusAppointments').catch(() => [])
  })
}

export async function updateAppointmentStatus(
  appointmentId: string,
  data: ApiUpdateAppointmentStatusRequest,
): Promise<void> {
  return vetApiFetch<void>(`/api/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }).catch(async () => {
    return vetApiFetch<void>(`/api/Appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  })
}

export function findStatusId(
  statuses: { id: string; name: string }[],
  ...keywords: string[]
): string | undefined {
  const normalizedKeywords = keywords.map((k) =>
    k
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_\s-]+/g, ''),
  )

  const match = statuses.find((s) => {
    const normName = s.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_\s-]+/g, '')

    return normalizedKeywords.some((k) => normName.includes(k) || k.includes(normName))
  })

  return match?.id
}
