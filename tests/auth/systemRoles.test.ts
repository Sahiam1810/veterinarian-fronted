import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isPersistedSuperAdminRole,
  resolvePersistedRoleIdentity,
} from '../../src/modules/auth/utils/systemRoles.ts'

test('recognizes only the canonical persisted SuperAdmin role identifier', () => {
  assert.equal(
    isPersistedSuperAdminRole('99999999-9999-9999-9999-999999999999'),
    true,
  )
  assert.equal(
    isPersistedSuperAdminRole(' 99999999-9999-9999-9999-999999999999 '),
    true,
  )

  assert.equal(
    isPersistedSuperAdminRole('11111111-1111-1111-1111-111111111111'),
    false,
  )
  assert.equal(isPersistedSuperAdminRole(undefined), false)
  assert.equal(isPersistedSuperAdminRole(null), false)
})

test('resolves the frontend navigation role from the persisted role identifier', () => {
  assert.deepEqual(
    resolvePersistedRoleIdentity(
      '99999999-9999-9999-9999-999999999999',
      'admin',
    ),
    { role: 'superadmin', isPlatformSuperAdmin: true },
  )

  assert.deepEqual(
    resolvePersistedRoleIdentity(
      '11111111-1111-1111-1111-111111111111',
      'admin',
    ),
    { role: 'admin', isPlatformSuperAdmin: false },
  )
})
