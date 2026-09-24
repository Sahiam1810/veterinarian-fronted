import assert from 'node:assert/strict'
import test from 'node:test'

import {
  API_MODULE_TO_SHELL,
  buildActionMap,
  buildViewMap,
} from '../../src/modules/superadmin/utils/buildAdminShellViewMap.ts'
import {
  MODULES_INFO,
  SUPER_ADMIN_NAV_CATALOG,
} from '../../src/modules/superadmin/utils/superAdminNavCatalog.ts'
import type { MyPermissionsMap } from '../../src/modules/auth/services/myPermissionsService.ts'
import type { ModuleId } from '../../src/modules/superadmin/types/index.ts'

const testUserOptions = {
  id: 'user-audit-1',
  email: 'auxiliar@huellitas.test',
  roleId: 'role-auxiliar',
}

test('Audit 1: Every module in MODULES_INFO has a mapped entry in API_MODULE_TO_SHELL', () => {
  const mappedShellIds = new Set(Object.values(API_MODULE_TO_SHELL))

  for (const info of MODULES_INFO) {
    assert.ok(
      mappedShellIds.has(info.id),
      `Module '${info.id}' (${info.label}) from MODULES_INFO must have a mapping in API_MODULE_TO_SHELL`,
    )
  }
})

test('Audit 2: Every module in MODULES_INFO has a navigation item in SUPER_ADMIN_NAV_CATALOG', () => {
  const navModuleIds = new Set(SUPER_ADMIN_NAV_CATALOG.map((item) => item.moduleId))

  for (const info of MODULES_INFO) {
    const isCoveredByCombinedPetsEntry =
      info.id === 'duenos' && navModuleIds.has('mascotas')
    assert.ok(
      navModuleIds.has(info.id) || isCoveredByCombinedPetsEntry,
      `Module '${info.id}' (${info.label}) must be present in SUPER_ADMIN_NAV_CATALOG`,
    )
  }
})

test('Audit 3: buildActionMap and buildViewMap strictly enforce View-first permission policy', () => {
  // Scenario: API returns Create, Edit and Delete as true, but View as false
  const permissionsWithoutView: MyPermissionsMap = {
    Mascotas: { canView: false, canCreate: true, canEdit: true, canDelete: true },
    Clientes: { canView: false, canCreate: true, canEdit: true, canDelete: true },
    Hospitalización: { canView: false, canCreate: true, canEdit: true, canDelete: true },
    Insumos: { canView: false, canCreate: true, canEdit: true, canDelete: true },
    'Órdenes Médicas': { canView: false, canCreate: true, canEdit: true, canDelete: true },
  }

  const actionMap = buildActionMap(permissionsWithoutView, testUserOptions)
  const viewMap = buildViewMap(permissionsWithoutView, testUserOptions)

  const modulesToTest: ModuleId[] = [
    'mascotas',
    'duenos',
    'hospitalizacion',
    'insumos',
    'ordenesMedicas',
  ]

  for (const mod of modulesToTest) {
    assert.equal(viewMap[mod], false, `Module ${mod} must not be visible without View permission`)
    assert.equal(actionMap[mod].view, false, `Module ${mod} view action must be false`)
    assert.equal(actionMap[mod].create, false, `Module ${mod} create action must be false without View`)
    assert.equal(actionMap[mod].edit, false, `Module ${mod} edit action must be false without View`)
    assert.equal(actionMap[mod].delete, false, `Module ${mod} delete action must be false without View`)
  }
})

test('Audit 4: Mascotas and Dueños permissions matrix flow for Auxiliar / Admin', () => {
  // Case A: Only Mascotas:View
  const onlyMascotasView: MyPermissionsMap = {
    Mascotas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }
  const viewMapA = buildViewMap(onlyMascotasView, testUserOptions)
  const actionMapA = buildActionMap(onlyMascotasView, testUserOptions)
  assert.equal(viewMapA.mascotas, true)
  assert.equal(actionMapA.mascotas.view, true)
  assert.equal(actionMapA.mascotas.create, false)
  assert.equal(actionMapA.mascotas.edit, false)
  assert.equal(actionMapA.mascotas.delete, false)
  assert.equal(viewMapA.duenos, false)

  // Case B: Mascotas:View + Mascotas:Create
  const mascotasWithCreate: MyPermissionsMap = {
    Mascotas: { canView: true, canCreate: true, canEdit: false, canDelete: false },
  }
  const actionMapB = buildActionMap(mascotasWithCreate, testUserOptions)
  assert.equal(actionMapB.mascotas.view, true)
  assert.equal(actionMapB.mascotas.create, true)
  assert.equal(actionMapB.mascotas.edit, false)

  // Case C: Only Clientes:View (Dueños) without Mascotas:View
  const onlyClientesView: MyPermissionsMap = {
    Clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }
  const viewMapC = buildViewMap(onlyClientesView, testUserOptions)
  const actionMapC = buildActionMap(onlyClientesView, testUserOptions)
  assert.equal(viewMapC.mascotas, false)
  assert.equal(viewMapC.duenos, true)
  assert.equal(actionMapC.duenos.view, true)
  assert.equal(actionMapC.duenos.create, false)
})

test('Audit 5: Hospitalización permissions mapping and action resolution', () => {
  assert.equal(API_MODULE_TO_SHELL['Hospitalización'], 'hospitalizacion')

  const hospPermissions: MyPermissionsMap = {
    Hospitalización: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  }
  const actionMap = buildActionMap(hospPermissions, testUserOptions)
  const viewMap = buildViewMap(hospPermissions, testUserOptions)

  assert.equal(viewMap.hospitalizacion, true)
  assert.equal(actionMap.hospitalizacion.view, true)
  assert.equal(actionMap.hospitalizacion.create, true) // Admitir
  assert.equal(actionMap.hospitalizacion.edit, true) // Alta / notas
  assert.equal(actionMap.hospitalizacion.delete, false)
})

test('Audit 6: Platform SuperAdmin bypasses API permissions and receives full access', () => {
  const superAdminOptions = {
    ...testUserOptions,
    isPlatformSuperAdmin: true,
  }

  const actionMap = buildActionMap(null, superAdminOptions)
  const viewMap = buildViewMap(null, superAdminOptions)

  for (const info of MODULES_INFO) {
    assert.equal(viewMap[info.id], true, `SuperAdmin must have view on ${info.id}`)
    assert.equal(actionMap[info.id].view, true)
    assert.equal(actionMap[info.id].create, true)
    assert.equal(actionMap[info.id].edit, true)
    assert.equal(actionMap[info.id].delete, true)
  }
})
