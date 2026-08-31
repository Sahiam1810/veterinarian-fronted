import type {
  ApiAppointment,
  ApiClient,
  ApiClientPet,
  ApiCurrentProfile,
  ApiNamedCatalog,
  ApiPet,
  ApiVeterinarian,
} from '../api/apiTypes'
import type { VetDayAppointment, VetHomeDashboard } from '../types'
import {
  isAttendedStatus,
  isPendingStatus,
  mapAppointmentStatus,
} from './mapAppointmentStatus'

const MAX_HOME_ROWS = 8

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function isScheduledToday(iso: string, now = new Date()): boolean {
  const when = new Date(iso)
  if (Number.isNaN(when.getTime())) return false
  return when >= startOfLocalDay(now) && when <= endOfLocalDay(now)
}

export function formatHomeDate(now = new Date()): string {
  const raw = now.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function formatAppointmentTime(iso: string): string {
  const when = new Date(iso)
  if (Number.isNaN(when.getTime())) return '--:--'
  return when.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function buildSpeciesBreed(
  pet: ApiPet | undefined,
  speciesById: Map<string, string>,
  racesById: Map<string, string>,
): string {
  if (!pet) return 'Sin especificar'
  const species = speciesById.get(pet.speciesId) || 'Especie'
  const race = racesById.get(pet.raceId) || 'Raza'
  return `${species} - ${race}`
}

function resolveOwnerName(
  clientPet: ApiClientPet | undefined,
  clientsById: Map<string, ApiClient>,
): string {
  if (!clientPet) return 'Dueño no disponible'
  const client = clientsById.get(clientPet.clientId)
  if (!client) return 'Dueño no disponible'
  // El endpoint de clientes (Staff) no expone el nombre; usamos la identificación.
  return client.identificationNumber
    ? `Cliente ${client.identificationNumber}`
    : 'Dueño no disponible'
}

export function findVeterinarianForProfile(
  vets: ApiVeterinarian[],
  profile: ApiCurrentProfile,
): ApiVeterinarian | undefined {
  const personId = profile.personId?.toLowerCase()
  const accountId = profile.userAccountId?.toLowerCase()
  return vets.find((vet) => {
    const userId = vet.userId?.toLowerCase()
    return userId === personId || userId === accountId
  })
}

export function buildVetHomeDashboard(input: {
  profile: ApiCurrentProfile
  veterinarian?: ApiVeterinarian
  appointments: ApiAppointment[]
  pets: ApiPet[]
  clients: ApiClient[]
  clientPets: ApiClientPet[]
  species: ApiNamedCatalog[]
  races: ApiNamedCatalog[]
  now?: Date
}): VetHomeDashboard {
  const now = input.now || new Date()
  const petsById = new Map(input.pets.map((pet) => [pet.id.toLowerCase(), pet]))
  const clientsById = new Map(input.clients.map((client) => [client.id.toLowerCase(), client]))
  const clientPetsById = new Map(
    input.clientPets.map((link) => [link.id.toLowerCase(), link]),
  )
  const speciesById = new Map(input.species.map((item) => [item.id.toLowerCase(), item.name]))
  const racesById = new Map(input.races.map((item) => [item.id.toLowerCase(), item.name]))

  const vetId = input.veterinarian?.id?.toLowerCase()

  const todayAppointments = input.appointments
    .filter((apt) => isScheduledToday(apt.scheduledStart, now))
    .filter((apt) => (vetId ? apt.veterinarianId.toLowerCase() === vetId : false))
    .sort(
      (a, b) =>
        new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime(),
    )

  const mapped: VetDayAppointment[] = todayAppointments.map((apt) => {
    const link = clientPetsById.get(apt.clientPetId.toLowerCase())
    const pet = link ? petsById.get(link.petId.toLowerCase()) : undefined
    const status = mapAppointmentStatus(apt.statusName)

    return {
      id: apt.id,
      time: formatAppointmentTime(apt.scheduledStart),
      petName: pet?.name || 'Mascota',
      petPhotoUrl: null,
      speciesBreed: buildSpeciesBreed(pet, speciesById, racesById),
      ownerName: resolveOwnerName(link, clientsById),
      service: apt.serviceName || 'Servicio',
      status,
    }
  })

  // Resalta la primera cita pendiente del día.
  const highlightIndex = mapped.findIndex((item) => item.status !== 'ATENDIDO')
  if (highlightIndex >= 0) {
    mapped[highlightIndex] = { ...mapped[highlightIndex], isHighlighted: true }
  }

  const atendidas = mapped.filter((item) => isAttendedStatus(item.status)).length
  const pendientes = mapped.filter((item) => isPendingStatus(item.status)).length

  const displayName =
    input.veterinarian?.userFullName || input.profile.fullName || 'Veterinario'

  return {
    profile: {
      displayName,
      titlePrefix: 'Hola,',
    },
    formattedDate: formatHomeDate(now),
    stats: {
      citasHoy: mapped.length,
      pendientes,
      atendidas,
    },
    appointments: mapped.slice(0, MAX_HOME_ROWS),
    totalAppointmentsToday: mapped.length,
  }
}
