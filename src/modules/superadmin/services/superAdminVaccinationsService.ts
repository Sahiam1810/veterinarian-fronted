import { apiClient } from '@/services'

export interface ApiVaccinationResponse {
  id: string
  clientPetId: string
  recordId: string
  vaccineName?: string | null
  doseNumber: number
  applicationDate: string
  nextDoseDate?: string | null
  createdAt: string
}

export interface ApiCreateVaccinationRequest {
  clientPetId: string
  recordId: string
  vaccineName?: string | null
  doseNumber: number
  applicationDate: string
  nextDoseDate?: string | null
}

export interface ApiCreateVaccinationResponse {
  id: string
}

// Las vacunaciones son inmutables una vez registradas: la API solo expone lectura y creación.
export async function fetchVaccinations(): Promise<ApiVaccinationResponse[]> {
  return apiClient.get<ApiVaccinationResponse[]>('/api/Vaccinations')
}

export async function fetchVaccinationById(id: string): Promise<ApiVaccinationResponse> {
  return apiClient.get<ApiVaccinationResponse>(`/api/Vaccinations/${id}`)
}

export async function createVaccination(
  data: ApiCreateVaccinationRequest,
): Promise<ApiCreateVaccinationResponse> {
  return apiClient.post<ApiCreateVaccinationResponse>('/api/Vaccinations', data)
}
