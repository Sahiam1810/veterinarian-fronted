import assert from 'node:assert/strict'
import test from 'node:test'

import { translateApiError } from '../../src/modules/auth/utils/toSpanishAuthError.ts'

// Bug: al registrar un dueño con correo/cédula/teléfono duplicado, el backend
// devuelve un ConflictException sin `message` (solo `code` + title "Conflict"),
// y sin esta traducción el usuario veía la palabra "Conflict" en pantalla.
test('translateApiError traduce el code real de correo duplicado en RegisterOwner', () => {
  const message = translateApiError('Authentication.UserAlreadyExists', 409, 'Conflict')
  assert.equal(message, 'Ya existe un usuario con este correo electrónico.')
})

test('translateApiError traduce el code real de cédula duplicada en RegisterOwner', () => {
  const message = translateApiError('Authentication.IdentificationNumberAlreadyExists', 409, 'Conflict')
  assert.equal(message, 'Ya existe un cliente con este número de identificación o cédula.')
})

test('translateApiError traduce el code real de teléfono duplicado en RegisterOwner', () => {
  const message = translateApiError('Clients.PhoneAlreadyInUse', 409, 'Conflict')
  assert.equal(message, 'Ya existe un cliente con este número de teléfono.')
})
