import { apiClient } from '@/services'
import type {
  RecepDuenoDetail,
  RecepDuenoListItem,
  RecepDuenoPetSummary,
  RecepDuenosDirectoryPayload,
} from '../types'
import type { ApiClientResponse, ApiCreateClientRequest, ApiUpdateClientRequest } from '@/modules/superadmin/services/superAdminClientsService'
import type { ApiClientPetResponse } from '@/modules/superadmin/services/superAdminClientsPetsService'
import type { ApiPetResponse } from '@/modules/superadmin/services/superAdminPetsService'
import type { ApiSpeciesResponse, ApiRaceResponse } from '@/modules/superadmin/services/superAdminCatalogService'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'

function formatDateLabel(dateStr?: string | null): string {
  if (!dateStr) return 'Fecha no registrada'
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

// Obtiene el directorio de dueños consolidando clientes, usuarios y mascotas desde el backend
export async function fetchRecepDuenosDirectory(): Promise<RecepDuenosDirectoryPayload> {
  const [clientsRes, usersRes, cpRes, petsRes, speciesRes, racesRes] = await Promise.allSettled([
    apiClient.get<ApiClientResponse[]>('/api/Clients'),
    apiClient.get<ApiUserResponse[]>('/api/Users'),
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<ApiPetResponse[]>('/api/Pets'),
    apiClient.get<ApiSpeciesResponse[]>('/api/Species'),
    apiClient.get<ApiRaceResponse[]>('/api/Races'),
  ])

  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const users = usersRes.status === 'fulfilled' ? usersRes.value : []
  const clientPets = cpRes.status === 'fulfilled' ? cpRes.value : []
  const pets = petsRes.status === 'fulfilled' ? petsRes.value : []
  const species = speciesRes.status === 'fulfilled' ? speciesRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []

  const usersMap = new Map(users.map((u) => [u.id.toLowerCase(), u]))
  const petsMap = new Map(pets.map((p) => [p.id.toLowerCase(), p]))
  const speciesMap = new Map(species.map((s) => [s.id.toLowerCase(), s.name]))
  const racesMap = new Map(races.map((r) => [r.id.toLowerCase(), r.name]))

  // Agrupar mascotas por cliente
  const petsByClientId = new Map<string, RecepDuenoPetSummary[]>()
  clientPets.forEach((cp) => {
    const clientId = cp.clientId?.toLowerCase()
    if (!clientId) return

    const pet = petsMap.get(cp.petId?.toLowerCase())
    if (!pet) return

    const speciesName = speciesMap.get(pet.speciesId?.toLowerCase()) || 'Mascota'
    const raceName = racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo'

    const petSummary: RecepDuenoPetSummary = {
      id: pet.id,
      name: pet.name,
      species: speciesName,
      breed: raceName,
    }

    const currentList = petsByClientId.get(clientId) || []
    currentList.push(petSummary)
    petsByClientId.set(clientId, currentList)
  })

  const items: RecepDuenoListItem[] = []
  const detailsById: Record<string, RecepDuenoDetail> = {}

  clients.forEach((client, index) => {
    const user = usersMap.get(client.userId?.toLowerCase())
    const clientPetSummaries = petsByClientId.get(client.id.toLowerCase()) || []

    const fullName = user?.fullName || 'Cliente Sin Nombre'
    const documentId = client.identificationNumber || `DOC-${index + 1}`
    const email = user?.email || 'sin-correo@huellitas.com'
    const phone = '+57 300 000 0000'
    const estado = user ? (user.isActive ? 'Activo' : 'Inactivo') : 'Activo'
    const code = String(index + 1).padStart(3, '0')

    const listItem: RecepDuenoListItem = {
      id: client.id,
      code,
      fullName,
      documentId,
      phone,
      email,
      petsCount: clientPetSummaries.length,
      estado,
    }

    items.push(listItem)

    detailsById[client.id] = {
      ...listItem,
      address: client.address || 'Dirección no registrada',
      city: 'Clínica Huellitas',
      registrationDateLabel: formatDateLabel(client.registrationDate || client.createdAt),
      pets: clientPetSummaries,
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

// Crear un nuevo cliente en el sistema
export async function createRecepClient(data: ApiCreateClientRequest): Promise<{ id: string }> {
  return apiClient.post<{ id: string }>('/api/Clients', data)
}

// Actualizar información del cliente
export async function updateRecepClient(id: string, data: ApiUpdateClientRequest): Promise<void> {
  return apiClient.put<void>(`/api/Clients/${id}`, data)
}
