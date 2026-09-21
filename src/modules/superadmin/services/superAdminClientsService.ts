import { apiClient } from '@/services'

// Respuesta de cliente según contrato API v2 (sin userId ni registrationDate)
export interface ApiClientResponse {
  id: string
  identificationNumber: string
  phoneNumber?: string | null
  address?: string | null
  createdAt: string
  updatedAt?: string | null
  fullName: string
  email: string
  isActive: boolean
}

// Body de POST /api/Clients
export interface ApiCreateClientRequest {
  fullName: string
  email: string
  identificationNumber: string
  phoneNumber: string
  address?: string | null
}

// Body de PUT /api/Clients/{id}
export interface ApiUpdateClientRequest {
  fullName: string
  email: string
  identificationNumber: string
  phoneNumber: string
  address?: string | null
  isActive: boolean
}

export interface LookupOwnerParams {
  identification?: string
  phone?: string
}

export async function fetchClients(): Promise<ApiClientResponse[]> {
  return apiClient.get<ApiClientResponse[]>('/api/Clients')
}

export async function fetchClientById(id: string): Promise<ApiClientResponse> {
  return apiClient.get<ApiClientResponse>(`/api/Clients/${id}`)
}

/**
 * Consulta de dueños/clientes en /api/Clients/lookup
 * Permite buscar por identificación y/o teléfono.
 */
export async function lookupOwner(params: LookupOwnerParams = {}): Promise<ApiClientResponse[]> {
  const query = new URLSearchParams()
  if (params.identification?.trim()) {
    query.set('identification', params.identification.trim())
  }
  if (params.phone?.trim()) {
    query.set('phone', params.phone.trim())
  }
  const queryString = query.toString()
  const endpoint = queryString ? `/api/Clients/lookup?${queryString}` : '/api/Clients/lookup'

  const res = await apiClient.get<ApiClientResponse[] | ApiClientResponse>(endpoint)
  if (Array.isArray(res)) return res
  if (res) return [res]
  return []
}

// Crea cliente y devuelve el recurso creado (201)
export async function createClient(data: ApiCreateClientRequest): Promise<ApiClientResponse> {
  return apiClient.post<ApiClientResponse>('/api/Clients', {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    identificationNumber: data.identificationNumber.trim(),
    phoneNumber: data.phoneNumber.trim(),
    address: data.address?.trim() || null,
  })
}

export async function updateClient(id: string, data: ApiUpdateClientRequest): Promise<void> {
  return apiClient.put<void>(`/api/Clients/${id}`, {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    identificationNumber: data.identificationNumber.trim(),
    phoneNumber: data.phoneNumber.trim(),
    address: data.address?.trim() || null,
    isActive: data.isActive,
  })
}

export async function deleteClient(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Clients/${id}`)
}
