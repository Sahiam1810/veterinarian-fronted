import { vetApiFetch } from '../api/vetHttp'
import type { ApiVeterinarian } from '../api/apiTypes'
import type {
  ClinicalResultsFilters,
  ClinicalResultsResponse,
} from '../types/resultadosClinicos.types'

export async function fetchClinicalResults(
  filters: ClinicalResultsFilters,
  page = 1,
  pageSize = 20,
): Promise<ClinicalResultsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.veterinarianId) params.set('veterinarianId', filters.veterinarianId)
  if (filters.from) params.set('from', `${filters.from}T00:00:00`)
  if (filters.to) params.set('to', `${filters.to}T23:59:59.999`)
  if (filters.status) params.set('status', filters.status)

  return vetApiFetch<ClinicalResultsResponse>(`/api/clinical-results?${params.toString()}`)
}

export async function fetchClinicalResultVeterinarians(): Promise<ApiVeterinarian[]> {
  return vetApiFetch<ApiVeterinarian[]>('/api/veterinarians')
}
