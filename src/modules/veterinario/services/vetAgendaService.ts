import { vetApiFetch } from '../api/vetHttp'
import type {
  ApiAppointment,
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

// Carga la agenda del veterinario autenticado (citas + disponibilidad).
export async function fetchVetAgendaWeek(
  params: FetchVetAgendaParams = {
    viewMode: 'semana',
    anchorDate: new Date(),
  },
): Promise<AgendaWeekPayload> {
  const profile = await vetApiFetch<ApiCurrentProfile>('/api/auth/me')
  const veterinarians = await vetApiFetch<ApiVeterinarian[]>('/api/veterinarians')
  const veterinarian = findVeterinarianForProfile(veterinarians, profile)

  if (!veterinarian) {
    return buildVetAgendaPayload({
      viewMode: params.viewMode,
      anchorDate: params.anchorDate,
      appointments: [],
      availabilities: [],
      pets: [],
      clientPets: [],
      species: [],
    })
  }

  const [appointments, availabilitiesRaw, pets, clientPets, species] = await Promise.all([
    vetApiFetch<ApiAppointment[]>('/api/appointments'),
    vetApiFetch<ApiAvailability[]>(
      `/api/availabilities/by-veterinarian/${veterinarian.id}`,
    ).catch(async () => {
      // Fallback si la ruta específica falla: filtrar en cliente.
      const all = await vetApiFetch<ApiAvailability[]>('/api/availabilities')
      return all.filter(
        (item) => item.veterinarianId.toLowerCase() === veterinarian.id.toLowerCase(),
      )
    }),
    vetApiFetch<ApiPet[]>('/api/pets'),
    vetApiFetch<ApiClientPet[]>('/api/clientspets'),
    vetApiFetch<ApiNamedCatalog[]>('/api/species'),
  ])

  const availabilities = availabilitiesRaw

  const mine = appointments.filter(
    (apt) => apt.veterinarianId.toLowerCase() === veterinarian.id.toLowerCase(),
  )

  return buildVetAgendaPayload({
    viewMode: params.viewMode,
    anchorDate: params.anchorDate,
    appointments: mine,
    availabilities,
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

// Catálogo de estados de citas del backend
export async function fetchStatusAppointments(): Promise<ApiStatusAppointment[]> {
  return vetApiFetch<ApiStatusAppointment[]>('/api/statusappointments').catch(async () => {
    return vetApiFetch<ApiStatusAppointment[]>('/api/StatusAppointments').catch(() => [])
  })
}

// Transición de estado canónica de cita (AGENDADA → ATENDIDA | CANCELADA | NO_ASISTIO)
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

// Resuelve el ID del estado en el catálogo ignorando mayúsculas, espacios y acentos
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

