import { useEffect, useState, useCallback } from 'react'
import type { RecepProfilePayload } from '../types'
import { fetchRecepProfile, changeRecepPassword } from '../services'
import { ApiError } from '@/services'

export function useRecepPerfil(enabled: boolean) {
  const [profile, setProfile] = useState<RecepProfilePayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 3200)
  }, [])

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchRecepProfile()
      let storedPhoto: string | null = null
      try {
        storedPhoto = localStorage.getItem(`huellitas_photo_${data.email?.toLowerCase()}`)
      } catch {
        // ignore
      }
      setProfile({
        ...data,
        photoUrl: storedPhoto || data.photoUrl,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar el perfil del recepcionista'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void loadProfile()
  }, [enabled, loadProfile])

  const openPasswordModal = () => {
    setPasswordError(null)
    setIsPasswordModalOpen(true)
  }

  const closePasswordModal = () => {
    if (isChangingPassword) return
    setIsPasswordModalOpen(false)
    setPasswordError(null)
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    setPasswordError(null)

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      const msg = 'Por favor completa todos los campos de contraseña'
      setPasswordError(msg)
      return { success: false, message: msg }
    }

    if (newPassword.length < 8) {
      const msg = 'La nueva contraseña debe tener al menos 8 caracteres'
      setPasswordError(msg)
      return { success: false, message: msg }
    }

    if (newPassword !== confirmPassword) {
      const msg = 'La nueva contraseña y su confirmación no coinciden'
      setPasswordError(msg)
      return { success: false, message: msg }
    }

    if (currentPassword === newPassword) {
      const msg = 'La nueva contraseña debe ser diferente a la contraseña actual'
      setPasswordError(msg)
      return { success: false, message: msg }
    }

    setIsChangingPassword(true)
    try {
      await changeRecepPassword({
        currentPassword,
        newPassword,
      })
      showNotice('¡Contraseña actualizada con éxito en el servidor!')
      setIsPasswordModalOpen(false)
      return { success: true, message: '¡Contraseña actualizada con éxito en el servidor!' }
    } catch (err) {
      let msg = 'No se pudo actualizar la contraseña. Verifica tu contraseña actual.'
      if (err instanceof ApiError) {
        if (err.violations.length > 0) {
          msg = err.violations.join('. ')
        } else if (err.message) {
          msg = err.message
        }
      } else if (err instanceof Error && err.message) {
        msg = err.message
      }
      setPasswordError(msg)
      return { success: false, message: msg }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleChangePhoto = () => {
    const randomPhotos = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    ]
    const nextPhoto = randomPhotos[Math.floor(Math.random() * randomPhotos.length)]
    if (profile?.email) {
      try {
        localStorage.setItem(`huellitas_photo_${profile.email.toLowerCase()}`, nextPhoto)
      } catch {
        // ignore
      }
    }
    setProfile((prev) => (prev ? { ...prev, photoUrl: nextPhoto } : prev))
    showNotice('Foto de perfil actualizada (almacenada únicamente en este navegador)')
  }

  const handleEditProfile = () => {
    showNotice('La información de cuenta y rol es administrada de forma centralizada por el servidor')
  }

  return {
    profile,
    isLoading,
    error,
    notice,
    isPasswordModalOpen,
    isChangingPassword,
    passwordError,
    openPasswordModal,
    closePasswordModal,
    reloadProfile: loadProfile,
    changePassword,
    handleEditProfile,
    handleChangePassword: openPasswordModal,
    handleChangePhoto,
  }
}
