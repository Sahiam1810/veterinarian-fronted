import { apiClient } from '@/services'

export interface ApiSpeciesResponse {
  id: string
  name: string
}

export interface ApiRaceResponse {
  id: string
  name: string
}

export interface ApiSpecialtyResponse {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface ApiTypeServiceResponse {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export interface ApiStatusAppointmentResponse {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export interface ApiDiagnosticResponse {
  id: string
  code?: string | null
  name?: string | null
  description?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export async function fetchSpecies(): Promise<ApiSpeciesResponse[]> {
  return apiClient.get<ApiSpeciesResponse[]>('/api/Species')
}

export async function fetchRaces(): Promise<ApiRaceResponse[]> {
  return apiClient.get<ApiRaceResponse[]>('/api/Races')
}

export async function fetchSpecialties(): Promise<ApiSpecialtyResponse[]> {
  return apiClient.get<ApiSpecialtyResponse[]>('/api/Specialties')
}

export async function fetchTypeServices(): Promise<ApiTypeServiceResponse[]> {
  return apiClient.get<ApiTypeServiceResponse[]>('/api/TypeServices')
}

export async function fetchStatusAppointments(): Promise<ApiStatusAppointmentResponse[]> {
  return apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments')
}

// onlyActive=false para incluir diagnósticos inactivos referenciados por historias antiguas
export async function fetchDiagnostics(onlyActive = false): Promise<ApiDiagnosticResponse[]> {
  return apiClient.get<ApiDiagnosticResponse[]>('/api/Diagnostics', { params: { onlyActive } })
}
