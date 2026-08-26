import { useEffect, useState } from 'react'
import type { VetProfilePayload } from '../types'
import { fetchVetProfile } from '../services'

export function useVetPerfil(enabled: boolean) {
  const [profile, setProfile] = useState<VetProfilePayload | null>(null)
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
        const data = await fetchVetProfile()
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

  const handleEditProfile = () => showNotice('Editar perfil: módulo pendiente')
  const handleChangePassword = () => showNotice('Cambiar contraseña: módulo pendiente')
  const handleChangePhoto = () => showNotice('Cambiar foto: módulo pendiente')

  return {
    profile,
    isLoading,
    error,
    notice,
    handleEditProfile,
    handleChangePassword,
    handleChangePhoto,
  }
}
