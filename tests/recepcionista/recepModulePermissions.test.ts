import assert from 'node:assert/strict'
import test from 'node:test'

import { createRecepPermissionHelpers } from '../../src/modules/recepcionista/utils/recepModulePermissions.ts'

test('recep permissions require View before allowing Create/Edit/Delete', () => {
  const helpers = createRecepPermissionHelpers({
    Mascotas: {
      canView: false,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    Clientes: {
      canView: false,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    Citas: {
      canView: false,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  })

  assert.equal(helpers.canCreateModule('mascotas'), false)
  assert.equal(helpers.canEditModule('mascotas'), false)
  assert.equal(helpers.canDeleteModule('mascotas'), false)
  assert.equal(helpers.canCreateModule('duenos'), false)
  assert.equal(helpers.canEditModule('duenos'), false)
  assert.equal(helpers.canCreateModule('agenda'), false)
  assert.equal(helpers.canEditModule('agenda'), false)
})

test('recep permissions map modules to the expected backend permissions', () => {
  const helpers = createRecepPermissionHelpers({
    Mascotas: {
      canView: true,
      canCreate: true,
      canEdit: false,
      canDelete: false,
    },
    Clientes: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
    Citas: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    Chat: {
      canView: true,
      canCreate: true,
      canEdit: false,
      canDelete: false,
    },
    Escalamientos: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
  })

  assert.equal(helpers.canViewModule('mascotas'), true)
  assert.equal(helpers.canCreateModule('mascotas'), true)
  assert.equal(helpers.canEditModule('mascotas'), false)

  assert.equal(helpers.canViewModule('duenos'), true)
  assert.equal(helpers.canCreateModule('duenos'), false)
  assert.equal(helpers.canEditModule('duenos'), true)

  assert.equal(helpers.canViewModule('agenda'), true)
  assert.equal(helpers.canCreateModule('agenda'), true)
  assert.equal(helpers.canEditModule('agenda'), true)
  assert.equal(helpers.canDeleteModule('agenda'), true)

  assert.equal(helpers.canViewModule('conversaciones'), true)
  assert.equal(helpers.canCreateModule('conversaciones'), true)
  assert.equal(helpers.canEditModule('conversaciones'), true)
  assert.equal(helpers.canDeleteModule('conversaciones'), false)
})

test('recep Asesor requires Chat.View and Escalamientos.View', () => {
  const withoutEscalationsView = createRecepPermissionHelpers({
    Chat: {
      canView: true,
      canCreate: true,
      canEdit: false,
      canDelete: false,
    },
    Escalamientos: {
      canView: false,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
  })

  assert.equal(withoutEscalationsView.canViewModule('conversaciones'), false)
  assert.equal(withoutEscalationsView.canCreateModule('conversaciones'), false)
  assert.equal(withoutEscalationsView.canEditModule('conversaciones'), false)
})

test('recep permissions support Especies y Razas, Servicios, Veterinarios, Reportes', () => {
  const helpers = createRecepPermissionHelpers({
    'Especies y Razas': {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    Servicios: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
    Veterinarios: {
      canView: true,
      canCreate: true,
      canEdit: false,
      canDelete: true,
    },
    Reportes: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  })

  assert.equal(helpers.canViewModule('especiesRazas'), true)
  assert.equal(helpers.canCreateModule('especiesRazas'), true)
  assert.equal(helpers.canEditModule('especiesRazas'), true)
  assert.equal(helpers.canDeleteModule('especiesRazas'), false)

  assert.equal(helpers.canViewModule('servicios'), true)
  assert.equal(helpers.canCreateModule('servicios'), false)
  assert.equal(helpers.canEditModule('servicios'), true)
  assert.equal(helpers.canDeleteModule('servicios'), false)

  assert.equal(helpers.canViewModule('profesionales'), true)
  assert.equal(helpers.canCreateModule('profesionales'), true)
  assert.equal(helpers.canEditModule('profesionales'), false)
  assert.equal(helpers.canDeleteModule('profesionales'), true)

  assert.equal(helpers.canViewModule('reportes'), true)
  assert.equal(helpers.canCreateModule('reportes'), false)
  assert.equal(helpers.canEditModule('reportes'), false)
  assert.equal(helpers.canDeleteModule('reportes'), false)
})

