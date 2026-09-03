import { getAccessToken, clearStoredUser } from '@/modules/auth'

export class ApiError extends Error {
  readonly status: number
  readonly data?: unknown
  readonly violations: string[]

  constructor(message: string, status: number, data?: unknown, violations: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.violations = violations
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:5233'

export function getApiUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = new URL(`${API_BASE_URL}${normalizedEndpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

async function parseErrorMessage(response: Response): Promise<{ message: string; violations: string[] }> {
  try {
    const payload = await response.json() as {
      message?: string
      title?: string
      detail?: string
      errors?: Record<string, string[] | string>
      violations?: Array<{ field?: string; message?: string }>
    }

    const violations: string[] = []

    if (Array.isArray(payload.violations)) {
      for (const violation of payload.violations) {
        if (violation?.message) {
          violations.push(String(violation.message))
        }
      }
    }

    if (payload.errors && typeof payload.errors === 'object') {
      for (const value of Object.values(payload.errors)) {
        if (Array.isArray(value)) {
          violations.push(...value.map(String))
        } else if (typeof value === 'string' && value) {
          violations.push(value)
        }
      }
    }

    if (violations.length > 0) {
      return { message: violations[0], violations }
    }

    if (payload.message) return { message: payload.message, violations: [] }
    if (payload.detail) return { message: payload.detail, violations: [] }
    if (payload.title) return { message: payload.title, violations: [] }
  } catch {
    // Sin cuerpo JSON parseable
  }

  if (response.status === 401) {
    return { message: 'No autorizado o sesión expirada.', violations: [] }
  }
  if (response.status === 403) {
    return { message: 'No tienes permisos para realizar esta acción.', violations: [] }
  }
  if (response.status === 404) {
    return { message: 'Recurso no encontrado.', violations: [] }
  }
  if (response.status >= 500) {
    return { message: 'Error interno del servidor. Intenta de nuevo más tarde.', violations: [] }
  }

  return { message: `Error en la solicitud (${response.status})`, violations: [] }
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, headers: customHeaders, ...restOptions } = options
  const url = getApiUrl(endpoint, params)

  const headers = new Headers(customHeaders)

  const token = getAccessToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let requestBody: BodyInit | undefined = undefined

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      requestBody = body
    } else {
      headers.set('Content-Type', 'application/json')
      requestBody = JSON.stringify(body)
    }
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...restOptions,
      headers,
      body: requestBody,
    })
  } catch (err) {
    throw new ApiError(
      `No se pudo conectar con el servidor en ${API_BASE_URL}.`,
      0,
      err
    )
  }

  if (!response.ok) {
    const { message, violations } = await parseErrorMessage(response)

    // Sesión inválida/expirada: limpia storage y fuerza re-login (evita listas vacías silenciosas).
    const isAuthEndpoint =
      endpoint.includes('/api/auth/login') ||
      endpoint.includes('/api/auth/register') ||
      endpoint.includes('/api/auth/refresh')

    if (response.status === 401 && !isAuthEndpoint) {
      clearStoredUser()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('huellitas:session-expired'))
      }
    }

    throw new ApiError(message, response.status, undefined, violations)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as unknown as T
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}
