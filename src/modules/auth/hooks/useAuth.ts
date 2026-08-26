import { useState, useCallback } from 'react'
import type { AuthUser, LoginCredentials, MockAccount, UserRole } from '../types'
import {
  loginRequest,
  getStoredUser,
  clearStoredUser,
  MOCK_ACCOUNTS,
} from '../services'

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
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(msg)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const loginAs = useCallback(
    async (role: UserRole): Promise<AuthUser> => {
      const account = MOCK_ACCOUNTS.find((a) => a.role === role) || MOCK_ACCOUNTS[0]
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
    setCurrentUser(null)
    setError(null)
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
