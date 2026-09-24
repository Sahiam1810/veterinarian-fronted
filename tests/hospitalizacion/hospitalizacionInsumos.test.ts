import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mapSupplyConsumptions,
  calculateSupplyConsumptionsTotal,
  validateSupplyConsumptionForm,
  formatSupplyCurrency,
  formatSupplyDate,
  canRegisterSupplyConsumption,
} from '../../src/modules/hospitalizacion/utils/hospitalizacionSupplyMapping.ts'
import type {
  ApiSupply,
  ApiSupplyConsumption,
} from '../../src/modules/hospitalizacion/types/hospitalizacion.types.ts'

const mockSuppliesCatalog: ApiSupply[] = [
  {
    id: 'sup-1',
    name: 'Suero Fisiológico 500ml',
    unit: 'bolsa',
    unitPrice: 15000,
    stock: 25,
    isActive: true,
  },
  {
    id: 'sup-2',
    name: 'Jeringa 5ml',
    unit: 'unidad',
    unitPrice: 1200,
    stock: 100,
    isActive: true,
  },
  {
    id: 'sup-3',
    name: 'Tramadol 50mg/ml',
    unit: 'ampolla',
    unitPrice: 8500,
    stock: 5,
    isActive: true,
  },
  {
    id: 'sup-4',
    name: 'Catéter 22G',
    unit: 'unidad',
    unitPrice: 4500,
    stock: 0,
    isActive: true,
  },
]

const mockConsumptions: ApiSupplyConsumption[] = [
  {
    id: 'cons-1',
    hospitalizationStayId: 'stay-100',
    supplyId: 'sup-1',
    quantity: 2,
    unitPrice: 15000,
    total: 30000,
    registeredByUserId: 'usr-1',
    notes: 'Hidratación inicial',
    createdAt: '2026-09-24T10:30:00Z',
  },
  {
    id: 'cons-2',
    hospitalizationStayId: 'stay-100',
    supplyId: 'sup-3',
    quantity: 1,
    unitPrice: 8500,
    total: 8500,
    registeredByUserId: 'usr-1',
    notes: null,
    createdAt: '2026-09-24T11:00:00Z',
  },
  {
    id: 'cons-3',
    hospitalizationStayId: 'stay-100',
    supplyId: 'sup-999-inexistente',
    quantity: 1,
    unitPrice: 2000,
    total: 2000,
    registeredByUserId: 'usr-1',
    notes: 'Insumo especial descontinuado',
    createdAt: '2026-09-24T12:00:00Z',
  },
]

test('mapSupplyConsumptions correctly matches supplyId against supplies catalog', () => {
  const mapped = mapSupplyConsumptions(mockConsumptions, mockSuppliesCatalog)

  assert.equal(mapped.length, 3)

  // Item 1: matched
  assert.equal(mapped[0].supplyName, 'Suero Fisiológico 500ml')
  assert.equal(mapped[0].supplyUnit, 'bolsa')
  assert.equal(mapped[0].quantity, 2)
  assert.equal(mapped[0].unitPrice, 15000)
  assert.equal(mapped[0].total, 30000)
  assert.equal(mapped[0].notes, 'Hidratación inicial')

  // Item 2: matched with null notes
  assert.equal(mapped[1].supplyName, 'Tramadol 50mg/ml')
  assert.equal(mapped[1].supplyUnit, 'ampolla')
  assert.equal(mapped[1].quantity, 1)
  assert.equal(mapped[1].unitPrice, 8500)
  assert.equal(mapped[1].total, 8500)
  assert.equal(mapped[1].notes, null)

  // Item 3: unmapped supply fallback
  assert.equal(mapped[2].supplyName, 'Insumo no encontrado')
  assert.equal(mapped[2].supplyUnit, '-')
  assert.equal(mapped[2].quantity, 1)
  assert.equal(mapped[2].total, 2000)
})

test('mapSupplyConsumptions handles empty, null or undefined input gracefully', () => {
  assert.deepEqual(mapSupplyConsumptions([], mockSuppliesCatalog), [])
  assert.deepEqual(mapSupplyConsumptions(null, mockSuppliesCatalog), [])
  assert.deepEqual(mapSupplyConsumptions(undefined, mockSuppliesCatalog), [])
  assert.deepEqual(mapSupplyConsumptions(mockConsumptions, null), [
    {
      ...mockConsumptions[0],
      supplyName: 'Insumo no encontrado',
      supplyUnit: '-',
      supplyStock: undefined,
    },
    {
      ...mockConsumptions[1],
      supplyName: 'Insumo no encontrado',
      supplyUnit: '-',
      supplyStock: undefined,
    },
    {
      ...mockConsumptions[2],
      supplyName: 'Insumo no encontrado',
      supplyUnit: '-',
      supplyStock: undefined,
    },
  ])
})

test('calculateSupplyConsumptionsTotal calculates sum of totals correctly', () => {
  const total = calculateSupplyConsumptionsTotal(mockConsumptions)
  assert.equal(total, 40500) // 30000 + 8500 + 2000

  assert.equal(calculateSupplyConsumptionsTotal([]), 0)
  assert.equal(calculateSupplyConsumptionsTotal(null), 0)
  assert.equal(calculateSupplyConsumptionsTotal(undefined), 0)
})

test('validateSupplyConsumptionForm validates required supplyId', () => {
  const resEmpty = validateSupplyConsumptionForm({
    supplyId: '',
    quantity: 1,
  })
  assert.equal(resEmpty.ok, false)
  assert.equal(resEmpty.error, 'Debes seleccionar un insumo.')

  const resWhitespace = validateSupplyConsumptionForm({
    supplyId: '   ',
    quantity: 1,
  })
  assert.equal(resWhitespace.ok, false)
  assert.equal(resWhitespace.error, 'Debes seleccionar un insumo.')
})

test('validateSupplyConsumptionForm validates quantity required and greater than zero', () => {
  const resEmpty = validateSupplyConsumptionForm({
    supplyId: 'sup-1',
    quantity: '',
  })
  assert.equal(resEmpty.ok, false)
  assert.equal(resEmpty.error, 'La cantidad es obligatoria.')

  const resZero = validateSupplyConsumptionForm({
    supplyId: 'sup-1',
    quantity: 0,
  })
  assert.equal(resZero.ok, false)
  assert.equal(resZero.error, 'La cantidad debe ser mayor que cero.')

  const resNegative = validateSupplyConsumptionForm({
    supplyId: 'sup-1',
    quantity: -3,
  })
  assert.equal(resNegative.ok, false)
  assert.equal(resNegative.error, 'La cantidad debe ser mayor que cero.')

  const resNaN = validateSupplyConsumptionForm({
    supplyId: 'sup-1',
    quantity: 'abc',
  })
  assert.equal(resNaN.ok, false)
  assert.equal(resNaN.error, 'La cantidad debe ser mayor que cero.')
})

test('validateSupplyConsumptionForm verifies insufficient stock', () => {
  const targetSupply = mockSuppliesCatalog.find((s) => s.id === 'sup-3')! // stock = 5
  assert.equal(targetSupply.stock, 5)

  // Quantity exceeds stock
  const resExceeded = validateSupplyConsumptionForm({
    supplyId: 'sup-3',
    quantity: 6,
    selectedSupply: targetSupply,
  })
  assert.equal(resExceeded.ok, false)
  assert.equal(resExceeded.error, 'El stock disponible es insuficiente (disponible: 5).')

  // Quantity exactly equals stock
  const resEqual = validateSupplyConsumptionForm({
    supplyId: 'sup-3',
    quantity: 5,
    selectedSupply: targetSupply,
  })
  assert.equal(resEqual.ok, true)
  assert.equal(resEqual.quantityNum, 5)

  // Zero stock supply
  const zeroStockSupply = mockSuppliesCatalog.find((s) => s.id === 'sup-4')! // stock = 0
  const resZeroStock = validateSupplyConsumptionForm({
    supplyId: 'sup-4',
    quantity: 1,
    selectedSupply: zeroStockSupply,
  })
  assert.equal(resZeroStock.ok, false)
  assert.equal(resZeroStock.error, 'El stock disponible es insuficiente (disponible: 0).')
})

test('validateSupplyConsumptionForm validates optional notes length', () => {
  const shortNotes = 'Uso durante procedimiento de sutura.'
  const resOk = validateSupplyConsumptionForm({
    supplyId: 'sup-1',
    quantity: 2,
    notes: shortNotes,
    selectedSupply: mockSuppliesCatalog[0],
  })
  assert.equal(resOk.ok, true)
  assert.equal(resOk.quantityNum, 2)

  const longNotes = 'A'.repeat(501)
  const resLong = validateSupplyConsumptionForm({
    supplyId: 'sup-1',
    quantity: 2,
    notes: longNotes,
    selectedSupply: mockSuppliesCatalog[0],
  })
  assert.equal(resLong.ok, false)
  assert.equal(resLong.error, 'Las notas no deben superar los 500 caracteres.')
})

test('formatSupplyCurrency formats amounts properly', () => {
  const formatted = formatSupplyCurrency(15000)
  assert.ok(formatted.includes('15.000') || formatted.includes('15,000') || formatted.includes('15'))

  const formattedZero = formatSupplyCurrency(0)
  assert.ok(formattedZero.includes('0'))

  const formattedNull = formatSupplyCurrency(null)
  assert.ok(formattedNull.includes('0'))
})

test('formatSupplyDate formats date strings or returns fallback', () => {
  assert.equal(formatSupplyDate(null), '-')
  assert.equal(formatSupplyDate(undefined), '-')
  assert.equal(formatSupplyDate('invalid-date'), 'invalid-date')

  const formatted = formatSupplyDate('2026-09-24T10:30:00Z')
  assert.ok(formatted.length > 5)
})

test('permission, loading and status rules gate supply consumption registration', () => {
  const base = {
    canCreateSupplies: true,
    isDischarged: false,
    isStayLoading: false,
    isLoadingSupplies: false,
    suppliesError: null,
  }

  assert.equal(canRegisterSupplyConsumption({ ...base, canCreateSupplies: false }), false)
  assert.equal(canRegisterSupplyConsumption({ ...base, isStayLoading: true }), false)
  assert.equal(canRegisterSupplyConsumption({ ...base, isLoadingSupplies: true }), false)
  assert.equal(canRegisterSupplyConsumption({ ...base, suppliesError: 'Catálogo no disponible' }), false)
  assert.equal(canRegisterSupplyConsumption({ ...base, isDischarged: true }), false)
  assert.equal(canRegisterSupplyConsumption(base), true)
})
