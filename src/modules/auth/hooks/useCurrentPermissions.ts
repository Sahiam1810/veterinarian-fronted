import { useCallback, useEffect, useState } from 'react'
import {
  fetchMyModulePermissions,
  type MyPermissionsMap,
} from '../services/myPermissionsService'

// Estado de carga de permisos del usuario autenticado
export type PermissionsLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

// Hook único sobre GET /api/auth/permissions (fuente de verdad del panel)
export function useCurrentPermissions(options?: {
  // Si true, no consulta la API (p. ej. SuperAdmin de plataforma)
  skip?: boolean
  // Re-fetch cuando cambie (personId, etc.)
  reloadKey?: string
}) {
  const skip = options?.skip ?? false
  const reloadKey = options?.reloadKey ?? ''
  const [permissions, setPermissions] = useState<MyPermissionsMap | null>(null)
  const [status, setStatus] = useState<PermissionsLoadStatus>(skip ? 'ready' : 'idle')

  const refresh = useCallback(async () => {
    if (skip) {
      setPermissions(null)
      setStatus('ready')
      return null
    }
    setStatus('loading')
    try {
      const map = await fetchMyModulePermissions()
      setPermissions(map)
      setStatus('ready')
      return map
    } catch {
      setPermissions({})
      setStatus('error')
      return null
    }
  }, [skip])

  useEffect(() => {
    if (skip) {
      setPermissions(null)
      setStatus('ready')
      return
    }
    let cancelled = false
    setStatus('loading')
    void fetchMyModulePermissions()
      .then((map) => {
        if (!cancelled) {
          setPermissions(map)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPermissions({})
          setStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [skip, reloadKey])

  return {
    permissions,
    status,
    isLoading: status === 'loading' || status === 'idle',
    isReady: status === 'ready',
    refresh,
  }
}
