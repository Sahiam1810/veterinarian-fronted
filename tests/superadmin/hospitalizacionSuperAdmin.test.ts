import assert from 'node:assert/strict'
import test from 'node:test'

import {
  API_MODULE_TO_SHELL,
  buildActionMap,
  buildViewMap,
} from '../../src/modules/superadmin/utils/buildAdminShellViewMap.ts'
import type { MyPermissionsMap } from '../../src/modules/auth/services/myPermissionsService.ts'

const mockUserOptions = {
  id: 'user-hospitalization-test-1',
  email: 'admin@huellitas.test',
  roleId: 'role-123',
}

test('API_MODULE_TO_SHELL mapea "Hospitalización" a "hospitalizacion"', () => {
  assert.equal(API_MODULE_TO_SHELL['Hospitalización'], 'hospitalizacion')
})

test('buildViewMap sin permiso de Hospitalización -> viewMap.hospitalizacion === false', () => {
  const permissions: MyPermissionsMap = {
    Usuarios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }
  const viewMap = buildViewMap(permissions, mockUserOptions)
  assert.equal(viewMap.hospitalizacion, false)
  assert.equal(viewMap.usuarios, true)
})

test('buildViewMap con permiso Hospitalización.canView === true -> viewMap.hospitalizacion === true', () => {
  const permissions: MyPermissionsMap = {
    Hospitalización: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  }
  const viewMap = buildViewMap(permissions, mockUserOptions)
  assert.equal(viewMap.hospitalizacion, true)
})

test('buildActionMap mapea permisos CRUD de Hospitalización correctamente', () => {
  const permissions: MyPermissionsMap = {
    Hospitalización: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  }
  const actionMap = buildActionMap(permissions, mockUserOptions)
  assert.deepEqual(actionMap.hospitalizacion, {
    view: true,
    create: true,
    edit: true,
    delete: false,
  })
})

test('buildActionMap sin permiso Hospitalización -> todas las acciones son false', () => {
  const permissions: MyPermissionsMap = {
    Usuarios: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  }
  const actionMap = buildActionMap(permissions, mockUserOptions)
  assert.deepEqual(actionMap.hospitalizacion, {
    view: false,
    create: false,
    edit: false,
    delete: false,
  })
})

test('isPlatformSuperAdmin otorga acceso total al módulo Hospitalización', () => {
  const actionMap = buildActionMap(null, {
    ...mockUserOptions,
    isPlatformSuperAdmin: true,
  })
  assert.deepEqual(actionMap.hospitalizacion, {
    view: true,
    create: true,
    edit: true,
    delete: true,
  })
  const viewMap = buildViewMap(null, {
    ...mockUserOptions,
    isPlatformSuperAdmin: true,
  })
  assert.equal(viewMap.hospitalizacion, true)
})
