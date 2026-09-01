import { getAccessToken } from '@/modules/auth'

export class ApiError extends Error {
  readonly status: number
  readonly data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
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

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json() as {
      message?: string
      title?: string
      detail?: string
      errors?: Record<string, string[] | string>
    }

    if (payload.message) return payload.message
    if (payload.detail) return payload.detail

    if (payload.errors && typeof payload.errors === 'object') {
      for (const value of Object.values(payload.errors)) {
        if (Array.isArray(value) && value[0]) {
          return String(value[0])
        }
        if (typeof value === 'string' && value) {
          return value
        }
      }
    }

    if (payload.title) return payload.title
  } catch {
    // Sin cuerpo JSON parseable
  }

  if (response.status === 401) return 'No autorizado o sesión expirada.'
  if (response.status === 403) return 'No tienes permisos para realizar esta acción.'
  if (response.status === 404) return 'Recurso no encontrado.'
  if (response.status >= 500) return 'Error interno del servidor. Intenta de nuevo más tarde.'

  return `Error en la solicitud (${response.status})`
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
    const message = await parseErrorMessage(response)
    throw new ApiError(message, response.status)
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
