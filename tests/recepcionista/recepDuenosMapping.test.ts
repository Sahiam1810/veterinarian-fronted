import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildRecepDuenosDirectory,
  resolveDuenoEstado,
} from '../../src/modules/recepcionista/utils/recepDuenosMapping.ts'
import type { ApiClientResponse } from '../../src/modules/superadmin/services/superAdminClientsService.ts'

// Regresión S17: el directorio de dueños mostraba "Cliente Sin Nombre" para
// todos los dueños porque dependía de una segunda llamada a GET /api/Users
// (sin permiso para Recepcionista). El nombre/correo/estado ahora vienen
// directo del DTO de /api/Clients — estas pruebas fijan que no se vuelva
// a introducir ese cruce.

function makeClient(overrides: Partial<ApiClientResponse> = {}): ApiClientResponse {
  return {
    id: 'client-1',
    userId: 'user-1',
    identificationNumber: '1234567890',
    phoneNumber: '3001234567',
    address: null,
    registrationDate: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: null,
    fullName: 'Ana Pérez',
    email: 'ana.perez@test.com',
    isActive: true,
    ...overrides,
  }
}

test('arma el nombre desde client.fullName (bug original: "Cliente Sin Nombre")', () => {
  const directory = buildRecepDuenosDirectory([makeClient()], [], [], [], [])

  assert.equal(directory.items[0]?.fullName, 'Ana Pérez')
  assert.equal(directory.detailsById['client-1']?.fullName, 'Ana Pérez')
})

test('cae a "Cliente Sin Nombre" solo cuando el backend no trae fullName', () => {
  const directory = buildRecepDuenosDirectory(
    [makeClient({ fullName: null })],
    [],
    [],
    [],
    [],
  )

  assert.equal(directory.items[0]?.fullName, 'Cliente Sin Nombre')
})

test('resolveDuenoEstado: Activo por defecto, Inactivo solo si isActive === false', () => {
  assert.equal(resolveDuenoEstado({ isActive: true }), 'Activo')
  assert.equal(resolveDuenoEstado({ isActive: false }), 'Inactivo')
  assert.equal(resolveDuenoEstado({ isActive: undefined }), 'Activo')
  assert.equal(resolveDuenoEstado({ isActive: null }), 'Activo')
})

test('el directorio refleja el estado Inactivo de un dueño desactivado', () => {
  const directory = buildRecepDuenosDirectory(
    [makeClient({ id: 'client-2', isActive: false })],
    [],
    [],
    [],
    [],
  )

  assert.equal(directory.items[0]?.estado, 'Inactivo')
})
