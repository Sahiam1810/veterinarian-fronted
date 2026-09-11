import { useEffect, useRef } from 'react'
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr'
import { ensureSignalRAccessToken } from './ensureSignalRAccessToken'
import { reconnectNotificationsAfterClose } from './notificationsRealtimeReconnect'
import { mapRealtimeNotificationPayload } from './mapRealtimeNotification'
import type { RealtimeNotificationPayload } from './realtimeNotificationTypes'

const API_BASE_URL =
  (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:5233'

const HUB_URL = `${API_BASE_URL}/hubs/notifications`
const RECEIVE_METHOD = 'ReceiveNotification'

export interface UseNotificationsRealtimeOptions {
  // Solo conectar con sesión activa (token + usuario).
  enabled: boolean
  onNotification: (notification: RealtimeNotificationPayload) => void
}

// Conecta al hub SignalR de notificaciones con degradación segura (fallo = solo REST).
export function useNotificationsRealtime({
  enabled,
  onNotification,
}: UseNotificationsRealtimeOptions): void {
  const onNotificationRef = useRef(onNotification)
  onNotificationRef.current = onNotification

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let connection: HubConnection | null = null
    let reconnectInFlight: Promise<void> | null = null
    let sleepTimer: ReturnType<typeof setTimeout> | null = null

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        sleepTimer = setTimeout(() => {
          sleepTimer = null
          resolve()
        }, ms)
      })

    const stopQuietly = async (conn: HubConnection | null) => {
      if (!conn) return
      try {
        if (conn.state !== HubConnectionState.Disconnected) {
          await conn.stop()
        }
      } catch {
        // Silencioso: no romper la campana si el cierre falla.
      }
    }

    const startConnection = async () => {
      if (!connection) return
      if (connection.state !== HubConnectionState.Disconnected) return
      await connection.start()
    }

    // Tras agotar withAutomaticReconnect, refresca token y vuelve a start() con backoff.
    const scheduleReconnectAfterClose = () => {
      if (cancelled || reconnectInFlight) return
      reconnectInFlight = reconnectNotificationsAfterClose({
        isCancelled: () => cancelled,
        ensureToken: ensureSignalRAccessToken,
        startConnection,
        sleep,
      }).finally(() => {
        reconnectInFlight = null
      })
      void reconnectInFlight
    }

    const start = async () => {
      const token = await ensureSignalRAccessToken()
      if (!token || cancelled) return

      const next = new HubConnectionBuilder()
        .withUrl(HUB_URL, {
          // El backend acepta JWT en ?access_token=; renovamos si está vencido o por vencer.
          accessTokenFactory: async () => (await ensureSignalRAccessToken()) ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build()

      next.on(RECEIVE_METHOD, (payload: unknown) => {
        const mapped = mapRealtimeNotificationPayload(payload)
        if (mapped) onNotificationRef.current(mapped)
      })

      next.onclose(() => {
        if (cancelled) return
        scheduleReconnectAfterClose()
      })

      connection = next

      try {
        await next.start()
        if (cancelled) {
          await stopQuietly(next)
        }
      } catch {
        // Degradación segura: la campana sigue con fetch REST; reintentamos en silencio.
        scheduleReconnectAfterClose()
      }
    }

    void start()

    const onSessionExpired = () => {
      cancelled = true
      if (sleepTimer) {
        clearTimeout(sleepTimer)
        sleepTimer = null
      }
      void stopQuietly(connection)
      connection = null
    }
    window.addEventListener('huellitas:session-expired', onSessionExpired)

    return () => {
      cancelled = true
      if (sleepTimer) {
        clearTimeout(sleepTimer)
        sleepTimer = null
      }
      window.removeEventListener('huellitas:session-expired', onSessionExpired)
      void stopQuietly(connection)
      connection = null
    }
  }, [enabled])
}
