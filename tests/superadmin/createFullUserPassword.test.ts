import assert from 'node:assert/strict'
import test from 'node:test'

import { requireCreateUserPassword } from '../../src/modules/superadmin/services/requireCreateUserPassword.ts'

// createFullUser llama requireCreateUserPassword antes de cualquier POST.
// Se prueba el gate directo (node --test no resuelve el alias @/ del service).
const createFullUser = (params: {
  fullName: string
  email: string
  password?: string
  roleId: string
}) => {
  requireCreateUserPassword(params.password)
}

test('createFullUser con password vacío lanza Error y no crea cuenta', () => {
  assert.throws(
    () =>
      createFullUser({
        fullName: 'Ana Perez',
        email: 'ana@veterinaria.com',
        password: '',
        roleId: '11111111-1111-1111-1111-111111111111',
      }),
    (err: unknown) =>
      err instanceof Error &&
      err.message === 'La contraseña es obligatoria para crear un usuario.',
  )
})

test('createFullUser con password undefined lanza el mismo Error', () => {
  assert.throws(
    () =>
      createFullUser({
        fullName: 'Ana Perez',
        email: 'ana@veterinaria.com',
        password: undefined,
        roleId: '11111111-1111-1111-1111-111111111111',
      }),
    /La contraseña es obligatoria para crear un usuario\./,
  )
})

test('createFullUser con solo espacios lanza Error', () => {
  assert.throws(
    () =>
      createFullUser({
        fullName: 'Ana Perez',
        email: 'ana@veterinaria.com',
        password: '   ',
        roleId: '11111111-1111-1111-1111-111111111111',
      }),
    /La contraseña es obligatoria para crear un usuario\./,
  )
})

test('password válida se normaliza con trim', () => {
  assert.equal(requireCreateUserPassword('  Secreta123!  '), 'Secreta123!')
})
