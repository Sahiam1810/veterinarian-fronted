import { apiClient } from '@/services'

export interface ApiRolePermissionResponse {
  id: string
  roleId: string
  moduleId: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface ApiCreateRolePermissionRequest {
  roleId: string
  moduleId: string
  canView?: boolean
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export interface ApiUpdateRolePermissionRequest {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

// ===== Permisos de Roles =====
export async function fetchAllRolePermissions(): Promise<ApiRolePermissionResponse[]> {
  return apiClient.get<ApiRolePermissionResponse[]>('/api/role-permissions')
}

export async function fetchRolePermissionsByRoleId(roleId: string): Promise<ApiRolePermissionResponse[]> {
  return apiClient.get<ApiRolePermissionResponse[]>(`/api/role-permissions/by-role/${roleId}`)
}

export async function createRolePermission(data: ApiCreateRolePermissionRequest): Promise<ApiRolePermissionResponse> {
  return apiClient.post<ApiRolePermissionResponse>('/api/role-permissions', data)
}

export async function updateRolePermission(id: string, data: ApiUpdateRolePermissionRequest): Promise<void> {
  return apiClient.put<void>(`/api/role-permissions/${id}`, data)
}

export async function deleteRolePermission(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/role-permissions/${id}`)
}
