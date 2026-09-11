// Import relativo para que node:test resuelva sin el alias `@/`.
import { getAccessToken, refreshSession } from '../../modules/auth/services/authService.ts'

// Margen antes del vencimiento real para renovar el JWT (1 minuto).
export const TOKEN_REFRESH_SKEW_MS = 60_000

// Lee el claim `exp` del JWT; si no se puede parsear, se trata como vencido.
export function isAccessTokenExpiredOrNearExpiry(
  token: string,
  nowMs: number = Date.now(),
  skewMs: number = TOKEN_REFRESH_SKEW_MS,
): boolean {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return true
    const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as { exp?: unknown }
    if (typeof payload.exp !== 'number') return true
    return payload.exp * 1000 <= nowMs + skewMs
  } catch {
    return true
  }
}

export type EnsureSignalRAccessTokenDeps = {
  getAccessToken?: () => string | null
  refreshSession?: () => Promise<string>
  now?: () => number
  skewMs?: number
}

// Devuelve un access token vigente; renueva con refreshSession si está vencido o por vencer.
export async function ensureSignalRAccessToken(
  deps: EnsureSignalRAccessTokenDeps = {},
): Promise<string | null> {
  const getToken = deps.getAccessToken ?? getAccessToken
  const refresh = deps.refreshSession ?? refreshSession
  const now = deps.now ?? Date.now
  const skewMs = deps.skewMs ?? TOKEN_REFRESH_SKEW_MS

  const current = getToken()
  if (!current) return null

  if (!isAccessTokenExpiredOrNearExpiry(current, now(), skewMs)) {
    return current
  }

  try {
    return await refresh()
  } catch {
    // Degradación segura: sin token válido SignalR no conecta; la campana sigue por REST.
    return getToken()
  }
}
