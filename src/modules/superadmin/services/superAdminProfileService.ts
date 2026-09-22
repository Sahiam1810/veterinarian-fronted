import { apiClient } from '@/services'
import type { CurrentProfileResponse } from '@/modules/auth/types'

// Perfil persistido del usuario autenticado, incluido SuperAdmin.
export async function fetchCurrentProfile(): Promise<CurrentProfileResponse> {
  return apiClient.get<CurrentProfileResponse>('/api/auth/me')
}

// Cambio de contraseña propia (autoservicio; la contraseña vive en USERS)
export async function changeMyPassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  return apiClient.patch<void>('/api/auth/me/password', {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  })
}
