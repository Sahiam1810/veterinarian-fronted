import { apiClient } from '@/services'

export interface ApiPetResponse {
  id: string
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
  // URL http(s) persistida en PETS.PHOTO_URL
  photoUrl?: string | null
}

export interface ApiCreatePetRequest {
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
  photoUrl?: string | null
}

export interface ApiUpdatePetRequest {
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
  photoUrl?: string | null
}

export interface ApiCreatePetResponse {
  id: string
}

export async function fetchPets(): Promise<ApiPetResponse[]> {
  return apiClient.get<ApiPetResponse[]>('/api/Pets')
}

export async function fetchPetById(id: string): Promise<ApiPetResponse> {
  return apiClient.get<ApiPetResponse>(`/api/Pets/${id}`)
}

export async function createPet(data: ApiCreatePetRequest): Promise<ApiCreatePetResponse> {
  return apiClient.post<ApiCreatePetResponse>('/api/Pets', data)
}

export async function updatePet(id: string, data: ApiUpdatePetRequest): Promise<void> {
  return apiClient.put<void>(`/api/Pets/${id}`, data)
}

export async function deletePet(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Pets/${id}`)
}
