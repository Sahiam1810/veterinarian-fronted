import assert from 'node:assert/strict'
import test from 'node:test'

import {
  validateCatalogPrice,
  formatCatalogCurrency,
} from '../../src/modules/veterinario/utils/catalogPriceValidation.ts'

test('validateCatalogPrice accepts non-negative numbers and numeric strings', () => {
  assert.deepEqual(validateCatalogPrice(0), { ok: true, value: 0 })
  assert.deepEqual(validateCatalogPrice(25000), { ok: true, value: 25000 })
  assert.deepEqual(validateCatalogPrice('45000'), { ok: true, value: 45000 })
  assert.deepEqual(validateCatalogPrice('1500.5'), { ok: true, value: 1500.5 })
})

test('validateCatalogPrice treats empty, null or undefined as zero default', () => {
  assert.deepEqual(validateCatalogPrice(''), { ok: true, value: 0 })
  assert.deepEqual(validateCatalogPrice(null), { ok: true, value: 0 })
  assert.deepEqual(validateCatalogPrice(undefined), { ok: true, value: 0 })
})

test('validateCatalogPrice rejects negative numbers', () => {
  const result = validateCatalogPrice(-100)
  assert.equal(result.ok, false)
  assert.match(result.error || '', /no puede ser negativo/)
})

test('validateCatalogPrice rejects non-numeric strings', () => {
  const result = validateCatalogPrice('abc')
  assert.equal(result.ok, false)
  assert.match(result.error || '', /número válido/)
})

test('formatCatalogCurrency formats price as COP', () => {
  const formatted = formatCatalogCurrency(50000)
  assert.match(formatted, /50\.000/)
})
