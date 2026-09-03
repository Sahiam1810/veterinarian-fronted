import { apiClient } from '@/services'
import type { CurrentProfileResponse } from '@/modules/auth/types'

// Obtiene los datos del perfil actual del auxiliar autenticado
export async function fetchAuxProfile(): Promise<CurrentProfileResponse> {
  return apiClient.get<CurrentProfileResponse>('/api/auth/me')
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

// Cambia la contraseña propia del usuario autenticado
export async function changeAuxPassword(data: ChangePasswordPayload): Promise<void> {
  return apiClient.patch<void>('/api/auth/me/password', {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  })
}
