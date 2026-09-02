import { apiClient } from '@/services'

export interface ApiVeterinarianResponse {
  id: string
  userId: string
  userFullName?: string | null
  specialtyId: string
  specialtyName?: string | null
  licenseNumber: string
  createdAt: string
}

export interface ApiCreateVeterinarianRequest {
  userId: string
  specialtyId: string
  licenseNumber: string
}

export interface ApiUpdateVeterinarianRequest {
  userId: string
  specialtyId: string
  licenseNumber: string
}

export interface ApiCreateVeterinarianResponse {
  id: string
}

export async function fetchVeterinarians(): Promise<ApiVeterinarianResponse[]> {
  return apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians')
}

export async function fetchVeterinarianById(id: string): Promise<ApiVeterinarianResponse> {
  return apiClient.get<ApiVeterinarianResponse>(`/api/Veterinarians/${id}`)
}

export async function createVeterinarian(data: ApiCreateVeterinarianRequest): Promise<ApiCreateVeterinarianResponse> {
  return apiClient.post<ApiCreateVeterinarianResponse>('/api/Veterinarians', data)
}

export async function updateVeterinarian(id: string, data: ApiUpdateVeterinarianRequest): Promise<void> {
  return apiClient.put<void>(`/api/Veterinarians/${id}`, data)
}

export async function deleteVeterinarian(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Veterinarians/${id}`)
}
