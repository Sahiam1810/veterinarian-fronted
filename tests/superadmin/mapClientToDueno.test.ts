import assert from 'node:assert/strict'
import test from 'node:test'

import { mapClientToDueno } from '../../src/modules/superadmin/utils/superAdminApiMappers.ts'
import type { ApiClientResponse } from '../../src/modules/superadmin/services/superAdminClientsService.ts'

// F1/F5: nombre, correo y estado salen solo del cliente (sin cruce con /api/Users).

function makeClient(overrides: Partial<ApiClientResponse> = {}): ApiClientResponse {
  return {
    id: 'client-1',
    identificationNumber: '1098765432',
    phoneNumber: '3001234567',
    address: 'Calle 10',
    createdAt: '2026-03-15T12:00:00.000Z',
    updatedAt: null,
    fullName: 'Carlos Ruiz',
    email: 'carlos@huellitas.test',
    isActive: true,
    ...overrides,
  }
}

test('mapClientToDueno toma nombre, correo y estado solo del cliente', () => {
  const dueno = mapClientToDueno(makeClient(), ['Bella (Canino)'])

  assert.equal(dueno.id, 'client-1')
  assert.equal(dueno.name, 'Carlos Ruiz')
  assert.equal(dueno.email, 'carlos@huellitas.test')
  assert.equal(dueno.documentId, '1098765432')
  assert.equal(dueno.phone, '3001234567')
  assert.equal(dueno.address, 'Calle 10')
  assert.equal(dueno.status, 'Activo')
  assert.deepEqual(dueno.mascotasSummary, ['Bella (Canino)'])
  assert.ok(!('userId' in dueno))
})

test('mapClientToDueno marca Inactivo cuando isActive es false', () => {
  const dueno = mapClientToDueno(makeClient({ isActive: false }))
  assert.equal(dueno.status, 'Inactivo')
})

test('mapClientToDueno usa createdAt para la fecha de registro de UI', () => {
  const dueno = mapClientToDueno(makeClient({ createdAt: '2026-03-15T12:00:00.000Z' }))
  assert.ok(dueno.registrationDate)
  assert.notEqual(dueno.registrationDate, 'Reciente')
  assert.match(dueno.registrationDate, /2026/)
})

test('mapClientToDueno no requiere un segundo argumento de usuario', () => {
  // Firma: (client, mascotasSummary?) — si se pasara un user como 2.º arg,
  // el resumen de mascotas se rompería; aquí comprobamos el contrato actual.
  const dueno = mapClientToDueno(makeClient({ fullName: '' }), [])
  assert.equal(dueno.name, 'Sin nombre')
  assert.deepEqual(dueno.mascotasSummary, [])
})
