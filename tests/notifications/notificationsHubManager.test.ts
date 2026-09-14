import assert from 'node:assert/strict'
import test from 'node:test'

import {
  notificationsHubManager,
  SIGNALR_EVENTS,
  type ChatEscalationCreatedPayload,
  type ChatMessageReceivedPayload,
  type ChatEscalationResolvedPayload,
} from '../../src/global/notifications/index.ts'

test('notificationsHubManager despacha ChatEscalationCreated a suscriptores', () => {
  const received: ChatEscalationCreatedPayload[] = []

  const unsubscribe = notificationsHubManager.subscribeToChatEscalations({
    onEscalationCreated: (payload) => {
      received.push(payload)
    },
  })

  const payload = {
    escalationId: 'esc-test-1',
    conversationId: 'conv-test-1',
    clientName: 'María Pérez',
    priority: 'HIGH',
    status: 'PENDING',
    channel: 'TELEGRAM',
    createdAt: '2026-03-31T15:00:00.000Z',
    lastMessage: 'Mensaje de prueba',
  }

  notificationsHubManager.simulateEscalationCreated(payload)

  assert.equal(received.length, 1)
  assert.equal(received[0].escalationId, 'esc-test-1')
  assert.equal(received[0].clientName, 'María Pérez')

  unsubscribe()

  // Tras desuscribirse no debe recibir nuevos eventos
  notificationsHubManager.simulateEscalationCreated({
    ...payload,
    escalationId: 'esc-test-2',
  })
  assert.equal(received.length, 1)
})

test('notificationsHubManager despacha ChatMessageReceived a suscriptores', () => {
  const received: ChatMessageReceivedPayload[] = []

  const unsubscribe = notificationsHubManager.subscribeToChatEscalations({
    onMessageReceived: (payload) => {
      received.push(payload)
    },
  })

  notificationsHubManager.simulateMessageReceived({
    messageId: 'msg-test-1',
    conversationId: 'conv-test-1',
    senderType: 'CLIENT',
    content: 'Hola asesor',
    sentAt: '2026-03-31T15:05:00.000Z',
  })

  assert.equal(received.length, 1)
  assert.equal(received[0].messageId, 'msg-test-1')
  assert.equal(received[0].content, 'Hola asesor')

  unsubscribe()
})

test('notificationsHubManager despacha ChatEscalationResolved a suscriptores', () => {
  const received: ChatEscalationResolvedPayload[] = []

  const unsubscribe = notificationsHubManager.subscribeToChatEscalations({
    onEscalationResolved: (payload) => {
      received.push(payload)
    },
  })

  notificationsHubManager.simulateEscalationResolved({
    escalationId: 'esc-test-1',
    conversationId: 'conv-test-1',
    resolvedAt: '2026-03-31T15:10:00.000Z',
  })

  assert.equal(received.length, 1)
  assert.equal(received[0].escalationId, 'esc-test-1')

  unsubscribe()
})

test('notificationsHubManager.simulateRealtimeEvent responde a nombres de evento SignalR', () => {
  let escalationHandled = false

  const unsubscribe = notificationsHubManager.subscribeToChatEscalations({
    onEscalationCreated: () => {
      escalationHandled = true
    },
  })

  const handled = notificationsHubManager.simulateRealtimeEvent(
    SIGNALR_EVENTS.CHAT_ESCALATION_CREATED,
    {
      escalationId: 'esc-event-1',
      conversationId: 'conv-event-1',
      createdAt: '2026-03-31T15:00:00.000Z',
    },
  )

  assert.equal(handled, true)
  assert.equal(escalationHandled, true)

  unsubscribe()
})
