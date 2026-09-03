import { apiClient } from '@/services'

export interface ApiMedicalRecordResponse {
  id: string
  clientPetId: string
  appointmentId: string
  diagnosticId: string
  diagnosticCode?: string | null
  symptoms?: string | null
  treatment?: string | null
  weightAtVisit?: number | null
  temperature?: number | null
  createdAt: string
}

export interface ApiCreateMedicalRecordRequest {
  clientPetId: string
  appointmentId: string
  diagnosticId: string
  symptoms?: string | null
  treatment?: string | null
  weightAtVisit?: number | null
  temperature?: number | null
}

export interface ApiCreateMedicalRecordResponse {
  id: string
}

// Las historias médicas son inmutables una vez creadas: la API solo expone lectura y creación.
export async function fetchMedicalRecords(): Promise<ApiMedicalRecordResponse[]> {
  return apiClient.get<ApiMedicalRecordResponse[]>('/api/MedicalRecords')
}

export async function fetchMedicalRecordById(id: string): Promise<ApiMedicalRecordResponse> {
  return apiClient.get<ApiMedicalRecordResponse>(`/api/MedicalRecords/${id}`)
}

export async function createMedicalRecord(
  data: ApiCreateMedicalRecordRequest,
): Promise<ApiCreateMedicalRecordResponse> {
  return apiClient.post<ApiCreateMedicalRecordResponse>('/api/MedicalRecords', data)
}
