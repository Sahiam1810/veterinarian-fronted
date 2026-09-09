import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isStaffRole,
  mapBackendRole,
} from '../../src/modules/auth/services/authService.ts'
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

  assert.deepEqual(
    resolvePersistedRoleIdentity(
      '11111111-1111-1111-1111-111111111111',
      'custom',
    ),
    { role: 'custom', isPlatformSuperAdmin: false },
  )
})

test('mapBackendRole maps standard roles, custom configurable roles, and clients', () => {
  assert.equal(mapBackendRole('SuperAdministrador'), 'superadmin')
  assert.equal(mapBackendRole('Administrador'), 'admin')
  assert.equal(mapBackendRole('Veterinario'), 'veterinario')
  assert.equal(mapBackendRole('Recepcionista'), 'recepcionista')
  assert.equal(mapBackendRole('Auxiliar'), 'auxiliar')
  assert.equal(mapBackendRole('Practicante'), 'custom')
  assert.equal(mapBackendRole('Auditor Clínico'), 'custom')
  assert.equal(mapBackendRole('Cliente'), 'cliente')
  assert.equal(mapBackendRole(''), 'unknown')
  assert.equal(mapBackendRole(null), 'unknown')
  assert.equal(mapBackendRole(undefined), 'unknown')
})

test('isStaffRole permits standard and custom roles, rejecting clients and unknown', () => {
  assert.equal(isStaffRole('superadmin'), true)
  assert.equal(isStaffRole('admin'), true)
  assert.equal(isStaffRole('veterinario'), true)
  assert.equal(isStaffRole('recepcionista'), true)
  assert.equal(isStaffRole('auxiliar'), true)
  assert.equal(isStaffRole('custom'), true)
  assert.equal(isStaffRole('practicante'), true)
  assert.equal(isStaffRole('cliente'), false)
  assert.equal(isStaffRole('client'), false)
  assert.equal(isStaffRole('unknown'), false)
  assert.equal(isStaffRole(''), false)
  assert.equal(isStaffRole(null), false)
  assert.equal(isStaffRole(undefined), false)
})
