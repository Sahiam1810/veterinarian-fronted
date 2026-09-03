import { apiClient } from '@/services'
import type { CurrentProfileResponse } from '@/modules/auth/types'
import type { RecepProfilePayload, ChangeRecepPasswordPayload } from '../types'

// Carga el perfil real del recepcionista autenticado desde el backend
export async function fetchRecepProfile(): Promise<RecepProfilePayload> {
  const profile = await apiClient.get<CurrentProfileResponse>('/api/auth/me')

  return {
    personId: profile.personId,
    userAccountId: profile.userAccountId,
    displayName: profile.fullName,
    fullName: profile.fullName,
    userName: profile.userName,
    email: profile.email,
    role: profile.role || 'Recepcionista',
    jobTitle: profile.role || 'Recepcionista',
    accountStatus: profile.accountStatus || 'Activo',
    initials: profile.initials || profile.fullName.slice(0, 2).toUpperCase(),
    photoUrl: null,
    passwordUpdatedLabel: 'Gestionada de forma segura',
  }
}

// Cambia la contraseña propia del usuario autenticado
export async function changeRecepPassword(data: ChangeRecepPasswordPayload): Promise<void> {
  return apiClient.patch<void>('/api/auth/me/password', {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  })
}
