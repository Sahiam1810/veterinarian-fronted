import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ensureSignalRAccessToken,
  isAccessTokenExpiredOrNearExpiry,
} from '../../src/global/notifications/ensureSignalRAccessToken.ts'
import { reconnectNotificationsAfterClose } from '../../src/global/notifications/notificationsRealtimeReconnect.ts'

function accessToken(payload: Record<string, unknown>): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

test('detecta JWT vigente y JWT vencido o próximo a vencer', () => {
  const nowMs = Date.parse('2026-09-11T15:00:00.000Z')
  const valid = accessToken({ exp: Math.floor(nowMs / 1000) + 3600 })
  const nearExpiry = accessToken({ exp: Math.floor(nowMs / 1000) + 30 })
  const expired = accessToken({ exp: Math.floor(nowMs / 1000) - 10 })

  assert.equal(isAccessTokenExpiredOrNearExpiry(valid, nowMs), false)
  assert.equal(isAccessTokenExpiredOrNearExpiry(nearExpiry, nowMs), true)
  assert.equal(isAccessTokenExpiredOrNearExpiry(expired, nowMs), true)
  assert.equal(isAccessTokenExpiredOrNearExpiry('not-a-jwt', nowMs), true)
})

test('ensureSignalRAccessToken no refresca si el JWT sigue vigente', async () => {
  const nowMs = Date.parse('2026-09-11T15:00:00.000Z')
  const token = accessToken({ exp: Math.floor(nowMs / 1000) + 3600 })
  let refreshCalls = 0

  const result = await ensureSignalRAccessToken({
    getAccessToken: () => token,
    refreshSession: async () => {
      refreshCalls += 1
      return 'refreshed'
    },
    now: () => nowMs,
  })

  assert.equal(result, token)
  assert.equal(refreshCalls, 0)
})

test('ensureSignalRAccessToken llama refreshSession cuando el token está vencido', async () => {
  const nowMs = Date.parse('2026-09-11T15:00:00.000Z')
  const expired = accessToken({ exp: Math.floor(nowMs / 1000) - 60 })
  const refreshed = accessToken({ exp: Math.floor(nowMs / 1000) + 3600 })

  const result = await ensureSignalRAccessToken({
    getAccessToken: () => expired,
    refreshSession: async () => refreshed,
    now: () => nowMs,
  })

  assert.equal(result, refreshed)
})

test('tras un cierre definitivo intenta reconectar con refreshSession y start', async () => {
  const sleeps: number[] = []
  let refreshCalls = 0
  let startCalls = 0
  let cancelled = false

  await reconnectNotificationsAfterClose({
    isCancelled: () => cancelled,
    ensureToken: async () => {
      refreshCalls += 1
      return 'token-refrescado'
    },
    startConnection: async () => {
      startCalls += 1
      if (startCalls === 1) {
        throw new Error('backend aún caído')
      }
    },
    sleep: async (ms) => {
      sleeps.push(ms)
    },
    backoffMs: [10, 20],
  })

  assert.deepEqual(sleeps, [10, 20])
  assert.equal(refreshCalls, 2)
  assert.equal(startCalls, 2)
})

test('deja de reintentar cuando el efecto se cancela', async () => {
  let refreshCalls = 0
  let startCalls = 0
  let cancelled = false

  await reconnectNotificationsAfterClose({
    isCancelled: () => cancelled,
    ensureToken: async () => {
      refreshCalls += 1
      cancelled = true
      return 'token'
    },
    startConnection: async () => {
      startCalls += 1
    },
    sleep: async () => undefined,
    backoffMs: [5],
  })

  assert.equal(refreshCalls, 1)
  assert.equal(startCalls, 0)
})
