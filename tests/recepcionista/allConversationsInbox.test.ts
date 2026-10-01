import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildAllConversationsDirectory,
  buildEscalatedDirectory,
  collapseConversationsByClient,
} from '../../src/modules/recepcionista/services/recepEscalacionesService.ts'
import {
  ESCALATION_STATUS_GUIDS,
  type ChatConversationResponseDto,
  type ChatEscalationResponseDto,
} from '../../src/modules/recepcionista/types/escalaciones.types.ts'

test('Bandeja Todas: muestra todas las conversaciones (escaladas y no escaladas) por defecto', () => {
  const now = new Date('2026-09-14T12:00:00.000Z')

  const conversations: ChatConversationResponseDto[] = [
    {
      id: 'conv-1',
      clientId: 'cli-1',
      clientName: 'Carlos Méndez',
      channel: 'web',
      createdAt: '2026-09-14T10:00:00.000Z',
      lastMessageAt: '2026-09-14T11:00:00.000Z',
      lastMessage: 'Hola, consulta sobre citas',
    },
    {
      id: 'conv-2',
      clientId: 'cli-2',
      clientName: 'María Pérez',
      channel: 'telegram',
      createdAt: '2026-09-14T10:30:00.000Z',
      lastMessageAt: '2026-09-14T11:15:00.000Z',
      lastMessage: 'Mi mascota tiene tos',
    },
  ]

  const escalations: ChatEscalationResponseDto[] = [
    {
      id: 'esc-2',
      chatConversationId: 'conv-2',
      reason: 'Tos canina persistente',
      escalationStatusId: ESCALATION_STATUS_GUIDS.PENDING,
      createdAt: '2026-09-14T11:15:00.000Z',
      resolvedAt: null,
    },
  ]

  const payload = buildAllConversationsDirectory(conversations, escalations, now)

  assert.equal(payload.totalCount, 2)
  assert.equal(payload.items.length, 2)

  const unescalated = payload.items.find((i) => i.conversationId === 'conv-1')
  const escalated = payload.items.find((i) => i.conversationId === 'conv-2')

  // Conversación no escalada está presente
  assert.ok(unescalated)
  assert.equal(unescalated?.escalationId, null)
  assert.equal(unescalated?.inboxBadge, null)
  assert.equal(unescalated?.lastMessage, 'Hola, consulta sobre citas')

  // Conversación escalada mantiene su estado y badge
  assert.ok(escalated)
  assert.equal(escalated?.escalationId, 'esc-2')
  assert.equal(escalated?.inboxBadge, 'esperando_asesor')
  assert.equal(escalated?.status, 'Pendiente')
})

test('Bandeja Todas: una conversación de usuario invitado aparece desde su primer mensaje', () => {
  const now = new Date('2026-09-14T12:00:00.000Z')

  const conversations: ChatConversationResponseDto[] = [
    {
      id: 'conv-guest-first-msg',
      clientId: null,
      clientName: null,
      clientPhone: null,
      channel: 'web',
      createdAt: '2026-09-14T11:59:00.000Z',
      lastMessageAt: '2026-09-14T11:59:00.000Z',
      lastMessage: 'Buenas tardes, primera consulta sin estar registrado',
    },
  ]

  const payload = buildAllConversationsDirectory(conversations, [], now)

  assert.equal(payload.totalCount, 1)
  const guestItem = payload.items[0]
  assert.ok(guestItem)
  assert.equal(guestItem?.conversationId, 'conv-guest-first-msg')
  assert.equal(guestItem?.clientName, 'Usuario invitado')
  assert.equal(guestItem?.lastMessage, 'Buenas tardes, primera consulta sin estar registrado')
  assert.equal(guestItem?.channel, 'Web')
})

test('Bandeja Escaladas: solo lista conversaciones con escalamiento activo', () => {
  const now = new Date('2026-09-14T12:00:00.000Z')

  const conversations: ChatConversationResponseDto[] = [
    {
      id: 'conv-1',
      clientName: 'Solo Chatbot',
      channel: 'web',
      createdAt: '2026-09-14T10:00:00.000Z',
      lastMessage: 'Información general',
    },
    {
      id: 'conv-2',
      clientName: 'Escalada',
      channel: 'telegram',
      createdAt: '2026-09-14T10:30:00.000Z',
      lastMessage: 'Atención requerida',
    },
  ]

  const escalations: ChatEscalationResponseDto[] = [
    {
      id: 'esc-2',
      chatConversationId: 'conv-2',
      reason: 'Atención médica',
      escalationStatusId: ESCALATION_STATUS_GUIDS.IN_PROGRESS,
      createdAt: '2026-09-14T10:30:00.000Z',
      resolvedAt: null,
    },
  ]

  const escalatedPayload = buildEscalatedDirectory(conversations, escalations, now)
  assert.equal(escalatedPayload.totalCount, 1)
  assert.equal(escalatedPayload.items[0]?.conversationId, 'conv-2')
  assert.equal(escalatedPayload.items[0]?.status, 'En atención')
})

test('collapseConversationsByClient agrupa historial del mismo cliente sin perder mensajes anteriores', () => {
  const conversations: ChatConversationResponseDto[] = [
    {
      id: 'c-old',
      clientId: 'client-100',
      clientName: 'Laura Ospina',
      createdAt: '2026-09-10T10:00:00.000Z',
      lastMessageAt: '2026-09-10T10:15:00.000Z',
      lastMessage: 'Mensaje de hace días',
    },
    {
      id: 'c-new',
      clientId: 'client-100',
      clientName: 'Laura Ospina',
      createdAt: '2026-09-14T11:00:00.000Z',
      lastMessageAt: '2026-09-14T11:05:00.000Z',
      lastMessage: 'Mensaje reciente de hoy',
    },
  ]

  const rawItems = conversations.map((c) => ({
    id: c.id,
    conversationId: c.id,
    escalationId: null,
    clientName: c.clientName!,
    clientPhone: null,
    channel: 'Web' as const,
    channelRaw: 'web',
    lastMessage: c.lastMessage!,
    lastMessageAt: c.lastMessageAt!,
    lastMessageTimeLabel: '11:05',
    waitingTimeLabel: 'Hace 5 min',
    waitingMinutes: 5,
    status: 'Pendiente' as const,
    createdAt: c.createdAt,
  }))

  const collapsed = collapseConversationsByClient(conversations, rawItems)
  assert.equal(collapsed.length, 1)
  assert.equal(collapsed[0].conversationId, 'c-new')
  assert.equal(collapsed[0].lastMessage, 'Mensaje reciente de hoy')
  assert.deepEqual(collapsed[0].relatedConversationIds, ['c-old', 'c-new'])
})
