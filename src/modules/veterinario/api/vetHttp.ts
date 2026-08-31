// Cliente HTTP autenticado para el módulo veterinario.
import { getAccessToken } from '@/modules/auth'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:5233'

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
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    })
  } catch {
    throw new Error(`No se pudo conectar con el backend en ${API_BASE_URL}.`)
  }

  if (response.status === 401) {
    throw new Error('Sesión expirada o sin permiso. Vuelve a iniciar sesión.')
  }

  if (!response.ok) {
    throw new Error(`Error del API (${response.status}) en ${path}.`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
