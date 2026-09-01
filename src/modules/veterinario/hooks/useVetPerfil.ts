import { useEffect, useState } from 'react'
import type { VetProfilePayload } from '../types'
import { fetchVetProfile } from '../services'

export function useVetPerfil(enabled: boolean) {
  const [profile, setProfile] = useState<VetProfilePayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function loadProfile() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchVetProfile()
        if (!cancelled) setProfile(data)
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : 'No se pudo cargar el perfil'
          setError(msg)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [enabled])

  return {
    profile,
    isLoading,
    error,
  }
}
