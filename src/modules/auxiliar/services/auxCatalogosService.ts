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
  return apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians')
}

// 2. Servicios
export async function fetchServices(): Promise<ApiServiceResponse[]> {
  return apiClient.get<ApiServiceResponse[]>('/api/Services')
}

// 3. Clientes
export async function fetchClients(): Promise<ApiClientResponse[]> {
  return apiClient.get<ApiClientResponse[]>('/api/Clients')
}

// 4. Usuarios (para cruzar nombres de clientes o profesionales)
export async function fetchUsers(): Promise<ApiUserResponse[]> {
  return apiClient.get<ApiUserResponse[]>('/api/Users')
}

// 5. Especies
export async function fetchSpecies(): Promise<ApiSpeciesResponse[]> {
  return apiClient.get<ApiSpeciesResponse[]>('/api/Species')
}

// 6. Razas
export async function fetchRaces(): Promise<ApiRaceResponse[]> {
  return apiClient.get<ApiRaceResponse[]>('/api/Races')
}

// 7. Estados de cita
export async function fetchStatusAppointments(): Promise<ApiStatusAppointmentResponse[]> {
  return apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments')
}

// 8. Disponibilidades
export async function fetchAvailabilities(): Promise<ApiAvailabilityResponse[]> {
  return apiClient.get<ApiAvailabilityResponse[]>('/api/Availabilities')
}
