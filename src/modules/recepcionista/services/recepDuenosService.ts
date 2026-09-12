import { apiClient } from '@/services'
import type { RecepDuenoFormData, RecepDuenosDirectoryPayload } from '../types'
import type { ApiClientResponse, ApiCreateClientRequest, ApiUpdateClientRequest } from '@/modules/superadmin/services/superAdminClientsService'
import { lookupOwner, createOwnerWithoutLogin, updateClient, updateClientOwnerProfile } from '@/modules/superadmin/services/superAdminClientsService'
import type { ApiClientPetResponse } from '@/modules/superadmin/services/superAdminClientsPetsService'
import type { ApiPetResponse } from '@/modules/superadmin/services/superAdminPetsService'
import type { ApiSpeciesResponse, ApiRaceResponse } from '@/modules/superadmin/services/superAdminCatalogService'
import { buildRecepDuenosDirectory } from '../utils/recepDuenosMapping'

export { lookupOwner, createOwnerWithoutLogin, updateClient }

// Obtiene el directorio de dueños consolidando clientes y mascotas desde el backend.
// FullName, Email y estado se leen directo del DTO de /api/Clients — el backend
// los expone desde la navegación User sin requerir GET /api/Users.
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

// Actualizar un dueño existente (PUT /api/Clients/{id} + PUT /api/Clients/{id}/owner-profile).
// S51: el nombre/correo ya no pasa por PUT /api/Users (requiere permiso
// "Usuarios: Editar" y antes resolvía el rol vía GET /api/Roles) — Recepcionista
// no tiene ninguno de los dos permisos, así que ese paso fallaba en silencio
// (.catch(() => [])) y el cambio de nombre nunca se guardaba, aunque se
// mostrara el mensaje de éxito. El endpoint dedicado solo exige "Clientes: Editar".
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

  await updateClientOwnerProfile(clientId, {
    fullName: data.fullName.trim(),
    email: data.email?.trim() || '',
  })
}

// Crear un nuevo cliente en el sistema
export async function createRecepClient(data: ApiCreateClientRequest): Promise<{ id: string }> {
  return apiClient.post<{ id: string }>('/api/Clients', data)
}

// Actualizar información del cliente
export async function updateRecepClient(id: string, data: ApiUpdateClientRequest): Promise<void> {
  return apiClient.put<void>(`/api/Clients/${id}`, data)
}


