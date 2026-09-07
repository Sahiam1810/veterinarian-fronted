import { vetApiFetch } from '../api/vetHttp'
import type { ApiClientPet, ApiMedicalRecord, ApiVaccination } from '../api/apiTypes'
import type { HistoriaClinicaPayload, MascotaDetail } from '../types'
import { buildHistoriaClinica } from '../utils/buildHistoriaClinica'
import { fetchVetMascotasBundle } from './vetMascotasService'

export interface ApiDiagnostic {
  id: string
  code?: string | null
  name?: string | null
  description?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
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

// Catálogo de diagnósticos reales
export async function fetchDiagnostics(onlyActive = false): Promise<ApiDiagnostic[]> {
  const query = onlyActive ? '?onlyActive=true' : ''
  return vetApiFetch<ApiDiagnostic[]>(`/api/diagnostics${query}`).catch(async () => {
    return vetApiFetch<ApiDiagnostic[]>('/api/Diagnostics').catch(() => [])
  })
}

// Crea un registro de historia clínica médica (POST /api/medicalrecords)
export async function createMedicalRecord(
  data: ApiCreateMedicalRecordRequest,
): Promise<ApiCreateMedicalRecordResponse> {
  return vetApiFetch<ApiCreateMedicalRecordResponse>('/api/medicalrecords', {
    method: 'POST',
    body: JSON.stringify(data),
  }).catch(async () => {
    return vetApiFetch<ApiCreateMedicalRecordResponse>('/api/MedicalRecords', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })
}

// Obtiene historia clínica real (medical records + vacunas + diagnósticos) de una mascota.
export async function fetchHistoriaClinica(
  petId: string,
  detailHint?: MascotaDetail | null,
): Promise<HistoriaClinicaPayload | null> {
  const [medicalRecords, vaccinations, clientPets, diagnostics, detail] = await Promise.all([
    vetApiFetch<ApiMedicalRecord[]>('/api/medicalrecords').catch(async () => {
      return vetApiFetch<ApiMedicalRecord[]>('/api/MedicalRecords').catch(() => [])
    }),
    vetApiFetch<ApiVaccination[]>('/api/vaccinations').catch(async () => {
      return vetApiFetch<ApiVaccination[]>('/api/Vaccinations').catch(() => [])
    }),
    vetApiFetch<ApiClientPet[]>('/api/clientspets').catch(async () => {
      return vetApiFetch<ApiClientPet[]>('/api/ClientsPets').catch(() => [])
    }),
    fetchDiagnostics(false),
    detailHint
      ? Promise.resolve(detailHint)
      : fetchVetMascotasBundle().then(
          (bundle) => bundle.directory.detailsById[petId] ?? null,
        ),
  ])

  if (!detail) return null

  const clientPetIds = clientPets
    .filter((link) => link.petId.toLowerCase() === petId.toLowerCase())
    .map((link) => link.id)

  return buildHistoriaClinica({
    detail,
    clientPetIds,
    medicalRecords,
    vaccinations,
    diagnostics,
  })
}

