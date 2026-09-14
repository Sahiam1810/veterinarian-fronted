import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import { fetchRecepHomeDashboard } from '../../src/modules/recepcionista/services/recepHomeService.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() { return store.size },
    clear() { store.clear() },
    getItem(key) { return store.get(key) ?? null },
    key(index) { return [...store.keys()][index] ?? null },
    removeItem(key) { store.delete(key) },
    setItem(key, value) { store.set(key, value) },
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: memoryStorage })
  localStorage.setItem(
    'huellitas_auth_tokens',
    JSON.stringify({
      accessToken: 'test-token',
      accessTokenExpiresAt: '2099-01-01T00:00:00Z',
      refreshToken: 'test-refresh',
    }),
  )
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

function mockFetch(appointments: Array<{ id: string; scheduledStart: string }>) {
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const urlStr = String(input)
    if (urlStr.includes('/api/Appointments')) {
      return Response.json(appointments)
    }
    if (urlStr.includes('/api/auth/me')) {
      return new Response('Not found', { status: 404 })
    }
    return Response.json([])
  }
}

// Bug: cuando no hay citas reales para hoy pero sí existen citas de otras
// fechas en el sistema, el dashboard las mostraba como si fueran de hoy
// (fallback `appointments.slice(0, 8)`). Debe quedar vacío, no inventar datos.
test('fetchRecepHomeDashboard no muestra citas de otros días cuando no hay ninguna hoy', async () => {
  mockFetch([
    { id: 'apt-ayer', scheduledStart: '2020-01-01T09:00:00.000Z' },
    { id: 'apt-manana', scheduledStart: '2099-01-01T09:00:00.000Z' },
  ])

  const dashboard = await fetchRecepHomeDashboard()

  assert.equal(dashboard.appointments.length, 0)
  assert.equal(dashboard.stats.citasDelDia, 0)
  assert.equal(dashboard.totalAppointmentsToday, 0)
})

test('fetchRecepHomeDashboard sí muestra las citas cuando hay citas reales hoy', async () => {
  // Mismo criterio que el servicio (año/mes/día locales) para no depender
  // de la zona horaria en la que corra la prueba.
  const now = new Date()
  const todayPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const todayIso = `${todayPrefix}T09:00:00.000Z`
  mockFetch([
    { id: 'apt-hoy', scheduledStart: todayIso },
    { id: 'apt-otro-dia', scheduledStart: '2020-01-01T09:00:00.000Z' },
  ])

  const dashboard = await fetchRecepHomeDashboard()

  assert.equal(dashboard.appointments.length, 1)
  assert.equal(dashboard.appointments[0]?.id, 'apt-hoy')
})
