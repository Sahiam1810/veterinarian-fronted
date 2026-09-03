import { apiClient } from '@/services'

export interface ApiClientResponse {
  id: string
  userId: string
  identificationNumber: string
  address?: string | null
  registrationDate: string
  createdAt: string
  updatedAt?: string | null
}

export interface ApiCreateClientRequest {
  userId: string
  identificationNumber: string
  address?: string | null
  registrationDate?: string | null
}

export interface ApiUpdateClientRequest {
  userId: string
  identificationNumber: string
  address?: string | null
  registrationDate?: string | null
}

export interface ApiCreateClientResponse {
  id: string
}

export async function fetchClients(): Promise<ApiClientResponse[]> {
  return apiClient.get<ApiClientResponse[]>('/api/Clients')
}

export async function fetchClientById(id: string): Promise<ApiClientResponse> {
  return apiClient.get<ApiClientResponse>(`/api/Clients/${id}`)
}

export async function createClient(data: ApiCreateClientRequest): Promise<ApiCreateClientResponse> {
  return apiClient.post<ApiCreateClientResponse>('/api/Clients', data)
}

export async function updateClient(id: string, data: ApiUpdateClientRequest): Promise<void> {
  return apiClient.put<void>(`/api/Clients/${id}`, data)
}

export async function deleteClient(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Clients/${id}`)
}
