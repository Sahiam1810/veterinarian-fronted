import { apiClient } from '@/services'
import type {
  ApiVeterinarianResponse,
  ApiServiceResponse,
  ApiClientResponse,
  ApiSpeciesResponse,
  ApiRaceResponse,
  ApiStatusAppointmentResponse,
  ApiAvailabilityResponse,
  ApiClientPetResponse,
  ApiAvailableSlotResponse,
} from '../types'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'

// 1. Veterinarios
export async function fetchVeterinarians(): Promise<ApiVeterinarianResponse[]> {
  return apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians')
    .catch((error) => {
      console.error('Error fetching veterinarians:', error)
      return []
    })
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
// Lista razas; opcionalmente filtradas por especie
export async function fetchRaces(speciesId?: string): Promise<ApiRaceResponse[]> {
  return apiClient
    .get<ApiRaceResponse[]>('/api/Races', {
      params: speciesId ? { speciesId } : undefined,
    })
    .catch(() => [])
}

// 7. Estados de cita
export async function fetchStatusAppointments(): Promise<ApiStatusAppointmentResponse[]> {
  return apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments').catch(() => [])
}

// 8. Disponibilidades
export async function fetchAvailabilities(): Promise<ApiAvailabilityResponse[]> {
  return apiClient.get<ApiAvailabilityResponse[]>('/api/Availabilities').catch(() => [])
}

// 9. Relaciones Cliente-Mascota
export async function fetchClientPets(): Promise<ApiClientPetResponse[]> {
  return apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets').catch(() => [])
}

// 10. Horarios disponibles de veterinario para una fecha específica
export async function fetchAvailableSlots(
  veterinarianId: string,
  date: string,
  serviceId?: string
): Promise<ApiAvailableSlotResponse[]> {
  if (!veterinarianId || !date) return []
  return apiClient
    .get<ApiAvailableSlotResponse[]>('/api/Availabilities/available-slots', {
      params: {
        veterinarianId,
        date,
        ...(serviceId ? { serviceId } : {}),
      },
    })
    .catch((error) => {
      console.error('Error fetching available slots:', error)
      return []
    })
}


