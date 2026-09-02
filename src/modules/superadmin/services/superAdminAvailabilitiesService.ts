import { apiClient } from '@/services'

export interface ApiAvailabilityResponse {
  id: string
  veterinarianId: string
  veterinarianLicenseNumber?: string | null
  dayOfWeek: number | string
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
}

export interface ApiCreateAvailabilityRequest {
  veterinarianId: string
  dayOfWeek: number | string
  startTime: string
  endTime: string
  isActive?: boolean
}

export interface ApiUpdateAvailabilityRequest {
  veterinarianId: string
  dayOfWeek: number | string
  startTime: string
  endTime: string
  isActive: boolean
}

export interface ApiCreateAvailabilityResponse {
  id: string
}

export async function fetchAvailabilities(): Promise<ApiAvailabilityResponse[]> {
  return apiClient.get<ApiAvailabilityResponse[]>('/api/Availabilities')
}

export async function createAvailability(data: ApiCreateAvailabilityRequest): Promise<ApiCreateAvailabilityResponse> {
  return apiClient.post<ApiCreateAvailabilityResponse>('/api/Availabilities', data)
}

export async function updateAvailability(id: string, data: ApiUpdateAvailabilityRequest): Promise<void> {
  return apiClient.put<void>(`/api/Availabilities/${id}`, data)
}

export async function deleteAvailability(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Availabilities/${id}`)
}
