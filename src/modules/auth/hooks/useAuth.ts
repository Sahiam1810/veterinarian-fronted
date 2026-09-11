import { useState, useCallback, useEffect } from 'react'
import type { AuthUser, LoginCredentials, MockAccount, UserRole } from '../types'
import {
  loginRequest,
  getStoredUser,
  clearStoredUser,
  MOCK_ACCOUNTS,
} from '../services'
import { toSpanishAuthError } from '../utils/toSpanishAuthError'
import { invalidateAllReferenceData } from '../../superadmin/cache'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    setIsSubmitting(true)
    setError(null)
    try {
      const user = await loginRequest(credentials)
      setCurrentUser(user)
      return user
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error al iniciar sesión'
      const msg = toSpanishAuthError(raw)
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const loginAs = useCallback(
    async (role: UserRole): Promise<AuthUser> => {
      const account = MOCK_ACCOUNTS.find((a) => a.role === role)
      if (!account) {
        const msg =
          'Este correo no tiene permisos de sesión para el panel. Los clientes solo usan Telegram o el chatbot.'
        setError(msg)
        throw new Error(msg)
      }
      return login({
        email: account.email,
        password: account.password,
        remember: true,
      })
    },
    [login]
  )

  const logout = useCallback(() => {
    clearStoredUser()
    invalidateAllReferenceData()
    setCurrentUser(null)
    setError(null)
  }, [])

  // Si el API responde 401, apiClient limpia tokens y dispara este evento.
  useEffect(() => {
    const onSessionExpired = () => {
      invalidateAllReferenceData()
      setCurrentUser(null)
      setError('Tu sesión expiró. Inicia sesión de nuevo.')
    }
    const onSessionRefreshed = (event: Event) => {
      const refreshedUser = (event as CustomEvent<AuthUser>).detail
      if (refreshedUser) setCurrentUser(refreshedUser)
    }
    window.addEventListener('huellitas:session-expired', onSessionExpired)
    window.addEventListener('huellitas:session-refreshed', onSessionRefreshed)
    return () => {
      window.removeEventListener('huellitas:session-expired', onSessionExpired)
      window.removeEventListener('huellitas:session-refreshed', onSessionRefreshed)
    }
  }, [])

  return {
    currentUser,
    isSubmitting,
    error,
    setError,
    login,
    loginAs,
    logout,
    accounts: MOCK_ACCOUNTS as MockAccount[],
  }
}
