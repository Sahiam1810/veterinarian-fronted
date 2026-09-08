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
  // Número 0-6 (.NET DayOfWeek). String "2" o "Tuesday" provoca 400.
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive?: boolean
  slotDurationMinutes?: number
  maxConcurrentAppointments?: number
  consultingRoom?: string | null
  shiftName?: string | null
}

export interface ApiUpdateAvailabilityRequest {
  veterinarianId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  slotDurationMinutes?: number
  maxConcurrentAppointments?: number
  consultingRoom?: string | null
  shiftName?: string | null
}

export interface ApiCreateAvailabilityResponse {
  id: string
}

export async function fetchAvailabilities(): Promise<ApiAvailabilityResponse[]> {
  return apiClient.get<ApiAvailabilityResponse[]>('/api/Availabilities')
}

export async function fetchAvailabilitiesByVeterinarian(
  veterinarianId: string,
): Promise<ApiAvailabilityResponse[]> {
  return apiClient.get<ApiAvailabilityResponse[]>(
    `/api/Availabilities/by-veterinarian/${veterinarianId}`,
  )
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
