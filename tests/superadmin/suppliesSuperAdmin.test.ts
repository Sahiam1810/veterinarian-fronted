import assert from 'node:assert/strict'
import test from 'node:test'

import {
  API_MODULE_TO_SHELL,
  buildActionMap,
  buildViewMap,
} from '../../src/modules/superadmin/utils/buildAdminShellViewMap.ts'
import type { MyPermissionsMap } from '../../src/modules/auth/services/myPermissionsService.ts'

const mockUserOptions = {
  id: 'user-supplies-test-1',
  email: 'admin@huellitas.test',
  roleId: 'role-123',
}

test('API_MODULE_TO_SHELL mapea "Insumos" a "insumos"', () => {
  assert.equal(API_MODULE_TO_SHELL['Insumos'], 'insumos')
})

test('buildViewMap sin permiso de Insumos -> viewMap.insumos === false', () => {
  const permissions: MyPermissionsMap = {
    Usuarios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }
  const viewMap = buildViewMap(permissions, mockUserOptions)
  assert.equal(viewMap.insumos, false)
  assert.equal(viewMap.usuarios, true)
})

test('buildViewMap con permiso Insumos.canView === true -> viewMap.insumos === true', () => {
  const permissions: MyPermissionsMap = {
    Insumos: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  }
  const viewMap = buildViewMap(permissions, mockUserOptions)
  assert.equal(viewMap.insumos, true)
})

test('buildActionMap mapea permisos CRUD de Insumos correctamente', () => {
  const permissions: MyPermissionsMap = {
    Insumos: { canView: true, canCreate: true, canEdit: false, canDelete: true },
  }
  const actionMap = buildActionMap(permissions, mockUserOptions)
  assert.deepEqual(actionMap.insumos, {
    view: true,
    create: true,
    edit: false,
    delete: true,
  })
})

test('buildActionMap sin permiso Insumos -> todas las acciones son false', () => {
  const permissions: MyPermissionsMap = {
    Usuarios: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  }
  const actionMap = buildActionMap(permissions, mockUserOptions)
  assert.deepEqual(actionMap.insumos, {
    view: false,
    create: false,
    edit: false,
    delete: false,
  })
})

test('isPlatformSuperAdmin otorga acceso total al módulo Insumos', () => {
  const actionMap = buildActionMap(null, {
    ...mockUserOptions,
    isPlatformSuperAdmin: true,
  })
  assert.deepEqual(actionMap.insumos, {
    view: true,
    create: true,
    edit: true,
    delete: true,
  })
  const viewMap = buildViewMap(null, {
    ...mockUserOptions,
    isPlatformSuperAdmin: true,
  })
  assert.equal(viewMap.insumos, true)
})
