import { apiClient } from '../../../services/apiClient.ts'

export interface ApiSpeciesResponse {
  id: string
  name: string
}

export interface ApiRaceResponse {
  id: string
  name: string
  // FK a especie; filtra razas coherentes en formularios
  speciesId: string
  speciesName?: string
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

export async function createSpecies(name: string): Promise<ApiSpeciesResponse> {
  return apiClient.post<ApiSpeciesResponse>('/api/Species', { name })
}

export async function updateSpecies(id: string, name: string): Promise<ApiSpeciesResponse> {
  return apiClient.put<ApiSpeciesResponse>(`/api/Species/${id}`, { name })
}

export async function deleteSpecies(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Species/${id}`)
}

// Lista razas; si speciesId, solo las de esa especie (GET /api/Races?speciesId=)
export async function fetchRaces(speciesId?: string): Promise<ApiRaceResponse[]> {
  return apiClient.get<ApiRaceResponse[]>('/api/Races', {
    params: speciesId ? { speciesId } : undefined,
  })
}

// Alternativa anidada: GET /api/Species/{id}/races
export async function fetchRacesBySpecies(speciesId: string): Promise<ApiRaceResponse[]> {
  return apiClient.get<ApiRaceResponse[]>(`/api/Species/${speciesId}/races`)
}

export async function createRace(data: {
  name: string
  speciesId: string
}): Promise<ApiRaceResponse> {
  return apiClient.post<ApiRaceResponse>('/api/Races', data)
}

export async function updateRace(
  id: string,
  data: { name: string; speciesId: string },
): Promise<ApiRaceResponse> {
  return apiClient.put<ApiRaceResponse>(`/api/Races/${id}`, data)
}

export async function deleteRace(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Races/${id}`)
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

export async function createDiagnostic(data: {
  code: string
  name: string
  description?: string | null
}): Promise<ApiDiagnosticResponse> {
  return apiClient.post<ApiDiagnosticResponse>('/api/Diagnostics', data)
}

export async function updateDiagnostic(
  id: string,
  data: {
    code: string
    name: string
    description?: string | null
    isActive: boolean
  },
): Promise<void> {
  return apiClient.put<void>(`/api/Diagnostics/${id}`, data)
}

// Baja lógica: marca el diagnóstico como inactivo (DELETE del API)
export async function deactivateDiagnostic(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Diagnostics/${id}`)
}
