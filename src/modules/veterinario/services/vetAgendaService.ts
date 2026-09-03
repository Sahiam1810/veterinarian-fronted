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
