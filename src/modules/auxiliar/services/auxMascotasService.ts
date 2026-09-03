import { apiClient } from '@/services'
import type {
  ApiPetResponse,
  ApiCreatePetRequest,
  ApiUpdatePetRequest,
  ApiClientPetResponse,
  ApiCreateClientPetRequest,
} from '../types'

// 1. Obtener todas las mascotas
export async function fetchPets(): Promise<ApiPetResponse[]> {
  return apiClient.get<ApiPetResponse[]>('/api/Pets')
}

// 2. Obtener mascota por ID
export async function fetchPetById(id: string): Promise<ApiPetResponse> {
  return apiClient.get<ApiPetResponse>(`/api/Pets/${id}`)
}

// 3. Crear nueva mascota
export async function createPet(data: ApiCreatePetRequest): Promise<ApiPetResponse> {
  return apiClient.post<ApiPetResponse>('/api/Pets', data)
}

// 4. Actualizar mascota
export async function updatePet(id: string, data: ApiUpdatePetRequest): Promise<void> {
  return apiClient.put<void>(`/api/Pets/${id}`, data)
}

// 5. Eliminar mascota
export async function deletePet(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Pets/${id}`)
}

// 6. Obtener relaciones Clientes-Mascotas
export async function fetchClientsPets(): Promise<ApiClientPetResponse[]> {
  return apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets')
}

// 7. Vincular un cliente a una mascota
export async function createClientPet(data: ApiCreateClientPetRequest): Promise<ApiClientPetResponse> {
  return apiClient.post<ApiClientPetResponse>('/api/ClientsPets', data)
}
