import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import {
  buildActionMap,
  buildViewMap,
  resolveCanEditVitals,
} from '../../src/modules/superadmin/utils/buildAdminShellViewMap.ts'
import { canRegisterCitaVitals } from '../../src/modules/superadmin/utils/citaDetalleActions.ts'
import { updateAppointmentVitals } from '../../src/modules/superadmin/services/superAdminAppointmentsService.ts'
import { resolveVitalsSaveError } from '../../src/modules/recepcionista/utils/vitalsSaveError.ts'
import type { MyPermissionsMap } from '../../src/modules/auth/services/myPermissionsService.ts'
import type { EstadoCita } from '../../src/modules/superadmin/types/agendaSuperAdmin.types.ts'

const auxiliarOptions = { id: 'aux-person-1', email: 'auxiliar@huellitas.test', roleId: 'aux-role-1' }

const citasView = { canView: true, canCreate: false, canEdit: false, canDelete: false }
const vitalsEdit = { canView: true, canCreate: false, canEdit: true, canDelete: false }

const openStatuses: EstadoCita[] = ['AGENDADA', 'EN_ESPERA']
const closedStatuses: EstadoCita[] = ['ATENDIDA', 'CANCELADA', 'NO_ASISTIO', 'BLOQUEO']

test('Citas.View + Signos Vitales.Edit: ve la Agenda y puede registrar vitales en citas abiertas', () => {
  const permissions: MyPermissionsMap = { Citas: citasView, 'Signos Vitales': vitalsEdit }

  assert.equal(buildViewMap(permissions, auxiliarOptions).agenda, true)
  const canEditVitals = resolveCanEditVitals(permissions, {})
  assert.equal(canEditVitals, true)

  for (const status of openStatuses) {
    assert.equal(canRegisterCitaVitals(status, canEditVitals), true, status)
  }
  for (const status of closedStatuses) {
    assert.equal(canRegisterCitaVitals(status, canEditVitals), false, status)
  }
})

test('Citas.View sin Signos Vitales.Edit: ve la cita pero no vitales', () => {
  const sinModulo: MyPermissionsMap = { Citas: citasView }
  const soloVer: MyPermissionsMap = {
    Citas: citasView,
    'Signos Vitales': { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }

  for (const permissions of [sinModulo, soloVer]) {
    assert.equal(buildViewMap(permissions, auxiliarOptions).agenda, true)
    const canEditVitals = resolveCanEditVitals(permissions, {})
    assert.equal(canEditVitals, false)
    for (const status of openStatuses) {
      assert.equal(canRegisterCitaVitals(status, canEditVitals), false, status)
    }
  }
})

test('Vitales no dependen de Citas.Edit ni de Clientes.View', () => {
  const agendaEditSinVitales: MyPermissionsMap = {
    Citas: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    Clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }
  assert.equal(buildActionMap(agendaEditSinVitales, auxiliarOptions).agenda.edit, true)
  assert.equal(resolveCanEditVitals(agendaEditSinVitales, {}), false)

  const vitalesSinClientesNiCitasEdit: MyPermissionsMap = {
    Citas: citasView,
    Clientes: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    'Signos Vitales': vitalsEdit,
  }
  assert.equal(buildActionMap(vitalesSinClientesNiCitasEdit, auxiliarOptions).agenda.edit, false)
  assert.equal(resolveCanEditVitals(vitalesSinClientesNiCitasEdit, {}), true)
})

test('Sin permisos cargados: vitales fail-closed; SuperAdmin de plataforma siempre puede', () => {
  assert.equal(resolveCanEditVitals(null, {}), false)
  assert.equal(resolveCanEditVitals({}, {}), false)
  assert.equal(resolveCanEditVitals(null, { isPlatformSuperAdmin: true }), true)
})

test('resolveVitalsSaveError: mensajes específicos de signos vitales por estado HTTP', () => {
  const forbidden = resolveVitalsSaveError({ status: 403, message: 'Forbidden' })
  assert.ok(forbidden.includes('signos vitales'))
  assert.ok(forbidden.includes('Signos Vitales'))
  assert.ok(!forbidden.toLowerCase().includes('agenda'))

  assert.ok(resolveVitalsSaveError({ status: 401 }).includes('signos vitales'))
  assert.ok(resolveVitalsSaveError({ status: 404 }).includes('signos vitales'))
  assert.equal(
    resolveVitalsSaveError({ status: 400, message: 'x', violations: ['El peso debe ser mayor a 0.'] }),
    'Signos vitales no válidos: El peso debe ser mayor a 0.',
  )
  assert.ok(resolveVitalsSaveError({ status: 0 }).includes('signos vitales'))
  assert.ok(resolveVitalsSaveError({ status: 500 }).includes('signos vitales'))
  assert.ok(resolveVitalsSaveError(new Error('boom')).includes('signos vitales'))
})

const originalFetch = globalThis.fetch

beforeEach(() => {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.get(key) ?? null
    },
    key(index) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, value)
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: memoryStorage })
  localStorage.setItem(
    'huellitas_auth_tokens',
    JSON.stringify({
      accessToken: 'test-token-vitals',
      accessTokenExpiresAt: '2099-01-01T00:00:00Z',
      refreshToken: 'test-refresh-vitals',
    }),
  )
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('Error 403 en PATCH /api/Appointments/{id}/vitals: mensaje específico de vitales', async () => {
  const calls: Array<{ url: string; method?: string }> = []
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), method: init?.method })
    return new Response(
      JSON.stringify({ title: 'Forbidden', status: 403 }),
      { status: 403, headers: { 'Content-Type': 'application/problem+json' } },
    )
  }

  let caught: unknown = null
  try {
    await updateAppointmentVitals('cita-123', { weight: 12.5, temperature: 38.4, heartRate: 90, respiratoryRate: 26 })
  } catch (err) {
    caught = err
  }

  assert.equal(calls.length, 1)
  assert.equal(calls[0].method, 'PATCH')
  assert.match(calls[0].url, /\/api\/Appointments\/cita-123\/vitals$/)
  assert.ok(caught, 'el PATCH rechazado debe propagar el error')
  assert.equal((caught as { status?: number }).status, 403)

  const message = resolveVitalsSaveError(caught)
  assert.ok(message.includes('signos vitales'))
  assert.ok(!message.toLowerCase().includes('agenda'))
})
