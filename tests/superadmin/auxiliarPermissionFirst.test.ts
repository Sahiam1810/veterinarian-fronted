import assert from 'node:assert/strict'
import test from 'node:test'

import { buildActionMap, buildViewMap } from '../../src/modules/superadmin/utils/buildAdminShellViewMap.ts'
import type { MyPermissionsMap } from '../../src/modules/auth/services/myPermissionsService.ts'
import type { ModuleId } from '../../src/modules/superadmin/types/index.ts'

const auxiliarOptions = {
  personId: 'aux-person-1',
  email: 'auxiliar@huellitas.test',
  roleId: 'aux-role-1',
}

const navItems: { id: string; moduleId: ModuleId }[] = [
  { id: 'inicio', moduleId: 'inicio' },
  { id: 'usuarios', moduleId: 'usuarios' },
  { id: 'mascotas', moduleId: 'mascotas' },
  { id: 'especies-razas', moduleId: 'especiesRazas' },
  { id: 'servicios', moduleId: 'servicios' },
  { id: 'diagnosticos', moduleId: 'historiaClinica' },
  { id: 'profesionales', moduleId: 'profesionales' },
  { id: 'agenda', moduleId: 'agenda' },
  { id: 'reportes', moduleId: 'reportes' },
]

function visibleRoutes(apiPermissions: MyPermissionsMap): string[] {
  const viewMap = buildViewMap(apiPermissions, auxiliarOptions)
  return navItems
    .filter((item) => viewMap[item.moduleId])
    .map((item) => item.id)
}

function actions(apiPermissions: MyPermissionsMap, moduleId: ModuleId) {
  return buildActionMap(apiPermissions, auxiliarOptions)[moduleId]
}

test('Auxiliar sin permisos de módulo solo ve Inicio', () => {
  assert.deepEqual(visibleRoutes({}), ['inicio'])
})

test('Auxiliar con Mascotas.View ve Mascotas sin acciones de crear', () => {
  const permissions: MyPermissionsMap = {
    Mascotas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }

  assert.deepEqual(visibleRoutes(permissions), ['inicio', 'mascotas'])
  assert.equal(actions(permissions, 'mascotas').create, false)
})

test('Auxiliar con Mascotas.Create obtiene acción crear cuando también tiene View', () => {
  const permissions: MyPermissionsMap = {
    Mascotas: { canView: true, canCreate: true, canEdit: false, canDelete: false },
  }

  assert.deepEqual(visibleRoutes(permissions), ['inicio', 'mascotas'])
  assert.equal(actions(permissions, 'mascotas').create, true)
})

test('Auxiliar sin Mascotas.View no ve Mascotas aunque llegue Create accidentalmente', () => {
  const permissions: MyPermissionsMap = {
    Mascotas: { canView: false, canCreate: true, canEdit: true, canDelete: true },
  }

  assert.deepEqual(visibleRoutes(permissions), ['inicio'])
  assert.equal(actions(permissions, 'mascotas').create, true)
})

test('Auxiliar ve Especies y Razas, Reportes y Agenda solo cuando llega View', () => {
  const permissions: MyPermissionsMap = {
    'Especies y Razas': { canView: true, canCreate: false, canEdit: false, canDelete: false },
    Reportes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    Citas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }

  assert.deepEqual(visibleRoutes(permissions), [
    'inicio',
    'especies-razas',
    'agenda',
    'reportes',
  ])
})

test('Auxiliar oculta Reportes cuando Reportes.View se quita', () => {
  const permissions: MyPermissionsMap = {
    Reportes: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  }

  assert.equal(visibleRoutes(permissions).includes('reportes'), false)
})

test('Auxiliar con Agenda.View y Agenda.Create puede crear cita; sin Create solo ve agenda', () => {
  const onlyView: MyPermissionsMap = {
    Citas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  }
  const withCreate: MyPermissionsMap = {
    Citas: { canView: true, canCreate: true, canEdit: false, canDelete: false },
  }

  assert.deepEqual(visibleRoutes(onlyView), ['inicio', 'agenda'])
  assert.equal(actions(onlyView, 'agenda').create, false)
  assert.deepEqual(visibleRoutes(withCreate), ['inicio', 'agenda'])
  assert.equal(actions(withCreate, 'agenda').create, true)
})
