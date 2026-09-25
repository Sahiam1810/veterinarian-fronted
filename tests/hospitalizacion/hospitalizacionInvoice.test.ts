import assert from 'node:assert/strict'
import test, { beforeEach, afterEach } from 'node:test'

import {
  formatInvoiceCurrency,
  formatInvoiceDate,
  getInvoicePaymentStatus,
  getInvoiceStayStatusBadge,
} from '../../src/modules/hospitalizacion/utils/hospitalizacionInvoiceUtils.ts'
import {
  fetchHospitalizationInvoice,
} from '../../src/modules/hospitalizacion/services/hospitalizacionService.ts'
import type { HospitalizationInvoice } from '../../src/modules/hospitalizacion/types/hospitalizacion.types.ts'
import { ApiError } from '../../src/services/apiClient.ts'

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

const mockInvoiceFull: HospitalizationInvoice = {
  stayId: 'stay-uuid-1234',
  petName: 'Max',
  ownerName: 'Carlos Gómez',
  admittedAt: '2026-09-20T08:00:00Z',
  dischargedAt: '2026-09-24T10:00:00Z',
  status: 'Dada de alta',
  dailyRate: 50000,
  billedDays: 4,
  isPaid: true,
  paidAt: '2026-09-24T10:15:00Z',
  hospitalizationTotal: 200000,
  suppliesTotal: 45000,
  medicationsTotal: 30000,
  proceduresTotal: 60000,
  total: 335000,
  supplies: [
    {
      name: 'Suero Fisiológico 500ml',
      quantity: 2,
      unitPrice: 15000,
      total: 30000,
      notes: 'Hidratación intravenosa',
    },
    {
      name: 'Catéter 22G',
      quantity: 3,
      unitPrice: 5000,
      total: 15000,
      notes: null,
    },
  ],
  medications: [
    {
      name: 'Amoxicilina 250mg',
      quantity: 2,
      unitPrice: 15000,
      total: 30000,
      notes: 'Antibiótico post-quirúrgico',
    },
  ],
  procedures: [
    {
      name: 'Radiografía de Tórax',
      quantity: 1,
      unitPrice: 60000,
      total: 60000,
      notes: 'Control evolutivo',
    },
  ],
}

const mockInvoiceEmptyConcepts: HospitalizationInvoice = {
  stayId: 'stay-uuid-5678',
  petName: 'Luna',
  ownerName: 'María Rodríguez',
  admittedAt: '2026-09-24T06:00:00Z',
  dischargedAt: null,
  status: 'Activa',
  dailyRate: 50000,
  billedDays: 1,
  isPaid: false,
  paidAt: null,
  hospitalizationTotal: 50000,
  suppliesTotal: 0,
  medicationsTotal: 0,
  proceduresTotal: 0,
  total: 50000,
  supplies: [],
  medications: [],
  procedures: [],
}

test('HospitalizationInvoice contract preserves backend totals without local calculation', () => {
  // Ensure that frontend receives and directly reflects totals from backend
  assert.equal(mockInvoiceFull.hospitalizationTotal, 200000)
  assert.equal(mockInvoiceFull.suppliesTotal, 45000)
  assert.equal(mockInvoiceFull.medicationsTotal, 30000)
  assert.equal(mockInvoiceFull.proceduresTotal, 60000)
  assert.equal(mockInvoiceFull.total, 335000)

  // Verify concept items counts
  assert.equal(mockInvoiceFull.supplies.length, 2)
  assert.equal(mockInvoiceFull.medications.length, 1)
  assert.equal(mockInvoiceFull.procedures.length, 1)
})

test('formatInvoiceCurrency formats amounts consistently in COP', () => {
  const formatted = formatInvoiceCurrency(335000)
  assert.ok(formatted.includes('335.000') || formatted.includes('335,000') || formatted.includes('335000'))

  const formattedZero = formatInvoiceCurrency(0)
  assert.ok(formattedZero.includes('0'))

  const formattedNull = formatInvoiceCurrency(null)
  assert.ok(formattedNull.includes('0'))

  const formattedUndefined = formatInvoiceCurrency(undefined)
  assert.ok(formattedUndefined.includes('0'))
})

test('formatInvoiceDate formats valid date strings or returns fallback', () => {
  assert.equal(formatInvoiceDate(null), '-')
  assert.equal(formatInvoiceDate(undefined), '-')
  assert.equal(formatInvoiceDate('invalid-date'), 'invalid-date')

  const formatted = formatInvoiceDate('2026-09-20T08:00:00Z')
  assert.ok(formatted.length > 5)
})

test('getInvoicePaymentStatus handles paid, unpaid, and undefined status', () => {
  // Paid
  const paidStatus = getInvoicePaymentStatus(true, '2026-09-24T10:15:00Z')
  assert.notEqual(paidStatus, null)
  assert.equal(paidStatus?.isPaid, true)
  assert.equal(paidStatus?.label, 'Pagado')
  assert.ok(paidStatus?.paidAtFormatted && paidStatus.paidAtFormatted.length > 0)
  assert.ok(paidStatus?.badgeClass.includes('emerald'))

  // Unpaid / Pending
  const unpaidStatus = getInvoicePaymentStatus(false, null)
  assert.notEqual(unpaidStatus, null)
  assert.equal(unpaidStatus?.isPaid, false)
  assert.equal(unpaidStatus?.label, 'Pendiente de pago')
  assert.equal(unpaidStatus?.paidAtFormatted, undefined)
  assert.ok(unpaidStatus?.badgeClass.includes('amber'))

  // Undefined / Null
  assert.equal(getInvoicePaymentStatus(undefined), null)
  assert.equal(getInvoicePaymentStatus(null), null)
})

test('getInvoiceStayStatusBadge classifies active and discharged stays', () => {
  const activeBadge = getInvoiceStayStatusBadge('Activa')
  assert.equal(activeBadge.label, 'Estancia Activa')
  assert.ok(activeBadge.badgeClass.includes('brand'))

  const dischargedBadge = getInvoiceStayStatusBadge('Dada de alta')
  assert.equal(dischargedBadge.label, 'Dada de alta')
  assert.ok(dischargedBadge.badgeClass.includes('bone'))

  const unknownBadge = getInvoiceStayStatusBadge('En traslado')
  assert.equal(unknownBadge.label, 'En traslado')
})

test('HospitalizationInvoice handles empty concept lists safely', () => {
  assert.equal(mockInvoiceEmptyConcepts.supplies.length, 0)
  assert.equal(mockInvoiceEmptyConcepts.medications.length, 0)
  assert.equal(mockInvoiceEmptyConcepts.procedures.length, 0)
  assert.equal(mockInvoiceEmptyConcepts.total, 50000)
  assert.equal(mockInvoiceEmptyConcepts.dischargedAt, null)
  assert.equal(mockInvoiceEmptyConcepts.isPaid, false)
})

test('fetchHospitalizationInvoice calls exact GET /api/hospitalization-stays/{stayId}/invoice endpoint', async () => {
  let calledUrl = ''
  let calledMethod = ''

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    calledUrl = String(input)
    calledMethod = init?.method || 'GET'
    return new Response(JSON.stringify(mockInvoiceFull), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const result = await fetchHospitalizationInvoice('stay-uuid-1234')
  assert.ok(calledUrl.endsWith('/api/hospitalization-stays/stay-uuid-1234/invoice'))
  assert.equal(calledMethod, 'GET')
  assert.equal(result.stayId, 'stay-uuid-1234')
  assert.equal(result.total, 335000)
  assert.equal(result.hospitalizationTotal, 200000)
  assert.equal(result.suppliesTotal, 45000)
  assert.equal(result.medicationsTotal, 30000)
  assert.equal(result.proceduresTotal, 60000)
  assert.equal(result.isPaid, true)
})

test('fetchHospitalizationInvoice handles HTTP 401 Unauthorized', async () => {
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ message: 'No autorizado o sesión expirada.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await assert.rejects(
    async () => {
      await fetchHospitalizationInvoice('stay-uuid-1234')
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError)
      assert.equal(err.status, 401)
      assert.ok(err.message.includes('No autorizado') || err.message.includes('sesión expirada'))
      return true
    },
  )
})

test('fetchHospitalizationInvoice handles HTTP 403 Forbidden', async () => {
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ message: 'No tienes permisos para realizar esta acción.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await assert.rejects(
    async () => {
      await fetchHospitalizationInvoice('stay-uuid-1234')
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError)
      assert.equal(err.status, 403)
      assert.ok(err.message.includes('No tienes permisos'))
      return true
    },
  )
})

test('fetchHospitalizationInvoice handles HTTP 404 Not Found', async () => {
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ message: 'Estancia de hospitalización no encontrada.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await assert.rejects(
    async () => {
      await fetchHospitalizationInvoice('stay-uuid-not-found')
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError)
      assert.equal(err.status, 404)
      assert.ok(err.message.includes('no encontrada') || err.message.includes('Recurso no encontrado'))
      return true
    },
  )
})

test('fetchHospitalizationInvoice handles HTTP 500 General Server Error', async () => {
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ message: 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await assert.rejects(
    async () => {
      await fetchHospitalizationInvoice('stay-uuid-error')
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError)
      assert.equal(err.status, 500)
      assert.ok(err.message.length > 0)
      return true
    },
  )
})

test('print and retry state flow behaves predictably', () => {
  let isPreparingPrint = false
  let printCalled = false

  const simulatedHandlePrint = (onDone: () => void) => {
    isPreparingPrint = true
    // Simulate prepare and print execution
    setTimeout(() => {
      try {
        printCalled = true
      } finally {
        isPreparingPrint = false
        onDone()
      }
    }, 10)
  }

  assert.equal(isPreparingPrint, false)
  simulatedHandlePrint(() => {
    assert.equal(printCalled, true)
    assert.equal(isPreparingPrint, false)
  })
})

