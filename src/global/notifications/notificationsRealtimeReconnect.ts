// Backoff tras agotar el reintento automático de SignalR (evita loops agresivos).
export const NOTIFICATIONS_RECONNECT_BACKOFF_MS = [2_000, 5_000, 15_000, 30_000] as const

export type NotificationsReconnectDeps = {
  // true cuando el efecto del hook ya se desmontó o la sesión expiró.
  isCancelled: () => boolean
  // Asegura JWT vigente antes de volver a start().
  ensureToken: () => Promise<string | null>
  // Reintenta HubConnection.start() sobre la misma conexión.
  startConnection: () => Promise<void>
  sleep: (ms: number) => Promise<void>
  backoffMs?: readonly number[]
}

// Tras un cierre definitivo, refresca token y llama start() con backoff hasta conectar o cancelar.
export async function reconnectNotificationsAfterClose(
  deps: NotificationsReconnectDeps,
): Promise<void> {
  const backoff = deps.backoffMs ?? NOTIFICATIONS_RECONNECT_BACKOFF_MS
  let attempt = 0

  while (!deps.isCancelled()) {
    const delayMs = backoff[Math.min(attempt, backoff.length - 1)] ?? backoff[backoff.length - 1]
    attempt += 1
    await deps.sleep(delayMs)
    if (deps.isCancelled()) return

    try {
      const token = await deps.ensureToken()
      if (!token || deps.isCancelled()) return
      await deps.startConnection()
      return
    } catch {
      // Silencioso: seguir con el siguiente backoff si el backend sigue caído.
    }
  }
}
