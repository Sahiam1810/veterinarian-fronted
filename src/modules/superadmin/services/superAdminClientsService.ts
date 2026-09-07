import { apiClient } from '@/services'
import { createUser } from './superAdminUserService'
import { fetchRoles } from './superAdminRolesService'

export interface ApiClientResponse {
  id: string
  userId: string
  identificationNumber: string
  phoneNumber?: string | null
  address?: string | null
  registrationDate: string
  createdAt: string
  updatedAt?: string | null
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
  email?: string | null
  address?: string | null
  roleId?: string
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

/**
 * Registra un nuevo dueño como cliente en el backend SIN crear cuenta de login ni credenciales:
 * Paso 1: POST /api/Users (rol Cliente, sin password ni cuenta)
 * Paso 2: POST /api/Clients (identificación, teléfono, dirección)
 */
export async function createOwnerWithoutLogin(
  params: CreateOwnerWithoutLoginParams,
): Promise<{ userId: string; clientId: string }> {
  let roleId = params.roleId
  if (!roleId) {
    const roles = await fetchRoles()
    const clientRole = roles.find((r) => {
      const n = r.name.toLowerCase()
      return n.includes('client') || n.includes('cliente') || n.includes('dueño') || n.includes('dueno')
    })
    if (!clientRole) {
      throw new Error('No se encontró el rol de Cliente en el sistema.')
    }
    roleId = clientRole.id
  }

  // Paso 1: Crear usuario en /api/Users sin contraseña ni cuenta
  const userRes = await createUser({
    fullName: params.name.trim(),
    email: params.email?.trim() || '',
    roleId,
  })

  if (!userRes || !userRes.id) {
    throw new Error('No se pudo registrar el usuario base para el cliente.')
  }

  // Paso 2: Crear cliente en /api/Clients con los datos de contacto
  const clientRes = await createClient({
    userId: userRes.id,
    identificationNumber: params.identificationNumber.trim(),
    phoneNumber: params.phoneNumber.trim(),
    address: params.address?.trim() || null,
  })

  return { userId: userRes.id, clientId: clientRes.id }
}

export async function updateClient(id: string, data: ApiUpdateClientRequest): Promise<void> {
  return apiClient.put<void>(`/api/Clients/${id}`, data)
}

export async function deleteClient(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Clients/${id}`)
}

