import { useEffect, useRef } from 'react'
import {
  notificationsHubManager,
  type NotificationCallback,
} from './notificationsHubManager.ts'
import type { RealtimeNotificationPayload } from './realtimeNotificationTypes.ts'

export interface UseNotificationsRealtimeOptions {
  // Solo conectar con sesión activa (token + usuario).
  enabled: boolean
  onNotification: (notification: RealtimeNotificationPayload) => void
}

/**
 * Conecta al hub SignalR de notificaciones compartiendo la conexión única
 * y con degradación segura (fallo = solo REST).
 */
export function useNotificationsRealtime({
  enabled,
  onNotification,
}: UseNotificationsRealtimeOptions): void {
  const onNotificationRef = useRef<NotificationCallback>(onNotification)
  onNotificationRef.current = onNotification

  useEffect(() => {
    if (!enabled) return

    const unsubscribe = notificationsHubManager.subscribeToNotification((notification) => {
      onNotificationRef.current(notification)
    })

    return () => {
      unsubscribe()
    }
  }, [enabled])
}
