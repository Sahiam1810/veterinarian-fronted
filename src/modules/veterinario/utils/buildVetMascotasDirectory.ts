import type {
  ApiAppointment,
  ApiClient,
  ApiClientPet,
  ApiNamedCatalog,
  ApiPet,
} from '../api/apiTypes'
import type {
  MascotaAtencionStatus,
  MascotaDetail,
  MascotaListItem,
  MascotasDirectoryPayload,
} from '../types'
import { mapAgendaEventStatus } from './mapAgendaEventStatus'

function formatSexLabel(gender: string): string {
  const value = gender.trim().toUpperCase()
  if (value === 'M' || value.startsWith('MACH')) return 'Macho'
  if (value === 'F' || value.startsWith('HEMB')) return 'Hembra'
  return gender.trim() || '—'
}

function formatAgeLabel(age: number): string {
  if (!Number.isFinite(age) || age < 0) return '—'
  if (age === 1) return '1 año'
  return `${age} años`
}

function formatWeightLabel(weight: number): string {
  if (!Number.isFinite(weight)) return '—'
  return `${weight} kg`
}

function formatVisitLabel(iso?: string | null): string {
  if (!iso) return 'Sin visitas'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Sin visitas'
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function patientCodeFromId(id: string): string {
  return `PAC-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

function mapAtencionStatus(statusName?: string | null): MascotaAtencionStatus {
  const agendaStatus = mapAgendaEventStatus(statusName)
  if (agendaStatus === 'ATENDIDA') return 'Atendido'
  if (agendaStatus === 'EN_ESPERA') return 'En espera'
  return 'Agendado'
}

function pickOwnerLink(
  links: ApiClientPet[],
): ApiClientPet | undefined {
  return links.find((link) => link.isPrimaryOwner) || links[0]
}

function allergyFromObservations(observations?: string | null): string | null {
  if (!observations?.trim()) return null
  if (/alerg/i.test(observations)) return observations.trim()
  return null
}

export function buildVetMascotasDirectory(input: {
  pets: ApiPet[]
  clients: ApiClient[]
  clientPets: ApiClientPet[]
  species: ApiNamedCatalog[]
  races: ApiNamedCatalog[]
  appointments: ApiAppointment[]
  page?: number
  pageSize?: number
}): MascotasDirectoryPayload {
  const page = Math.max(1, input.page || 1)
  const pageSize = Math.max(1, input.pageSize || 8)

  const speciesById = new Map(input.species.map((item) => [item.id.toLowerCase(), item.name]))
  const racesById = new Map(input.races.map((item) => [item.id.toLowerCase(), item.name]))
  const clientsById = new Map(input.clients.map((item) => [item.id.toLowerCase(), item]))

  const linksByPetId = new Map<string, ApiClientPet[]>()
  for (const link of input.clientPets) {
    const key = link.petId.toLowerCase()
    const list = linksByPetId.get(key) || []
    list.push(link)
    linksByPetId.set(key, list)
  }

  // Última cita por clientPetId.
  const latestByClientPet = new Map<string, ApiAppointment>()
  for (const apt of input.appointments) {
    const key = apt.clientPetId.toLowerCase()
    const prev = latestByClientPet.get(key)
    if (!prev || new Date(apt.scheduledStart) > new Date(prev.scheduledStart)) {
      latestByClientPet.set(key, apt)
    }
  }

  const sortedPets = [...input.pets].sort((a, b) =>
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
  )

  const detailsById: Record<string, MascotaDetail> = {}
  const items: MascotaListItem[] = sortedPets.map((pet) => {
    const links = linksByPetId.get(pet.id.toLowerCase()) || []
    const ownerLink = pickOwnerLink(links)
    const client = ownerLink ? clientsById.get(ownerLink.clientId.toLowerCase()) : undefined

    let latest: ApiAppointment | undefined
    for (const link of links) {
      const candidate = latestByClientPet.get(link.id.toLowerCase())
      if (!candidate) continue
      if (!latest || new Date(candidate.scheduledStart) > new Date(latest.scheduledStart)) {
        latest = candidate
      }
    }

    const species = speciesById.get(pet.speciesId.toLowerCase()) || 'Especie'
    const breed = racesById.get(pet.raceId.toLowerCase()) || 'Raza'
    const listItem: MascotaListItem = {
      id: pet.id,
      name: pet.name,
      photoUrl: null,
      species,
      breed,
      ageLabel: formatAgeLabel(pet.age),
      sexLabel: formatSexLabel(pet.gender),
      ownerName: client?.identificationNumber
        ? `Cliente ${client.identificationNumber}`
        : 'Dueño no disponible',
      lastVisitLabel: formatVisitLabel(latest?.scheduledStart),
    }

    detailsById[pet.id] = {
      ...listItem,
      patientCode: patientCodeFromId(pet.id),
      status: mapAtencionStatus(latest?.statusName),
      weightLabel: formatWeightLabel(pet.weight),
      // El API de pets no expone microchip; se documenta como no registrado.
      microchip: 'No registrado',
      ownerPhone: client?.address?.trim() || 'Sin teléfono en ficha',
      allergyAlert: allergyFromObservations(pet.observations),
    }

    return listItem
  })

  const totalCount = items.length
  const startIndex = (page - 1) * pageSize
  const pageItems = items.slice(startIndex, startIndex + pageSize)
  const pageStart = totalCount === 0 ? 0 : startIndex + 1
  const pageEnd = Math.min(startIndex + pageSize, totalCount)

  const speciesOptions = [
    ...new Set(items.map((item) => item.species).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'es'))

  return {
    items: pageItems,
    detailsById,
    totalCount,
    pageStart,
    pageEnd,
    speciesOptions,
  }
}

// Construye el directorio completo (sin paginar) para filtrar en el cliente.
export function buildVetMascotasDirectoryAll(input: {
  pets: ApiPet[]
  clients: ApiClient[]
  clientPets: ApiClientPet[]
  species: ApiNamedCatalog[]
  races: ApiNamedCatalog[]
  appointments: ApiAppointment[]
}): MascotasDirectoryPayload {
  return buildVetMascotasDirectory({ ...input, page: 1, pageSize: Math.max(input.pets.length, 1) })
}
