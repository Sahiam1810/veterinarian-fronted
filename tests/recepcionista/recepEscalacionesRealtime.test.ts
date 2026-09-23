import assert from 'node:assert/strict'
import test from 'node:test'

import type { EscalatedConversationListItem } from '../../src/modules/recepcionista/types/index.ts'
import {
  resolveChannel,
  resolveStatus,
  formatWaitingTime,
} from '../../src/modules/recepcionista/services/recepEscalacionesService.ts'
import type {
  ChatEscalationCreatedPayload,
  ChatMessageReceivedPayload,
  ChatEscalationResolvedPayload,
} from '../../src/global/notifications/index.ts'

// Réplica del reductor de estado en memoria usado en useRecepEscalaciones
function handleEscalationCreatedReducer(
  currentItems: EscalatedConversationListItem[],
  payload: ChatEscalationCreatedPayload,
): EscalatedConversationListItem[] {
  if (
    currentItems.some(
      (i) =>
        i.escalationId === payload.escalationId ||
        i.conversationId === payload.conversationId,
    )
  ) {
    return currentItems
  }

  const waitingInfo = formatWaitingTime(payload.createdAt)

  const newItem: EscalatedConversationListItem = {
    id: payload.escalationId,
    conversationId: payload.conversationId,
    escalationId: payload.escalationId,
    clientName: payload.clientName || 'Cliente',
    clientPhone: payload.clientPhone ?? null,
    channel: resolveChannel(payload.channel),
    channelRaw: payload.channel || 'Telegram',
    lastMessage:
      payload.lastMessage || payload.reason || 'Solicitud de asesor humano',
    lastMessageAt: payload.createdAt,
    lastMessageTimeLabel: '10:30',
    waitingTimeLabel: waitingInfo.label,
    waitingMinutes: waitingInfo.minutes,
    status: resolveStatus(payload.status),
    statusId: payload.status ?? null,
    createdAt: payload.createdAt,
    reason: payload.reason ?? null,
  }

  return [newItem, ...currentItems]
}

function handleMessageReceivedReducer(
  currentItems: EscalatedConversationListItem[],
  payload: ChatMessageReceivedPayload,
): EscalatedConversationListItem[] {
  return currentItems.map((item) => {
    if (item.conversationId === payload.conversationId) {
      return {
        ...item,
        lastMessage: payload.content,
        lastMessageAt: payload.sentAt,
        lastMessageTimeLabel: '10:35',
      }
    }
    return item
  })
}

function handleEscalationResolvedReducer(
  currentItems: EscalatedConversationListItem[],
  payload: ChatEscalationResolvedPayload,
): EscalatedConversationListItem[] {
  return currentItems.filter(
    (i) =>
      i.escalationId !== payload.escalationId &&
      (!payload.conversationId || i.conversationId !== payload.conversationId),
  )
}

test('handleEscalationCreatedReducer inserta la nueva conversación al inicio', () => {
  const initial: EscalatedConversationListItem[] = [
    {
      id: 'e-1',
      conversationId: 'c-1',
      escalationId: 'e-1',
      clientName: 'Juan',
      clientPhone: '300111',
      channel: 'Telegram',
      channelRaw: 'TELEGRAM',
      status: 'Pendiente',
      waitingTimeLabel: 'Hace 5 min',
      waitingMinutes: 5,
      lastMessage: 'Hola',
      lastMessageAt: new Date().toISOString(),
      lastMessageTimeLabel: '10:00',
      createdAt: new Date().toISOString(),
      reason: 'Duda',
    },
  ]

  const payload: ChatEscalationCreatedPayload = {
    escalationId: 'e-2',
    conversationId: 'c-2',
    clientName: 'Ana Sofía',
    status: 'PENDING',
    channel: 'TELEGRAM',
    createdAt: new Date().toISOString(),
    lastMessage: 'Necesito una cita urgente',
  }

  const updated = handleEscalationCreatedReducer(initial, payload)
  assert.equal(updated.length, 2)
  assert.equal(updated[0].escalationId, 'e-2')
  assert.equal(updated[0].clientName, 'Ana Sofía')
  assert.equal(updated[1].escalationId, 'e-1')
})

test('handleEscalationCreatedReducer previene duplicados en memoria', () => {
  const initial: EscalatedConversationListItem[] = [
    {
      id: 'e-1',
      conversationId: 'c-1',
      escalationId: 'e-1',
      clientName: 'Juan',
      clientPhone: '300111',
      channel: 'Telegram',
      channelRaw: 'TELEGRAM',
      status: 'Pendiente',
      waitingTimeLabel: 'Hace 5 min',
      waitingMinutes: 5,
      lastMessage: 'Hola',
      lastMessageAt: new Date().toISOString(),
      lastMessageTimeLabel: '10:00',
      createdAt: new Date().toISOString(),
      reason: 'Duda',
    },
  ]

  const payload: ChatEscalationCreatedPayload = {
    escalationId: 'e-1',
    conversationId: 'c-1',
    clientName: 'Juan',
    createdAt: new Date().toISOString(),
  }

  const updated = handleEscalationCreatedReducer(initial, payload)
  assert.equal(updated.length, 1)
})

test('handleMessageReceivedReducer actualiza el último mensaje de la conversación', () => {
  const initial: EscalatedConversationListItem[] = [
    {
      id: 'e-1',
      conversationId: 'c-1',
      escalationId: 'e-1',
      clientName: 'Juan',
      clientPhone: '300111',
      channel: 'Telegram',
      channelRaw: 'TELEGRAM',
      status: 'Pendiente',
      waitingTimeLabel: 'Hace 5 min',
      waitingMinutes: 5,
      lastMessage: 'Mensaje viejo',
      lastMessageAt: new Date().toISOString(),
      lastMessageTimeLabel: '10:00',
      createdAt: new Date().toISOString(),
      reason: 'Duda',
    },
  ]

  const payload: ChatMessageReceivedPayload = {
    messageId: 'm-2',
    conversationId: 'c-1',
    senderType: 'CLIENT',
    content: 'Nuevo mensaje del cliente en vivo',
    sentAt: new Date().toISOString(),
  }

  const updated = handleMessageReceivedReducer(initial, payload)
  assert.equal(updated.length, 1)
  assert.equal(updated[0].lastMessage, 'Nuevo mensaje del cliente en vivo')
})

test('handleEscalationResolvedReducer elimina la conversación de la bandeja', () => {
  const initial: EscalatedConversationListItem[] = [
    {
      id: 'e-1',
      conversationId: 'c-1',
      escalationId: 'e-1',
      clientName: 'Juan',
      clientPhone: '300111',
      channel: 'Telegram',
      channelRaw: 'TELEGRAM',
      status: 'Pendiente',
      waitingTimeLabel: 'Hace 5 min',
      waitingMinutes: 5,
      lastMessage: 'Hola',
      lastMessageAt: new Date().toISOString(),
      lastMessageTimeLabel: '10:00',
      createdAt: new Date().toISOString(),
      reason: 'Duda',
    },
    {
      id: 'e-2',
      conversationId: 'c-2',
      escalationId: 'e-2',
      clientName: 'Pedro',
      clientPhone: '300222',
      channel: 'Web',
      channelRaw: 'WEB',
      status: 'Pendiente',
      waitingTimeLabel: 'Hace 10 min',
      waitingMinutes: 10,
      lastMessage: 'Hola 2',
      lastMessageAt: new Date().toISOString(),
      lastMessageTimeLabel: '10:05',
      createdAt: new Date().toISOString(),
      reason: 'Duda',
    },
  ]

  const payload: ChatEscalationResolvedPayload = {
    escalationId: 'e-1',
    conversationId: 'c-1',
    resolvedAt: new Date().toISOString(),
  }

  const updated = handleEscalationResolvedReducer(initial, payload)
  assert.equal(updated.length, 1)
  assert.equal(updated[0].escalationId, 'e-2')
})
