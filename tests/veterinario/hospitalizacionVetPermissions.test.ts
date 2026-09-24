import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createVetPermissionHelpers,
  VET_MODULE_ID_TO_API_MODULE,
} from '../../src/modules/veterinario/utils/vetModulePermissions.ts'

test('VET_MODULE_ID_TO_API_MODULE maps hospitalizacion to Hospitalización', () => {
  assert.equal(VET_MODULE_ID_TO_API_MODULE.hospitalizacion, 'Hospitalización')
})

test('vet permission helpers map Hospitalización to hospitalizacion and gate actions by View', () => {
  const withoutView = createVetPermissionHelpers({
    Hospitalización: { canView: false, canCreate: true, canEdit: true, canDelete: false },
  })
  const full = createVetPermissionHelpers({
    Hospitalización: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  })
  const viewOnly = createVetPermissionHelpers({
    Hospitalización: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  })

  assert.equal(withoutView.canViewModule('hospitalizacion'), false)
  assert.equal(withoutView.canCreateModule('hospitalizacion'), false)
  assert.equal(withoutView.canEditModule('hospitalizacion'), false)
  assert.equal(withoutView.canDeleteModule('hospitalizacion'), false)

  assert.equal(full.canViewModule('hospitalizacion'), true)
  assert.equal(full.canCreateModule('hospitalizacion'), true)
  assert.equal(full.canEditModule('hospitalizacion'), true)
  assert.equal(full.canDeleteModule('hospitalizacion'), false)

  assert.equal(viewOnly.canViewModule('hospitalizacion'), true)
  assert.equal(viewOnly.canCreateModule('hospitalizacion'), false)
  assert.equal(viewOnly.canEditModule('hospitalizacion'), false)
  assert.equal(viewOnly.canDeleteModule('hospitalizacion'), false)
})
