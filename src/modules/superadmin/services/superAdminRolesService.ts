import { apiClient } from '@/services'

export interface ApiRoleResponse {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export interface ApiCreateRoleRequest {
  name: string
  description?: string | null
}

export interface ApiUpdateRoleRequest {
  name: string
  description?: string | null
}

export interface ApiCreateRoleResponse {
  id: string
}

export async function fetchRoles(): Promise<ApiRoleResponse[]> {
  return apiClient.get<ApiRoleResponse[]>('/api/Roles')
}

export async function fetchRoleById(id: string): Promise<ApiRoleResponse> {
  return apiClient.get<ApiRoleResponse>(`/api/Roles/${id}`)
}

export async function createRole(data: ApiCreateRoleRequest): Promise<ApiCreateRoleResponse> {
  return apiClient.post<ApiCreateRoleResponse>('/api/Roles', data)
}

export async function updateRole(id: string, data: ApiUpdateRoleRequest): Promise<void> {
  return apiClient.put<void>(`/api/Roles/${id}`, data)
}

export async function deleteRole(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Roles/${id}`)
}
