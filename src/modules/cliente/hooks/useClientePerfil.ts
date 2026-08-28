import { useCallback, useEffect, useState } from 'react'
import type { ClienteProfilePayload } from '../types'
import { fetchClienteProfile } from '../services'

export function useClientePerfil(enabled = true) {
  const [profile, setProfile] = useState<ClienteProfilePayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchClienteProfile()
        if (!cancelled) setProfile(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar tu perfil')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const handleEditProfile = useCallback(() => {
    setNotice('Edición de perfil disponible próximamente')
  }, [])

  const handleChangePassword = useCallback(() => {
    setNotice('Cambio de contraseña disponible próximamente')
  }, [])

  const handleViewAccountStatements = useCallback(() => {
    setNotice('Estados de cuenta disponibles próximamente (mock)')
  }, [])

  return {
    profile,
    isLoading,
    error,
    notice,
    handleEditProfile,
    handleChangePassword,
    handleViewAccountStatements,
  }
}
