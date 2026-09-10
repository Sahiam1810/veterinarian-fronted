import type { RealtimeNotificationPayload } from './realtimeNotificationTypes'

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

function asIsoDate(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString()
  return null
}

// Normaliza el payload SignalR a la forma que consumen mapNotificationToNotificacion / mapVetNotification.
export function mapRealtimeNotificationPayload(
  payload: unknown,
): RealtimeNotificationPayload | null {
  if (!payload || typeof payload !== 'object') return null

  const raw = payload as Record<string, unknown>
  const id = asString(raw.id)
  const userId = asString(raw.userId)
  const appointmentId = asString(raw.appointmentId)
  if (!id || !userId || !appointmentId) return null

  const sentAt = asIsoDate(raw.sentAt) ?? asIsoDate(raw.createdAt) ?? new Date().toISOString()
  const createdAt = asIsoDate(raw.createdAt) ?? sentAt

  return {
    id,
    userId,
    userFullName: asOptionalString(raw.userFullName),
    appointmentId,
    message: asOptionalString(raw.message),
    sentAt,
    status: asOptionalString(raw.status),
    type: asOptionalString(raw.type),
    createdAt,
    updatedAt: asIsoDate(raw.updatedAt),
  }
}

// Inserta al inicio sin duplicar por id (degradación segura si llega el mismo evento dos veces).
export function prependNotificationById<T extends { id: string }>(
  current: T[],
  incoming: T,
): T[] {
  if (current.some((item) => item.id === incoming.id)) return current
  return [incoming, ...current]
}

export function isRealtimeNotificationUnread(status?: string | null): boolean {
  const normalized = (status ?? '').trim().toLowerCase()
  if (!normalized) return true
  return normalized !== 'leída' && normalized !== 'leida' && normalized !== 'read'
}
