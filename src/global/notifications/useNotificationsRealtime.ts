import { useEffect, useRef } from 'react'
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr'
import { getAccessToken } from '@/modules/auth'
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

    const start = async () => {
      const token = getAccessToken()
      if (!token) return

      const next = new HubConnectionBuilder()
        .withUrl(HUB_URL, {
          // El backend acepta JWT en ?access_token= para esta ruta WebSocket.
          accessTokenFactory: () => getAccessToken() ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build()

      next.on(RECEIVE_METHOD, (payload: unknown) => {
        const mapped = mapRealtimeNotificationPayload(payload)
        if (mapped) onNotificationRef.current(mapped)
      })

      connection = next

      try {
        await next.start()
        if (cancelled) {
          await stopQuietly(next)
        }
      } catch {
        // Degradación segura: la campana sigue con fetch REST.
        connection = null
        await stopQuietly(next)
      }
    }

    void start()

    const onSessionExpired = () => {
      void stopQuietly(connection)
      connection = null
    }
    window.addEventListener('huellitas:session-expired', onSessionExpired)

    return () => {
      cancelled = true
      window.removeEventListener('huellitas:session-expired', onSessionExpired)
      void stopQuietly(connection)
      connection = null
    }
  }, [enabled])
}
