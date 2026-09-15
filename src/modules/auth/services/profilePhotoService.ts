import { apiClient } from '@/services'

// Guarda o quita la foto de perfil en USERS.PHOTO_URL. Vacío la elimina.
export async function updateMyProfilePhoto(photoUrl: string): Promise<void> {
  await apiClient.patch<void>('/api/auth/me/photo', {
    photoUrl: photoUrl.trim() || null,
  })
}
