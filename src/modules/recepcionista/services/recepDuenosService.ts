import { apiClient } from '../../../services/apiClient.ts'
import type { RecepDuenoFormData, RecepDuenosDirectoryPayload } from '../types'
import type { ApiClientResponse } from '../../superadmin/services/superAdminClientsService.ts'
import {
  lookupOwner,
  createClient,
  updateClient,
  fetchClientById,
} from '../../superadmin/services/superAdminClientsService.ts'
import type { ApiClientPetResponse } from '../../superadmin/services/superAdminClientsPetsService.ts'
import type { ApiPetResponse } from '../../superadmin/services/superAdminPetsService.ts'
import type { ApiSpeciesResponse, ApiRaceResponse } from '../../superadmin/services/superAdminCatalogService.ts'
import { buildRecepDuenosDirectory } from '../utils/recepDuenosMapping.ts'

export { lookupOwner, createClient, updateClient }

// Obtiene el directorio de dueños consolidando clientes y mascotas desde el backend.
// FullName, Email y estado se leen directo del DTO de /api/Clients.
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

  return buildRecepDuenosDirectory(clients, clientPets, pets, species, races)
}

// Alta de dueño vía POST /api/Clients (contrato v2)
export async function createRecepDueno(
  data: RecepDuenoFormData,
): Promise<{ clientId: string }> {
  const email = data.email?.trim() || ''
  if (!email || !email.includes('@')) {
    throw new Error('El correo del cliente es obligatorio.')
  }

  const client = await createClient({
    fullName: data.fullName.trim(),
    email,
    identificationNumber: data.documentId.trim(),
    phoneNumber: data.phone.trim(),
    address: data.address?.trim() || null,
  })

  return { clientId: client.id }
}

// Actualiza dueño con un solo PUT /api/Clients/{id}; conserva isActive actual
export async function updateRecepDueno(
  clientId: string,
  data: RecepDuenoFormData,
): Promise<void> {
  const current = await fetchClientById(clientId)

  await updateClient(clientId, {
    fullName: data.fullName.trim(),
    email: data.email?.trim() || '',
    identificationNumber: data.documentId.trim(),
    phoneNumber: data.phone.trim(),
    address: data.address?.trim() || null,
    isActive: current.isActive,
  })
}
