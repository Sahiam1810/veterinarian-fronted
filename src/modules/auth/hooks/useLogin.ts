import { useState } from 'react'
import type { LoginCredentials, AuthUser } from '../types'
import { loginRequest } from '../services'

export function useLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(credentials: LoginCredentials): Promise<AuthUser | null> {
    setIsSubmitting(true)
    setError(null)
    try {
      const user = await loginRequest(credentials)
      return user
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión'
      setError(msg)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  return { login, isSubmitting, error, setError }
}

