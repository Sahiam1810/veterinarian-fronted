import { apiClient } from '@/services'

export interface ApiClientPetResponse {
  id: string
  clientId: string
  petId: string
  isPrimaryOwner: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface ApiCreateClientPetRequest {
  clientId: string
  petId: string
  isPrimaryOwner: boolean
}

export interface ApiUpdateClientPetRequest {
  isPrimaryOwner: boolean
}

export interface ApiCreateClientPetResponse {
  id: string
}

export async function fetchClientsPets(): Promise<ApiClientPetResponse[]> {
  return apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets')
}

export async function createClientPet(data: ApiCreateClientPetRequest): Promise<ApiCreateClientPetResponse> {
  return apiClient.post<ApiCreateClientPetResponse>('/api/ClientsPets', data)
}

export async function updateClientPet(id: string, data: ApiUpdateClientPetRequest): Promise<void> {
  return apiClient.put<void>(`/api/ClientsPets/${id}`, data)
}

export async function deleteClientPet(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/ClientsPets/${id}`)
}
