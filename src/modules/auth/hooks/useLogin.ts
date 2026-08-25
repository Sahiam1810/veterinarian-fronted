import { useState } from 'react'
import type { LoginCredentials } from '../types'
import { loginRequest } from '../services'

export function useLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(credentials: LoginCredentials) {
    setIsSubmitting(true)
    setError(null)
    try {
      await loginRequest(credentials)
    } catch {
      setError('No se pudo iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { login, isSubmitting, error }
}
