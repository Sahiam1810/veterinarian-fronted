import { apiClient } from '@/services'

export interface ApiClientResponse {
  id: string
  userId: string
  identificationNumber: string
  phoneNumber?: string | null
  address?: string | null
  registrationDate: string
  createdAt: string
  updatedAt?: string | null
  // Resueltos desde la navegación User en el backend — eliminan la necesidad
  // de cruzar contra GET /api/Users para obtener el nombre y estado del dueño.
  fullName?: string | null
  email?: string | null
  isActive?: boolean | null
}

export interface ApiCreateClientRequest {
  userId: string
  identificationNumber: string
  phoneNumber?: string | null
  address?: string | null
  registrationDate?: string | null
}

export interface ApiUpdateClientRequest {
  userId: string
  identificationNumber: string
  phoneNumber?: string | null
  address?: string | null
  registrationDate?: string | null
}

export interface ApiCreateClientResponse {
  id: string
}

export interface LookupOwnerParams {
  identification?: string
  phone?: string
}

export interface CreateOwnerWithoutLoginParams {
  name: string
  identificationNumber: string
  phoneNumber: string
  // Obligatorio: OTP al chatbot si inicia desde otro teléfono
  email: string
  address?: string | null
  roleId?: string
}

// Body de POST /api/Clients/register-owner (staff, sin cuenta ni contraseña)
export interface ApiRegisterOwnerRequest {
  fullName: string
  email: string
  identificationNumber: string
  phoneNumber: string
  address?: string | null
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

export async function createClient(data: ApiCreateClientRequest): Promise<ApiCreateClientResponse> {
  return apiClient.post<ApiCreateClientResponse>('/api/Clients', data)
}

// Alta staff de dueño/cliente: sin UserAccounts ni UserCredentials
export async function registerOwner(data: ApiRegisterOwnerRequest): Promise<ApiClientResponse> {
  return apiClient.post<ApiClientResponse>('/api/Clients/register-owner', {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    identificationNumber: data.identificationNumber.trim(),
    phoneNumber: data.phoneNumber.trim(),
    address: data.address?.trim() || null,
  })
}

/**
 * Registra un dueño sin login web.
 * Teléfono = sesión Telegram; correo obligatorio para OTP si cambia de número.
 */
export async function createOwnerWithoutLogin(
  params: CreateOwnerWithoutLoginParams,
): Promise<{ userId: string; clientId: string }> {
  const phoneDigits = params.phoneNumber.replace(/\D/g, '')
  const email = params.email.trim()
  if (!email || !email.includes('@')) {
    throw new Error('El correo del cliente es obligatorio para la verificación por código en el chatbot.')
  }

  const identificationNumber =
    params.identificationNumber.trim() ||
    `TEL${phoneDigits}`.slice(0, 20)

  const client = await registerOwner({
    fullName: params.name.trim(),
    email,
    identificationNumber,
    phoneNumber: params.phoneNumber.trim(),
    address: params.address,
  })

  return { userId: client.userId, clientId: client.id }
}

export async function updateClient(id: string, data: ApiUpdateClientRequest): Promise<void> {
  return apiClient.put<void>(`/api/Clients/${id}`, data)
}

export async function deleteClient(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Clients/${id}`)
}

