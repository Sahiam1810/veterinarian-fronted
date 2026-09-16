// Lee la URL del backend solo desde el entorno. No hardcodear hosts aquí.

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

function asEnvUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const trimmed = stripTrailingSlash(raw.trim())
  return trimmed || undefined
}

function readProcessEnvApiUrl(): string | undefined {
  const nodeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  return asEnvUrl(nodeProcess?.env?.VITE_API_URL)
}

// Resuelve VITE_API_URL. Falla si no está en .env / variables de entorno.
export function resolveApiBaseUrl(viteUrl?: string, processUrl?: string): string {
  const url = asEnvUrl(viteUrl) ?? asEnvUrl(processUrl)
  if (!url) {
    throw new Error('Falta VITE_API_URL. Defínela en el archivo .env de la raíz del proyecto.')
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('VITE_API_URL debe ser una URL http o https.')
  }
  return url
}

export const API_BASE_URL = resolveApiBaseUrl(
  import.meta.env?.VITE_API_URL,
  readProcessEnvApiUrl(),
)

export const IS_DEV = Boolean(import.meta.env?.DEV)

export const NOTIFICATIONS_HUB_URL = `${API_BASE_URL}/hubs/notifications`
