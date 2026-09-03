import { useEffect, useState, useCallback } from 'react'
import type { CurrentProfileResponse } from '@/modules/auth/types'
import { fetchAuxProfile, changeAuxPassword } from '../services/auxProfileService'
import { ApiError } from '@/services'

export interface UseAuxPerfilResult {
  profile: CurrentProfileResponse | null
  isLoading: boolean
  error: string | null
  isChangingPassword: boolean
  passwordError: string | null
  reloadProfile: () => Promise<void>
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean; message: string }>
}

export function useAuxPerfil(): UseAuxPerfilResult {
  const [profile, setProfile] = useState<CurrentProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAuxProfile()
      setProfile(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar el perfil'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

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
      await changeAuxPassword({
        currentPassword,
        newPassword,
      })
      return { success: true, message: '¡Contraseña actualizada con éxito!' }
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

  return {
    profile,
    isLoading,
    error,
    isChangingPassword,
    passwordError,
    reloadProfile: loadProfile,
    changePassword,
  }
}
