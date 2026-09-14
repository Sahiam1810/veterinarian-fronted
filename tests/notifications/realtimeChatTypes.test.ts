import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mapRealtimeChatEscalationCreated,
  mapRealtimeChatMessageReceived,
  mapRealtimeChatEscalationResolved,
} from '../../src/global/notifications/realtimeChatTypes.ts'

test('mapRealtimeChatEscalationCreated valida y normaliza payload completo', () => {
  const raw = {
    escalationId: 'e-10000000-0000-0000-0000-000000000001',
    conversationId: 'c-10000000-0000-0000-0000-000000000001',
    clientId: 'cli-001',
    clientName: 'Carlos Mendoza',
    clientPhone: '+57 300 123 4567',
    reason: 'Consulta sobre vacuna rabia',
    priority: 'HIGH',
    status: 'PENDING',
    channel: 'TELEGRAM',
    createdAt: '2026-03-31T15:30:00.000Z',
    lastMessage: 'Necesito hablar con alguien por favor',
  }

  const mapped = mapRealtimeChatEscalationCreated(raw)
  assert.ok(mapped)
  assert.equal(mapped.escalationId, raw.escalationId)
  assert.equal(mapped.conversationId, raw.conversationId)
  assert.equal(mapped.clientName, 'Carlos Mendoza')
  assert.equal(mapped.priority, 'HIGH')
  assert.equal(mapped.channel, 'TELEGRAM')
  assert.equal(mapped.lastMessage, 'Necesito hablar con alguien por favor')
})

test('mapRealtimeChatEscalationCreated descarta objetos inválidos o sin IDs', () => {
  assert.equal(mapRealtimeChatEscalationCreated(null), null)
  assert.equal(mapRealtimeChatEscalationCreated(undefined), null)
  assert.equal(mapRealtimeChatEscalationCreated('string'), null)
  assert.equal(mapRealtimeChatEscalationCreated({ escalationId: 'solo-escalation' }), null)
  assert.equal(mapRealtimeChatEscalationCreated({ conversationId: 'solo-conv' }), null)
})

test('mapRealtimeChatMessageReceived normaliza mensaje entrante', () => {
  const raw = {
    messageId: 'm-10000000-0000-0000-0000-000000000001',
    conversationId: 'c-10000000-0000-0000-0000-000000000001',
    senderType: 'CLIENT',
    senderName: 'Carlos Mendoza',
    content: 'Hola, ¿hay alguien disponible?',
    sentAt: '2026-03-31T15:35:00.000Z',
    messageType: 'TEXT',
  }

  const mapped = mapRealtimeChatMessageReceived(raw)
  assert.ok(mapped)
  assert.equal(mapped.messageId, raw.messageId)
  assert.equal(mapped.conversationId, raw.conversationId)
  assert.equal(mapped.content, 'Hola, ¿hay alguien disponible?')
  assert.equal(mapped.senderType, 'CLIENT')
})

test('mapRealtimeChatMessageReceived descarta mensajes vacíos o sin IDs', () => {
  assert.equal(mapRealtimeChatMessageReceived(null), null)
  assert.equal(mapRealtimeChatMessageReceived({ messageId: 'm-1', conversationId: 'c-1', content: '   ' }), null)
  assert.equal(mapRealtimeChatMessageReceived({ messageId: 'm-1', content: 'hola' }), null)
})

test('mapRealtimeChatEscalationResolved normaliza evento de resolución', () => {
  const raw = {
    escalationId: 'e-10000000-0000-0000-0000-000000000001',
    conversationId: 'c-10000000-0000-0000-0000-000000000001',
    resolvedBy: 'usr-agent-001',
    resolvedAt: '2026-03-31T15:40:00.000Z',
    resolutionNotes: 'Atendido vía telefónica',
  }

  const mapped = mapRealtimeChatEscalationResolved(raw)
  assert.ok(mapped)
  assert.equal(mapped.escalationId, raw.escalationId)
  assert.equal(mapped.conversationId, raw.conversationId)
  assert.equal(mapped.resolutionNotes, 'Atendido vía telefónica')
})

test('mapRealtimeChatEscalationResolved descarta payload sin escalationId', () => {
  assert.equal(mapRealtimeChatEscalationResolved(null), null)
  assert.equal(mapRealtimeChatEscalationResolved({ conversationId: 'solo-conv' }), null)
})
