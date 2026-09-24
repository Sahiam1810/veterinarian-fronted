import assert from 'node:assert/strict'
import test from 'node:test'

import { validateSupplyForm } from '../../src/modules/superadmin/utils/supplyForm.ts'

const valid = { name: 'Jeringa 5 ml', unit: 'unidad', unitPrice: '800', stock: '400' }

test('validateSupplyForm acepta un insumo válido y devuelve el payload limpio', () => {
  const result = validateSupplyForm({ ...valid, name: '  Jeringa 5 ml  ', unit: ' unidad ' })
  assert.deepEqual(result, {
    ok: true,
    payload: { name: 'Jeringa 5 ml', unit: 'unidad', unitPrice: 800, stock: 400 },
  })
})

test('validateSupplyForm acepta precio y stock en 0', () => {
  const result = validateSupplyForm({ ...valid, unitPrice: 0, stock: '0' })
  assert.equal(result.ok, true)
})

test('validateSupplyForm exige nombre y unidad', () => {
  assert.equal(validateSupplyForm({ ...valid, name: '   ' }).ok, false)
  assert.equal(validateSupplyForm({ ...valid, unit: '' }).ok, false)
})

test('validateSupplyForm respeta los máximos de 150 y 50 caracteres', () => {
  assert.equal(validateSupplyForm({ ...valid, name: 'a'.repeat(150) }).ok, true)
  assert.equal(validateSupplyForm({ ...valid, name: 'a'.repeat(151) }).ok, false)
  assert.equal(validateSupplyForm({ ...valid, unit: 'u'.repeat(50) }).ok, true)
  assert.equal(validateSupplyForm({ ...valid, unit: 'u'.repeat(51) }).ok, false)
})

test('validateSupplyForm rechaza precio o stock vacío, negativo o no numérico', () => {
  for (const bad of ['', '   ', '-1', 'abc']) {
    assert.equal(validateSupplyForm({ ...valid, unitPrice: bad }).ok, false, `precio "${bad}"`)
    assert.equal(validateSupplyForm({ ...valid, stock: bad }).ok, false, `stock "${bad}"`)
  }
  assert.equal(validateSupplyForm({ ...valid, unitPrice: -0.01 }).ok, false)
})

test('validateSupplyForm devuelve un mensaje legible al fallar', () => {
  const result = validateSupplyForm({ ...valid, stock: '-5' })
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.error, /stock/i)
})
