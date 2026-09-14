import { useEffect, useRef } from 'react'
import {
  notificationsHubManager,
  type ChatEscalationCreatedCallback,
  type ChatMessageReceivedCallback,
  type ChatEscalationResolvedCallback,
} from './notificationsHubManager.ts'

export interface UseChatEscalationsRealtimeOptions {
  enabled: boolean
  onEscalationCreated?: ChatEscalationCreatedCallback
  onMessageReceived?: ChatMessageReceivedCallback
  onEscalationResolved?: ChatEscalationResolvedCallback
}

/**
 * Hook para suscribirse a los eventos en tiempo real de chat y escalamiento
 * (ChatEscalationCreated, ChatMessageReceived, ChatEscalationResolved)
 * usando la conexión SignalR compartida en NotificationsHub.
 *
 * Ticket FE-3: se implementó como hook hermano de useNotificationsRealtime
 * en vez de extender ese hook para escuchar también estos tres eventos —
 * useNotificationsRealtime ya está en producción sosteniendo la campana de
 * notificaciones, y tocarlo arriesgaba esa funcionalidad existente. Ambos
 * hooks comparten la misma conexión SignalR a través del singleton
 * notificationsHubManager (ver ensureConnected/subscribeTo* en
 * notificationsHubManager.ts) — no se abre una segunda conexión al hub.
 */
export function useChatEscalationsRealtime({
  enabled,
  onEscalationCreated,
  onMessageReceived,
  onEscalationResolved,
}: UseChatEscalationsRealtimeOptions): void {
  const onCreatedRef = useRef(onEscalationCreated)
  const onMessageRef = useRef(onMessageReceived)
  const onResolvedRef = useRef(onEscalationResolved)

  onCreatedRef.current = onEscalationCreated
  onMessageRef.current = onMessageReceived
  onResolvedRef.current = onEscalationResolved

  useEffect(() => {
    if (!enabled) return

    const unsubscribe = notificationsHubManager.subscribeToChatEscalations({
      onEscalationCreated: (payload) => onCreatedRef.current?.(payload),
      onMessageReceived: (payload) => onMessageRef.current?.(payload),
      onEscalationResolved: (payload) => onResolvedRef.current?.(payload),
    })

    return () => {
      unsubscribe()
    }
  }, [enabled])
}
