import { useEffect, useState, useCallback, useRef } from 'react'
import type { ChatMessageItem } from '../types/index.ts'
import { SENDER_TYPE_GUIDS } from '../types/index.ts'
import {
  fetchConversationThread,
  sendAgentMessage,
  resolveConversation,
} from '../services/index.ts'
import {
  useChatEscalationsRealtime,
  type ChatMessageReceivedPayload,
  type ChatEscalationResolvedPayload,
} from '../../../global/notifications/index.ts'
import {
  applyRealtimeMessageToThread,
  applySendHttpResponseToThread,
} from './recepConversacionDetalleReducers.ts'

interface UseRecepConversacionDetalleOptions {
  conversationId: string | null
  escalationId: string | null
  relatedConversationIds?: string[]
  canSendMessages?: boolean
  canResolveEscalations?: boolean
  onResolved?: (escalationId: string) => void
  onNotice?: (message: string) => void
}

export function useRecepConversacionDetalle({
  conversationId,
  escalationId,
  relatedConversationIds,
  canSendMessages = false,
  canResolveEscalations = false,
  onResolved,
  onNotice,
}: UseRecepConversacionDetalleOptions) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [isLoadingThread, setIsLoadingThread] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputContent, setInputContent] = useState('')

  const isMountedRef = useRef(true)

  const loadThread = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      return
    }

    setIsLoadingThread(true)
    setError(null)
    try {
      const data = await fetchConversationThread(conversationId, relatedConversationIds)
      if (isMountedRef.current) {
        setMessages(data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const msg =
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el historial de mensajes'
        setError(msg)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingThread(false)
      }
    }
  }, [conversationId])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (conversationId) {
      void loadThread()
    } else {
      setMessages([])
      setError(null)
      setInputContent('')
    }
  }, [conversationId, loadThread])

  // Receptor de mensajes en tiempo real (SignalR) para el hilo abierto
  const handleRealtimeMessageReceived = useCallback(
    (payload: ChatMessageReceivedPayload) => {
      if (!conversationId || payload.conversationId !== conversationId) return

      setMessages((prev) => applyRealtimeMessageToThread(prev, payload))
    },
    [conversationId],
  )

  // Receptor de resolución en tiempo real (si otro agente la resuelve mientras está abierta)
  const handleRealtimeEscalationResolved = useCallback(
    (payload: ChatEscalationResolvedPayload) => {
      const matchesEscalation = escalationId && payload.escalationId === escalationId
      const matchesConversation =
        conversationId && payload.conversationId && payload.conversationId === conversationId

      if (matchesEscalation || matchesConversation) {
        onNotice?.('Esta conversación fue marcada como resuelta por otro agente.')
        onResolved?.(payload.escalationId)
      }
    },
    [escalationId, conversationId, onNotice, onResolved],
  )

  useChatEscalationsRealtime({
    enabled: Boolean(conversationId),
    onMessageReceived: handleRealtimeMessageReceived,
    onEscalationResolved: handleRealtimeEscalationResolved,
  })

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const content = (textToSend !== undefined ? textToSend : inputContent).trim()
      if (!content || !conversationId) return
      if (!canSendMessages) {
        onNotice?.('No tienes permiso para enviar mensajes.')
        return
      }

      const tempId = `temp-${Date.now()}`
      const now = new Date()
      const timeLabel = now.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })

      // Mensaje optimista
      const optimisticMessage: ChatMessageItem = {
        id: tempId,
        conversationId,
        senderTypeId: SENDER_TYPE_GUIDS.HUMAN_AGENT,
        senderRole: 'human_agent',
        senderLabel: 'Asesor (Tú)',
        content,
        createdAt: now.toISOString(),
        timeLabel,
        status: 'sending',
      }

      setMessages((prev) => [...prev, optimisticMessage])
      setInputContent('')
      setIsSending(true)

      try {
        const realMessage = await sendAgentMessage(conversationId, content)
        if (isMountedRef.current) {
          setMessages((prev) =>
            applySendHttpResponseToThread(prev, tempId, realMessage),
          )
        }
      } catch (err) {
        const errorText =
          err instanceof Error ? err.message : 'Error al enviar el mensaje'
        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, status: 'error', errorMessage: errorText }
                : m,
            ),
          )
          onNotice?.(errorText)
        }
      } finally {
        if (isMountedRef.current) {
          setIsSending(false)
        }
      }
    },
    [canSendMessages, conversationId, inputContent, onNotice],
  )

  const handleResolve = useCallback(
    async (notes?: string) => {
      if (!escalationId) return
      if (!canResolveEscalations) {
        onNotice?.('No tienes permiso para resolver escalamientos.')
        return
      }

      setIsResolving(true)
      try {
        await resolveConversation(escalationId, notes)
        if (isMountedRef.current) {
          onNotice?.('Conversación marcada como resuelta con éxito.')
          onResolved?.(escalationId)
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'No se pudo resolver la conversación'
        if (isMountedRef.current) {
          onNotice?.(msg)
          throw err
        }
      } finally {
        if (isMountedRef.current) {
          setIsResolving(false)
        }
      }
    },
    [canResolveEscalations, escalationId, onNotice, onResolved],
  )

  return {
    messages,
    isLoadingThread,
    isSending,
    isResolving,
    error,
    inputContent,
    setInputContent,
    loadThread,
    sendMessage: handleSendMessage,
    resolve: handleResolve,
  }
}
