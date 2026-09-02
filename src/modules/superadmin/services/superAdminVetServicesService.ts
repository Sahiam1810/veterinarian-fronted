import { apiClient } from '@/services'

export interface ApiServiceResponse {
  id: string
  typeServiceId: string
  typeServiceName?: string | null
  name: string
  durationMinutes: number
  price: number
  isActive: boolean
}

export interface ApiCreateServiceRequest {
  typeServiceId: string
  name: string
  durationMinutes: number
  price: number
  isActive?: boolean
}

export interface ApiUpdateServiceRequest {
  typeServiceId: string
  name: string
  durationMinutes: number
  price: number
  isActive: boolean
}

export interface ApiCreateServiceResponse {
  id: string
}

export async function fetchServices(): Promise<ApiServiceResponse[]> {
  return apiClient.get<ApiServiceResponse[]>('/api/Services')
}

export async function fetchServiceById(id: string): Promise<ApiServiceResponse> {
  return apiClient.get<ApiServiceResponse>(`/api/Services/${id}`)
}

export async function createService(data: ApiCreateServiceRequest): Promise<ApiCreateServiceResponse> {
  return apiClient.post<ApiCreateServiceResponse>('/api/Services', data)
}

export async function updateService(id: string, data: ApiUpdateServiceRequest): Promise<void> {
  return apiClient.put<void>(`/api/Services/${id}`, data)
}

export async function deleteService(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Services/${id}`)
}
