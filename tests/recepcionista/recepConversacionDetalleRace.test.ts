import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyRealtimeMessageToThread,
  applySendHttpResponseToThread,
} from '../../src/modules/recepcionista/hooks/recepConversacionDetalleReducers.ts'
import { SENDER_TYPE_GUIDS } from '../../src/modules/recepcionista/types/escalaciones.types.ts'
import type { ChatMessageItem } from '../../src/modules/recepcionista/types/escalaciones.types.ts'
import type { ChatMessageReceivedPayload } from '../../src/global/notifications/realtimeChatTypes.ts'

// Construye un mensaje optimista del asesor (status sending)
function buildOptimisticAgentMessage(
  overrides: Partial<ChatMessageItem> = {},
): ChatMessageItem {
  return {
    id: 'temp-1730000000000',
    conversationId: 'conv-race-1',
    senderTypeId: SENDER_TYPE_GUIDS.HUMAN_AGENT,
    senderRole: 'human_agent',
    senderLabel: 'Asesor (Tú)',
    content: 'Hola',
    createdAt: '2026-09-16T15:00:00.000Z',
    timeLabel: '10:00 a. m.',
    status: 'sending',
    ...overrides,
  }
}

// Construye el mensaje real que devolvería sendAgentMessage
function buildRealAgentMessage(
  overrides: Partial<ChatMessageItem> = {},
): ChatMessageItem {
  return {
    id: 'msg-real-001',
    conversationId: 'conv-race-1',
    senderTypeId: SENDER_TYPE_GUIDS.HUMAN_AGENT,
    senderRole: 'human_agent',
    senderLabel: 'Asesor (Tú)',
    content: 'Hola',
    createdAt: '2026-09-16T15:00:01.000Z',
    timeLabel: '10:00 a. m.',
    status: 'sent',
    ...overrides,
  }
}

test('carrera SignalR antes que HTTP: el hilo termina con un solo mensaje del asesor', () => {
  const tempId = 'temp-1730000000000'
  const optimistic = buildOptimisticAgentMessage({ id: tempId })
  let thread: ChatMessageItem[] = [optimistic]

  // 1) Llega SignalR con el id real mientras el optimista sigue en 'sending'
  const signalRPayload: ChatMessageReceivedPayload = {
    messageId: 'msg-real-001',
    conversationId: 'conv-race-1',
    senderType: SENDER_TYPE_GUIDS.HUMAN_AGENT,
    senderName: 'Carlos Méndez',
    content: 'Hola',
    sentAt: '2026-09-16T15:00:01.000Z',
  }

  thread = applyRealtimeMessageToThread(thread, signalRPayload)

  assert.equal(thread.length, 1, 'SignalR debe reconciliar el optimista, no agregar otro')
  assert.equal(thread[0]!.id, 'msg-real-001')
  assert.equal(thread[0]!.status, 'sent')
  assert.equal(thread[0]!.content, 'Hola')

  // 2) Llega la respuesta HTTP del propio envío
  const httpMessage = buildRealAgentMessage()
  thread = applySendHttpResponseToThread(thread, tempId, httpMessage)

  assert.equal(thread.length, 1, 'HTTP no debe reinsertar si SignalR ya reconcilió')
  assert.equal(thread[0]!.id, 'msg-real-001')
  assert.equal(thread.filter((m) => m.content === 'Hola').length, 1)
})

test('orden normal HTTP antes que SignalR: un solo mensaje sin duplicar', () => {
  const tempId = 'temp-1730000000001'
  const optimistic = buildOptimisticAgentMessage({ id: tempId })
  let thread: ChatMessageItem[] = [optimistic]

  // 1) HTTP responde y reemplaza el tempId
  const httpMessage = buildRealAgentMessage({ id: 'msg-real-002' })
  thread = applySendHttpResponseToThread(thread, tempId, httpMessage)

  assert.equal(thread.length, 1)
  assert.equal(thread[0]!.id, 'msg-real-002')
  assert.equal(thread[0]!.status, 'sent')

  // 2) SignalR llega después con el mismo id real
  const signalRPayload: ChatMessageReceivedPayload = {
    messageId: 'msg-real-002',
    conversationId: 'conv-race-1',
    senderType: SENDER_TYPE_GUIDS.HUMAN_AGENT,
    content: 'Hola',
    sentAt: '2026-09-16T15:00:01.000Z',
  }

  thread = applyRealtimeMessageToThread(thread, signalRPayload)

  assert.equal(thread.length, 1, 'Deduplicación por id real debe seguir funcionando')
  assert.equal(thread[0]!.id, 'msg-real-002')
})

test('mensaje de cliente por SignalR no se confunde con el optimista del asesor', () => {
  const optimistic = buildOptimisticAgentMessage({ content: 'Hola' })
  let thread: ChatMessageItem[] = [optimistic]

  const clientPayload: ChatMessageReceivedPayload = {
    messageId: 'msg-client-001',
    conversationId: 'conv-race-1',
    senderType: SENDER_TYPE_GUIDS.CLIENT,
    senderName: 'Carolina',
    content: 'Hola',
    sentAt: '2026-09-16T15:00:02.000Z',
  }

  thread = applyRealtimeMessageToThread(thread, clientPayload)

  assert.equal(thread.length, 2, 'El mensaje del cliente debe agregarse aparte')
  assert.equal(thread[0]!.status, 'sending')
  assert.equal(thread[0]!.senderRole, 'human_agent')
  assert.equal(thread[1]!.id, 'msg-client-001')
  assert.equal(thread[1]!.senderRole, 'client')
})

test('mensaje de otro agente sin optimista pendiente se agrega normalmente', () => {
  const existing: ChatMessageItem = {
    id: 'msg-prev',
    conversationId: 'conv-race-1',
    senderTypeId: SENDER_TYPE_GUIDS.CLIENT,
    senderRole: 'client',
    senderLabel: 'Carolina',
    content: 'Necesito ayuda',
    createdAt: '2026-09-16T14:59:00.000Z',
    timeLabel: '9:59 a. m.',
    status: 'sent',
  }

  const payload: ChatMessageReceivedPayload = {
    messageId: 'msg-other-agent',
    conversationId: 'conv-race-1',
    senderType: SENDER_TYPE_GUIDS.HUMAN_AGENT,
    senderName: 'Otro Asesor',
    content: 'Buenos días',
    sentAt: '2026-09-16T15:01:00.000Z',
  }

  const thread = applyRealtimeMessageToThread([existing], payload)

  assert.equal(thread.length, 2)
  assert.equal(thread[1]!.id, 'msg-other-agent')
  assert.equal(thread[1]!.content, 'Buenos días')
  assert.equal(thread[1]!.status, 'sent')
})
