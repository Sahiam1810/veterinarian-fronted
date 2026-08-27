import { useEffect, useState } from 'react'
import type { RecepProfilePayload } from '../types'
import { fetchRecepProfile } from '../services'

export function useRecepPerfil(enabled: boolean) {
  const [profile, setProfile] = useState<RecepProfilePayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function loadProfile() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchRecepProfile()
        if (!cancelled) setProfile(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar el perfil')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }

  return {
    profile,
    isLoading,
    error,
    notice,
    handleEditProfile: () => showNotice('Editar perfil: módulo pendiente'),
    handleChangePassword: () => showNotice('Cambiar contraseña: módulo pendiente'),
    handleChangePhoto: () => showNotice('Cambiar foto: módulo pendiente'),
  }
}
