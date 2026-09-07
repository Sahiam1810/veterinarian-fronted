import { apiClient } from '@/services'
import type {
  ApiVeterinarianResponse,
  ApiServiceResponse,
  ApiClientResponse,
  ApiSpeciesResponse,
  ApiRaceResponse,
  ApiStatusAppointmentResponse,
  ApiAvailabilityResponse,
} from '../types'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'

// 1. Veterinarios
export async function fetchVeterinarians(): Promise<ApiVeterinarianResponse[]> {
  return apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians').catch(() => [])
}

// 2. Servicios
export async function fetchServices(): Promise<ApiServiceResponse[]> {
  return apiClient.get<ApiServiceResponse[]>('/api/Services').catch(() => [])
}

// 3. Clientes
export async function fetchClients(): Promise<ApiClientResponse[]> {
  return apiClient.get<ApiClientResponse[]>('/api/Clients').catch(() => [])
}

// 4. Usuarios (para cruzar nombres de clientes o profesionales; protegido contra 403)
export async function fetchUsers(): Promise<ApiUserResponse[]> {
  return apiClient.get<ApiUserResponse[]>('/api/Users').catch(() => [])
}

// 5. Especies
export async function fetchSpecies(): Promise<ApiSpeciesResponse[]> {
  return apiClient.get<ApiSpeciesResponse[]>('/api/Species').catch(() => [])
}

// 6. Razas
export async function fetchRaces(): Promise<ApiRaceResponse[]> {
  return apiClient.get<ApiRaceResponse[]>('/api/Races').catch(() => [])
}

// 7. Estados de cita
export async function fetchStatusAppointments(): Promise<ApiStatusAppointmentResponse[]> {
  return apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments').catch(() => [])
}

// 8. Disponibilidades
export async function fetchAvailabilities(): Promise<ApiAvailabilityResponse[]> {
  return apiClient.get<ApiAvailabilityResponse[]>('/api/Availabilities').catch(() => [])
}

