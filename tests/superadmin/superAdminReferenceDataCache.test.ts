import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import {
  getCachedReferenceData,
  invalidateAllReferenceData,
  invalidateReferenceData,
} from '../../src/modules/superadmin/cache/superAdminReferenceDataCache.ts'

beforeEach(() => {
  invalidateAllReferenceData()
})

afterEach(() => {
  invalidateAllReferenceData()
})

test('segunda llamada con datos vigentes no vuelve a ejecutar el loader', async () => {
  let loaderCalls = 0
  const nowMs = { value: 1_000 }

  const first = await getCachedReferenceData(
    'species',
    async () => {
      loaderCalls += 1
      return [{ id: '1', name: 'Canino' }]
    },
    { ttlMs: 60_000, now: () => nowMs.value },
  )

  nowMs.value = 1_000 + 10_000
  const second = await getCachedReferenceData(
    'species',
    async () => {
      loaderCalls += 1
      return [{ id: '2', name: 'Felino' }]
    },
    { ttlMs: 60_000, now: () => nowMs.value },
  )

  assert.equal(loaderCalls, 1)
  assert.deepEqual(first, second)
  assert.equal(second[0]?.name, 'Canino')
})

test('tras invalidar vuelve a ejecutar el loader', async () => {
  let loaderCalls = 0

  await getCachedReferenceData('roles', async () => {
    loaderCalls += 1
    return [{ id: 'r1', name: 'Admin' }]
  })

  invalidateReferenceData('roles')

  const again = await getCachedReferenceData('roles', async () => {
    loaderCalls += 1
    return [{ id: 'r2', name: 'Veterinario' }]
  })

  assert.equal(loaderCalls, 2)
  assert.equal(again[0]?.name, 'Veterinario')
})

test('llamadas concurrentes comparten una sola carga in-flight', async () => {
  let loaderCalls = 0
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })

  const loader = async () => {
    loaderCalls += 1
    await gate
    return [{ id: 'u1', name: 'Samuel' }]
  }

  const p1 = getCachedReferenceData('users', loader)
  const p2 = getCachedReferenceData('users', loader)
  release()
  const [a, b] = await Promise.all([p1, p2])

  assert.equal(loaderCalls, 1)
  assert.deepEqual(a, b)
})
