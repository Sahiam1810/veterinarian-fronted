import type { ChatMessageItem } from '../types/index.ts'
import {
  resolveSenderRole,
  resolveSenderLabel,
} from '../services/recepEscalacionesService.ts'
import type { ChatMessageReceivedPayload } from '../../../global/notifications/realtimeChatTypes.ts'

// Formatea la hora visible del mensaje en el hilo
function formatMessageTimeLabel(isoDate: string): string {
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return 'Ahora'
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Aplica un mensaje SignalR al hilo; reconciliando el optimista del asesor si aplica
export function applyRealtimeMessageToThread(
  prev: ChatMessageItem[],
  payload: ChatMessageReceivedPayload,
): ChatMessageItem[] {
  // Evitar duplicados si el mensaje ya está en el hilo (id real)
  if (prev.some((m) => m.id === payload.messageId)) return prev

  const role = resolveSenderRole(payload.senderType, payload.senderType)
  const label = resolveSenderLabel(role, payload.senderName)
  const timeLabel = formatMessageTimeLabel(payload.sentAt)

  // Carrera: SignalR llega antes que HTTP; reconciliar optimista del asesor
  if (role === 'human_agent') {
    const optimisticIndex = prev.findIndex(
      (m) =>
        m.status === 'sending' &&
        m.senderRole === 'human_agent' &&
        m.conversationId === payload.conversationId &&
        m.content === payload.content,
    )

    if (optimisticIndex !== -1) {
      return prev.map((m, idx) =>
        idx === optimisticIndex
          ? {
              ...m,
              id: payload.messageId,
              senderTypeId: payload.senderType,
              senderRole: role,
              senderLabel: label,
              senderName: payload.senderName,
              createdAt: payload.sentAt,
              timeLabel,
              status: 'sent' as const,
            }
          : m,
      )
    }
  }

  const incomingItem: ChatMessageItem = {
    id: payload.messageId,
    conversationId: payload.conversationId,
    senderTypeId: payload.senderType,
    senderRole: role,
    senderLabel: label,
    senderName: payload.senderName,
    content: payload.content,
    createdAt: payload.sentAt,
    timeLabel,
    status: 'sent',
  }

  return [...prev, incomingItem]
}

// Aplica la respuesta HTTP del envío sin reinsertar si SignalR ya reconcilió
export function applySendHttpResponseToThread(
  prev: ChatMessageItem[],
  tempId: string,
  realMessage: ChatMessageItem,
): ChatMessageItem[] {
  // Ya reconciliado por SignalR (id real presente)
  if (prev.some((m) => m.id === realMessage.id)) return prev

  // Reemplazar el optimista pendiente
  if (prev.some((m) => m.id === tempId)) {
    return prev.map((m) => (m.id === tempId ? realMessage : m))
  }

  // Ni temp ni real: no insertar de nuevo
  return prev
}
