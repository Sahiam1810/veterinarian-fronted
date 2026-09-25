import assert from 'node:assert/strict'
import test from 'node:test'

import { buildAvailableDaysLabel } from '../../src/modules/recepcionista/utils/availableDays.ts'

test('buildAvailableDaysLabel muestra solo días activos, sin duplicados y en orden', () => {
  const label = buildAvailableDaysLabel([
    { dayOfWeek: 5, isActive: true },
    { dayOfWeek: '1', isActive: true },
    { dayOfWeek: 5, isActive: true },
    { dayOfWeek: 3, isActive: false },
    { dayOfWeek: 0, isActive: true },
  ])

  assert.equal(label, 'Domingo, Lunes, Viernes')
})

test('buildAvailableDaysLabel queda vacío sin disponibilidades activas', () => {
  assert.equal(
    buildAvailableDaysLabel([
      { dayOfWeek: 2, isActive: false },
      { dayOfWeek: 4, isActive: false },
    ]),
    '',
  )
})
