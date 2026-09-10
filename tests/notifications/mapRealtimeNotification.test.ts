import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isRealtimeNotificationUnread,
  mapRealtimeNotificationPayload,
  prependNotificationById,
} from '../../src/global/notifications/mapRealtimeNotification.ts'
import { mapNotificationToNotificacion } from '../../src/modules/superadmin/utils/superAdminApiMappers.ts'

// Payload simulado de ReceiveNotification (camelCase como serializa el API).
const receiveNotificationPayload = {
  id: 'n-10000000-0000-0000-0000-000000000001',
  userId: 'user-vet-001',
  userFullName: 'Dr. Carlos Veterinario',
  appointmentId: 'a-10000000-0000-0000-0000-000000000001',
  message: 'Recordatorio: cita de Luna mañana a las 09:00',
  sentAt: '2026-09-10T14:30:00.000Z',
  status: 'Pendiente',
  type: 'Recordatorio',
  createdAt: '2026-09-10T14:30:00.000Z',
  updatedAt: null,
}

// Réplica local del contrato de mapVetNotification (sin importar vetHomeService → vetHttp).
function mapVetNotificationShape(notification: {
  id: string
  message?: string | null
  sentAt: string
  status?: string | null
  type?: string | null
  appointmentId: string
}) {
  return {
    id: notification.id,
    message: notification.message || 'Notificación del sistema.',
    type: notification.type || 'General',
    isRead: !isRealtimeNotificationUnread(notification.status),
    appointmentId: notification.appointmentId,
  }
}

test('mapRealtimeNotificationPayload normaliza ReceiveNotification al contrato API', () => {
  const mapped = mapRealtimeNotificationPayload(receiveNotificationPayload)
  assert.ok(mapped)
  assert.equal(mapped.id, receiveNotificationPayload.id)
  assert.equal(mapped.userId, receiveNotificationPayload.userId)
  assert.equal(mapped.appointmentId, receiveNotificationPayload.appointmentId)
  assert.equal(mapped.message, receiveNotificationPayload.message)
  assert.equal(mapped.status, 'Pendiente')
  assert.equal(mapped.type, 'Recordatorio')
})

test('payload inválido o incompleto se descarta', () => {
  assert.equal(mapRealtimeNotificationPayload(null), null)
  assert.equal(mapRealtimeNotificationPayload({ id: 'solo-id' }), null)
  assert.equal(mapRealtimeNotificationPayload('texto'), null)
})

test('mapped payload alimenta mapNotificationToNotificacion (SuperAdmin)', () => {
  const realtime = mapRealtimeNotificationPayload(receiveNotificationPayload)
  assert.ok(realtime)

  const ui = mapNotificationToNotificacion({
    id: realtime.id,
    userId: realtime.userId,
    userFullName: realtime.userFullName,
    appointmentId: realtime.appointmentId,
    message: realtime.message,
    sentAt: realtime.sentAt,
    status: realtime.status,
    type: realtime.type,
    createdAt: realtime.createdAt,
    updatedAt: realtime.updatedAt,
  })

  assert.equal(ui.id, realtime.id)
  assert.equal(ui.message, receiveNotificationPayload.message)
  assert.equal(ui.type, 'Recordatorio')
  assert.equal(ui.isRead, false)
  assert.equal(ui.appointmentId, receiveNotificationPayload.appointmentId)
})

test('mapped payload alimenta la forma de mapVetNotification (Veterinario)', () => {
  const realtime = mapRealtimeNotificationPayload(receiveNotificationPayload)
  assert.ok(realtime)

  const ui = mapVetNotificationShape({
    id: realtime.id,
    message: realtime.message,
    sentAt: realtime.sentAt,
    status: realtime.status,
    type: realtime.type,
    appointmentId: realtime.appointmentId,
  })

  assert.equal(ui.id, realtime.id)
  assert.equal(ui.message, receiveNotificationPayload.message)
  assert.equal(ui.type, 'Recordatorio')
  assert.equal(ui.isRead, false)
  assert.equal(ui.appointmentId, receiveNotificationPayload.appointmentId)
  assert.equal(isRealtimeNotificationUnread(realtime.status), true)
})

test('prependNotificationById inserta al inicio y evita duplicados', () => {
  const first = mapRealtimeNotificationPayload(receiveNotificationPayload)!
  const list = prependNotificationById([], first)
  assert.equal(list.length, 1)

  const again = prependNotificationById(list, first)
  assert.equal(again.length, 1)
  assert.equal(again[0].id, first.id)

  const second = mapRealtimeNotificationPayload({
    ...receiveNotificationPayload,
    id: 'n-10000000-0000-0000-0000-000000000002',
    message: 'Otra alerta',
  })!
  const withSecond = prependNotificationById(list, second)
  assert.equal(withSecond.length, 2)
  assert.equal(withSecond[0].id, second.id)
})
