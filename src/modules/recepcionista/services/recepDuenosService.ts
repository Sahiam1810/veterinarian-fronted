import { apiClient } from '@/services'
import type {
  RecepDuenoDetail,
  RecepDuenoFormData,
  RecepDuenoListItem,
  RecepDuenoPetSummary,
  RecepDuenosDirectoryPayload,
} from '../types'
import type { ApiClientResponse, ApiCreateClientRequest, ApiUpdateClientRequest } from '@/modules/superadmin/services/superAdminClientsService'
import { lookupOwner, createOwnerWithoutLogin, updateClient } from '@/modules/superadmin/services/superAdminClientsService'
import { updateUser } from '@/modules/superadmin/services/superAdminUserService'
import { fetchRoles } from '@/modules/superadmin/services/superAdminRolesService'
import type { ApiClientPetResponse } from '@/modules/superadmin/services/superAdminClientsPetsService'
import type { ApiPetResponse } from '@/modules/superadmin/services/superAdminPetsService'
import type { ApiSpeciesResponse, ApiRaceResponse } from '@/modules/superadmin/services/superAdminCatalogService'

export { lookupOwner, createOwnerWithoutLogin, updateClient }

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

// Obtiene el directorio de dueños consolidando clientes y mascotas desde el backend.
// FullName y Email se leen directo desde client.fullName / client.email — campos
// que el backend expone desde la navegación User sin requerir GET /api/Users.
export async function fetchRecepDuenosDirectory(): Promise<RecepDuenosDirectoryPayload> {
  const [clientsRes, cpRes, petsRes, speciesRes, racesRes] = await Promise.allSettled([
    apiClient.get<ApiClientResponse[]>('/api/Clients'),
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<ApiPetResponse[]>('/api/Pets'),
    apiClient.get<ApiSpeciesResponse[]>('/api/Species'),
    apiClient.get<ApiRaceResponse[]>('/api/Races'),
  ])

  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const clientPets = cpRes.status === 'fulfilled' ? cpRes.value : []
  const pets = petsRes.status === 'fulfilled' ? petsRes.value : []
  const species = speciesRes.status === 'fulfilled' ? speciesRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []

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
    const clientPetSummaries = petsByClientId.get(client.id.toLowerCase()) || []

    // Nombre y correo vienen directamente del DTO — sin cruce con /api/Users.
    const fullName = client.fullName || 'Cliente Sin Nombre'
    const documentId = client.identificationNumber || ''
    const email = client.email || ''
    const phone = client.phoneNumber || ''
    const estado = 'Activo'
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
      userId: client.userId,
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

// Crear un nuevo dueño usando createOwnerWithoutLogin
export async function createRecepDueno(
  data: RecepDuenoFormData,
): Promise<{ userId: string; clientId: string }> {
  const email = data.email?.trim() || ''
  if (!email || !email.includes('@')) {
    throw new Error('El correo del cliente es obligatorio.')
  }
  return createOwnerWithoutLogin({
    name: data.fullName.trim(),
    identificationNumber: data.documentId.trim(),
    phoneNumber: data.phone.trim(),
    email,
    address: data.address?.trim() || null,
  })
}

// Actualizar un dueño existente (PUT /api/Clients/{id} + PUT /api/Users/{id})
export async function updateRecepDueno(
  clientId: string,
  userId: string | undefined,
  data: RecepDuenoFormData,
): Promise<void> {
  const resolvedUserId = userId || ''

  await updateClient(clientId, {
    userId: resolvedUserId,
    identificationNumber: data.documentId.trim(),
    phoneNumber: data.phone.trim(),
    address: data.address?.trim() || null,
  })

  if (resolvedUserId) {
    const roles = await fetchRoles().catch(() => [])
    const clientRole = roles.find((r) => {
      const n = r.name.toLowerCase()
      return n.includes('client') || n.includes('cliente') || n.includes('dueño') || n.includes('dueno')
    })
    if (clientRole) {
      await updateUser(resolvedUserId, {
        fullName: data.fullName.trim(),
        email: data.email?.trim() || '',
        roleId: clientRole.id,
      })
    }
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


