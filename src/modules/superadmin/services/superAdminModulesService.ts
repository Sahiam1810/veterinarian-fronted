import { apiClient } from '@/services'

export interface ApiModuleResponse {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface ApiCreateModuleRequest {
  name: string
  description?: string | null
}

export interface ApiUpdateModuleRequest {
  name: string
  description?: string | null
}

export async function fetchModules(): Promise<ApiModuleResponse[]> {
  return apiClient.get<ApiModuleResponse[]>('/api/Modules')
}

export async function fetchModuleById(id: string): Promise<ApiModuleResponse> {
  return apiClient.get<ApiModuleResponse>(`/api/Modules/${id}`)
}

export async function createModule(data: ApiCreateModuleRequest): Promise<ApiModuleResponse> {
  return apiClient.post<ApiModuleResponse>('/api/Modules', data)
}

export async function updateModule(id: string, data: ApiUpdateModuleRequest): Promise<void> {
  return apiClient.put<void>(`/api/Modules/${id}`, data)
}

export async function deleteModule(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Modules/${id}`)
}
