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

export interface ApiDiagnosticResponse {
  id: string
  code?: string | null
  name?: string | null
  description?: string | null
  isActive: boolean
  createdAt: string
}

// 1. Obtener registros médicos
export async function fetchMedicalRecords(): Promise<ApiMedicalRecordResponse[]> {
  return apiClient.get<ApiMedicalRecordResponse[]>('/api/MedicalRecords').catch(() => [])
}

// 2. Registrar atención / pre-triaje en historia clínica
export async function createMedicalRecord(
  data: ApiCreateMedicalRecordRequest,
): Promise<ApiCreateMedicalRecordResponse> {
  return apiClient.post<ApiCreateMedicalRecordResponse>('/api/MedicalRecords', data)
}

// 3. Obtener catálogo de diagnósticos
export async function fetchDiagnostics(onlyActive = false): Promise<ApiDiagnosticResponse[]> {
  return apiClient
    .get<ApiDiagnosticResponse[]>('/api/Diagnostics', { params: { onlyActive } })
    .catch(() => [])
}
