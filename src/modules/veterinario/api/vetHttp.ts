import { API_BASE_URL } from '../../../config/env.ts'
import { getAccessToken } from '@/modules/auth'
import {
  ApiError,
  fetchWithSession,
  parseErrorMessage,
  sanitizeEncoding,
} from '@/services/apiClient'

export function getVetApiBaseUrl(): string {
  return API_BASE_URL
}

export async function vetApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) {
    throw new Error('No hay sesión activa. Inicia sesión de nuevo.')
  }

  let response: Response
  try {
    response = await fetchWithSession(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers || {}),
      },
    })
  } catch {
    throw new Error(`No se pudo conectar con el backend en ${API_BASE_URL}.`)
  }

  if (!response.ok) {
    const { message, violations, code } = await parseErrorMessage(response)
    throw new ApiError(message, response.status, undefined, violations, code)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return sanitizeEncoding(await response.json()) as T
}

