import { apiClient } from '@/services'

export interface ApiSupply {
  id: string
  name: string
  unit: string
  unitPrice: number
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export type SupplyDto = ApiSupply

export interface CreateSupplyDto {
  name: string
  unit: string
  unitPrice: number
  stock: number
  isActive?: boolean
}

export interface UpdateSupplyDto {
  name: string
  unit: string
  unitPrice: number
  stock: number
  isActive: boolean
}

export async function fetchSupplies(onlyActive = true): Promise<ApiSupply[]> {
  const query = onlyActive ? '?onlyActive=true' : '?onlyActive=false'
  return apiClient.get<ApiSupply[]>(`/api/supplies${query}`)
}

export async function fetchSupplyById(id: string): Promise<ApiSupply> {
  return apiClient.get<ApiSupply>(`/api/supplies/${id}`)
}

export async function createSupply(data: CreateSupplyDto): Promise<ApiSupply> {
  return apiClient.post<ApiSupply>('/api/supplies', data)
}

export async function updateSupply(id: string, data: UpdateSupplyDto): Promise<void> {
  return apiClient.put<void>(`/api/supplies/${id}`, data)
}

export async function deleteSupply(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/supplies/${id}`)
}
