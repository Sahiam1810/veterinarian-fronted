import assert from 'node:assert/strict'
import test from 'node:test'

import {
  excludeClientRole,
  excludeClientRoleUsers,
} from '../../src/modules/superadmin/utils/adminRoleVisibility.ts'
import {
  CLIENT_ROLE_ID,
  SUPERADMIN_ROLE_ID,
  isPersistedClientRole,
} from '../../src/modules/auth/utils/systemRoles.ts'

const staffRoles = [
  { id: SUPERADMIN_ROLE_ID, name: 'SuperAdmin' },
  { id: 'role-admin', name: 'Administrador' },
  { id: 'role-vet', name: 'Veterinario' },
  { id: 'role-recep', name: 'Recepcionista' },
  { id: 'role-aux', name: 'Auxiliar' },
]

test('excludeClientRole removes Cliente and keeps the five staff roles', () => {
  const roles = [...staffRoles, { id: CLIENT_ROLE_ID, name: 'Cliente' }]

  assert.deepEqual(
    excludeClientRole(roles).map((role) => role.name),
    ['SuperAdmin', 'Administrador', 'Veterinario', 'Recepcionista', 'Auxiliar'],
  )
})

test('excludeClientRole matches Cliente by id, regardless of casing or name', () => {
  const roles = [
    { id: 'role-admin', name: 'Administrador' },
    { id: ` ${CLIENT_ROLE_ID.toUpperCase()} `, name: 'Portal' },
  ]

  assert.deepEqual(excludeClientRole(roles).map((role) => role.id), ['role-admin'])
})

test('role selector options derived from the filtered list never offer Cliente', () => {
  const roles = excludeClientRole([...staffRoles, { id: CLIENT_ROLE_ID, name: 'Cliente' }])
    .map((role) => ({ ...role, isSystem: role.id === SUPERADMIN_ROLE_ID }))
  const assignableRoles = roles.filter((role) => !role.isSystem)

  assert.equal(assignableRoles.some((role) => isPersistedClientRole(role.id)), false)
  assert.deepEqual(
    assignableRoles.map((role) => role.name),
    ['Administrador', 'Veterinario', 'Recepcionista', 'Auxiliar'],
  )
})

test('excludeClientRoleUsers hides users with the Cliente role only', () => {
  const users = [
    { id: 'u-admin', roleId: 'role-admin' },
    { id: 'u-client', roleId: CLIENT_ROLE_ID },
    { id: 'u-super', roleId: SUPERADMIN_ROLE_ID },
  ]

  assert.deepEqual(excludeClientRoleUsers(users).map((user) => user.id), ['u-admin', 'u-super'])
})

test('isPersistedClientRole ignores empty values and other roles', () => {
  assert.equal(isPersistedClientRole(undefined), false)
  assert.equal(isPersistedClientRole(null), false)
  assert.equal(isPersistedClientRole(''), false)
  assert.equal(isPersistedClientRole(SUPERADMIN_ROLE_ID), false)
  assert.equal(isPersistedClientRole(CLIENT_ROLE_ID), true)
})
