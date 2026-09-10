import { apiClient } from '../../../services/apiClient.ts'
import type {
  RecepMascotaDetail,
  RecepMascotaListItem,
  RecepMascotasDirectoryPayload,

} from '../types/index.ts'
import type { ApiPetResponse, ApiCreatePetRequest, ApiUpdatePetRequest } from '../../superadmin/services/superAdminPetsService.ts'
import type { ApiSpeciesResponse, ApiRaceResponse } from '../../superadmin/services/superAdminCatalogService.ts'
import type { ApiClientPetResponse, ApiCreateClientPetResponse } from '../../superadmin/services/superAdminClientsPetsService.ts'
import type { ApiClientResponse } from '../../superadmin/services/superAdminClientsService.ts'
import type { ApiUserResponse } from '../../superadmin/services/superAdminUserService.ts'
import type { ApiAppointmentResponse } from '../../superadmin/services/superAdminAppointmentsService.ts'


function formatDateLabel(dateStr?: string | null): string {

  if (!dateStr) return 'Sin visitas'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateStr
  }
}

// Obtiene el directorio consolidado de mascotas conectando Pets, Species, Races, Clients y Appointments
export async function fetchRecepMascotasDirectory(): Promise<RecepMascotasDirectoryPayload> {
  const [petsRes, speciesRes, racesRes, cpRes, clientsRes, aptsRes] = await Promise.allSettled([
    apiClient.get<ApiPetResponse[]>('/api/Pets'),
    apiClient.get<ApiSpeciesResponse[]>('/api/Species'),
    apiClient.get<ApiRaceResponse[]>('/api/Races'),
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<ApiClientResponse[]>('/api/Clients'),
    apiClient.get<ApiAppointmentResponse[]>('/api/Appointments'),
  ])

  const pets = petsRes.status === 'fulfilled' ? petsRes.value : []
  const species = speciesRes.status === 'fulfilled' ? speciesRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []
  const clientPets = cpRes.status === 'fulfilled' ? cpRes.value : []
  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const appointments = aptsRes.status === 'fulfilled' ? aptsRes.value : []

  const speciesMap = new Map(species.map((s) => [s.id.toLowerCase(), s.name]))
  const racesMap = new Map(races.map((r) => [r.id.toLowerCase(), r.name]))
  const clientsMap = new Map(clients.map((c) => [c.id.toLowerCase(), c]))

  // Mapear petId -> clientPet
  const cpByPetId = new Map<string, ApiClientPetResponse>()
  clientPets.forEach((cp) => {
    if (cp.petId) cpByPetId.set(cp.petId.toLowerCase(), cp)
  })

  // Mapear clientPetId -> última cita
  const lastAptByCpId = new Map<string, ApiAppointmentResponse>()
  appointments.forEach((apt) => {
    const cpId = apt.clientPetId?.toLowerCase()
    if (!cpId) return
    const existing = lastAptByCpId.get(cpId)
    if (!existing || new Date(apt.scheduledStart) > new Date(existing.scheduledStart)) {
      lastAptByCpId.set(cpId, apt)
    }
  })

  const items: RecepMascotaListItem[] = []
  const detailsById: Record<string, RecepMascotaDetail> = {}

  pets.forEach((pet) => {
    const speciesName = speciesMap.get(pet.speciesId?.toLowerCase()) || 'Mascota'
    const raceName = racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo'

    const cp = cpByPetId.get(pet.id.toLowerCase())
    const client = cp ? clientsMap.get(cp.clientId?.toLowerCase()) : undefined

    const lastApt = cp ? lastAptByCpId.get(cp.id.toLowerCase()) : undefined
    const lastVisitLabel = lastApt ? formatDateLabel(lastApt.scheduledStart) : 'Sin visitas recientes'

    const ownerName = client?.fullName || 'Dueño no asignado'
    const ageNum = pet.age || 1
    const ageLabel = `${ageNum} ${ageNum === 1 ? 'año' : 'años'}`
    const sexLabel = pet.gender?.toLowerCase().includes('h') || pet.gender === 'Hembra' ? 'Hembra' : 'Macho'
    const patientCode = `PAC-${pet.id.slice(0, 8).toUpperCase()}`

    const listItem: RecepMascotaListItem = {
      id: pet.id,
      name: pet.name || 'Paciente',
      photoUrl: null,
      species: speciesName,
      breed: raceName,
      ageLabel,
      sexLabel,
      ownerName,
      lastVisitLabel,
      estado: 'Activo',
    }

    items.push(listItem)

    detailsById[pet.id] = {
      ...listItem,
      patientCode,
      weightLabel: `${pet.weight || 5} kg`,
      microchip: `981020${pet.id.slice(0, 6).toUpperCase()}`,
      ownerPhone: client?.phoneNumber || '',
      allergyAlert: pet.observations || null,
    }
  })

  return {
    items,
    detailsById,
    totalCount: items.length,
    pageStart: items.length > 0 ? 1 : 0,
    pageEnd: Math.min(items.length, 10),
  }
}

// Crear una nueva mascota
export async function createRecepPet(data: ApiCreatePetRequest): Promise<{ id: string }> {

  return apiClient.post<{ id: string }>('/api/Pets', data)
}

// Actualizar una mascota
export async function updateRecepPet(id: string, data: ApiUpdatePetRequest): Promise<void> {
  return apiClient.put<void>(`/api/Pets/${id}`, data)
}

export interface CreateRecepPetWithClientPayload {
  name: string
  speciesId: string
  raceId: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  clientId?: string
  photoUrl?: string | null
}

// Crea la mascota y opcionalmente la vincula con su dueño en ClientsPets
export async function createRecepPetWithClient(
  payload: CreateRecepPetWithClientPayload,
): Promise<{ id: string }> {
  const { clientId, ...petData } = payload
  const newPet = await createRecepPet({
    name: petData.name.trim(),
    speciesId: petData.speciesId,
    raceId: petData.raceId,
    age: petData.age,
    gender: petData.gender,
    weight: petData.weight,
    observations: petData.observations?.trim() || null,
    photoUrl: petData.photoUrl?.trim() || null,
  })

  if (clientId && newPet?.id) {
    await apiClient.post<ApiCreateClientPetResponse>('/api/ClientsPets', {
      clientId,
      petId: newPet.id,
      isPrimaryOwner: true,
    })
  }

  return newPet
}

export interface RecepMascotaFormCatalogs {
  species: ApiSpeciesResponse[]
  races: ApiRaceResponse[]
  duenos: Array<{ id: string; fullName: string; documentId: string }>
}

// Carga catálogos necesarios para el formulario de nueva mascota
export async function fetchRecepMascotaFormCatalogs(): Promise<RecepMascotaFormCatalogs> {
  const [speciesRes, racesRes, clientsRes, usersRes] = await Promise.allSettled([
    apiClient.get<ApiSpeciesResponse[]>('/api/Species'),
    apiClient.get<ApiRaceResponse[]>('/api/Races'),
    apiClient.get<ApiClientResponse[]>('/api/Clients'),
    apiClient.get<ApiUserResponse[]>('/api/Users'),
  ])

  const species = speciesRes.status === 'fulfilled' ? speciesRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []
  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const users = usersRes.status === 'fulfilled' ? usersRes.value : []

  const usersMap = new Map(users.map((u) => [u.id.toLowerCase(), u]))
  const duenos = clients.map((c) => {
    const user = usersMap.get(c.userId?.toLowerCase())
    return {
      id: c.id,
      fullName: user?.fullName || 'Cliente Sin Nombre',
      documentId: c.identificationNumber || '',
    }
  })

  return { species, races, duenos }
}


