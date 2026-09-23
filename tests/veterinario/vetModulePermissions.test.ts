import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createVetPermissionHelpers,
  VET_MODULE_ID_TO_API_MODULE,
} from '../../src/modules/veterinario/utils/vetModulePermissions.ts'

const HISTORIA_CLINICA_MODULE = VET_MODULE_ID_TO_API_MODULE.historiaClinica

test('vet permission helpers map shell modules to API modules', () => {
  const helpers = createVetPermissionHelpers({
    Citas: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    [HISTORIA_CLINICA_MODULE]: { canView: true, canCreate: true, canEdit: false, canDelete: false },
    Reportes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  })

  assert.equal(helpers.canViewModule('agenda'), true)
  assert.equal(helpers.canCreateModule('agenda'), true)
  assert.equal(helpers.canEditModule('agenda'), true)
  assert.equal(helpers.canDeleteModule('agenda'), false)
  assert.equal(helpers.canCreateModule('historiaClinica'), true)
  assert.equal(helpers.canViewModule('reportes'), true)
})

test('vet permission helpers never allow actions without View', () => {
  const helpers = createVetPermissionHelpers({
    Citas: { canView: false, canCreate: true, canEdit: true, canDelete: true },
  })

  assert.equal(helpers.canViewModule('agenda'), false)
  assert.equal(helpers.canCreateModule('agenda'), false)
  assert.equal(helpers.canEditModule('agenda'), false)
  assert.equal(helpers.canDeleteModule('agenda'), false)
})

test('vet permission helpers close Mascotas actions with Mascotas.View', () => {
  const helpers = createVetPermissionHelpers({
    Mascotas: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  })

  assert.equal(helpers.canViewModule('mascotas'), true)
  assert.equal(helpers.canCreateModule('mascotas'), true)
  assert.equal(helpers.canEditModule('mascotas'), true)
  assert.equal(helpers.canDeleteModule('mascotas'), true)
})

test('vet permission helpers do not allow Mascotas actions without Mascotas.View', () => {
  const helpers = createVetPermissionHelpers({
    Mascotas: { canView: false, canCreate: true, canEdit: true, canDelete: true },
  })

  assert.equal(helpers.canViewModule('mascotas'), false)
  assert.equal(helpers.canCreateModule('mascotas'), false)
  assert.equal(helpers.canEditModule('mascotas'), false)
  assert.equal(helpers.canDeleteModule('mascotas'), false)
})

test('vet permission helpers map Clientes to the Duenos module', () => {
  const helpers = createVetPermissionHelpers({
    Clientes: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  })

  assert.equal(helpers.canViewModule('duenos'), true)
  assert.equal(helpers.canCreateModule('duenos'), true)
  assert.equal(helpers.canEditModule('duenos'), true)
  assert.equal(helpers.canDeleteModule('duenos'), true)
})

test('vet permission helpers do not allow Duenos actions without Clientes.View', () => {
  const helpers = createVetPermissionHelpers({
    Clientes: { canView: false, canCreate: true, canEdit: true, canDelete: true },
  })

  assert.equal(helpers.canViewModule('duenos'), false)
  assert.equal(helpers.canCreateModule('duenos'), false)
  assert.equal(helpers.canEditModule('duenos'), false)
  assert.equal(helpers.canDeleteModule('duenos'), false)
})

test('vet permission helpers close Historia Clinica create with View', () => {
  const helpers = createVetPermissionHelpers({
    [HISTORIA_CLINICA_MODULE]: { canView: false, canCreate: true, canEdit: true, canDelete: true },
  })

  assert.equal(helpers.canViewModule('historiaClinica'), false)
  assert.equal(helpers.canCreateModule('historiaClinica'), false)
  assert.equal(helpers.canEditModule('historiaClinica'), false)
  assert.equal(helpers.canDeleteModule('historiaClinica'), false)
})

test('vet final matrix allows viewing Mascotas without write buttons', () => {
  const helpers = createVetPermissionHelpers({
    Mascotas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  })

  assert.equal(helpers.canViewModule('mascotas'), true)
  assert.equal(helpers.canCreateModule('mascotas'), false)
  assert.equal(helpers.canEditModule('mascotas'), false)
  assert.equal(helpers.canDeleteModule('mascotas'), false)
})

test('vet final matrix exposes Citas edit and delete independently', () => {
  const onlyEdit = createVetPermissionHelpers({
    Citas: { canView: true, canCreate: false, canEdit: true, canDelete: false },
  })
  const onlyDelete = createVetPermissionHelpers({
    Citas: { canView: true, canCreate: false, canEdit: false, canDelete: true },
  })

  assert.equal(onlyEdit.canViewModule('agenda'), true)
  assert.equal(onlyEdit.canCreateModule('agenda'), false)
  assert.equal(onlyEdit.canEditModule('agenda'), true)
  assert.equal(onlyEdit.canDeleteModule('agenda'), false)
  assert.equal(onlyDelete.canViewModule('agenda'), true)
  assert.equal(onlyDelete.canEditModule('agenda'), false)
  assert.equal(onlyDelete.canDeleteModule('agenda'), true)
})

test('vet final matrix exposes Historia Clinica view and create independently', () => {
  const onlyView = createVetPermissionHelpers({
    [HISTORIA_CLINICA_MODULE]: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  })
  const viewAndCreate = createVetPermissionHelpers({
    [HISTORIA_CLINICA_MODULE]: { canView: true, canCreate: true, canEdit: false, canDelete: false },
  })

  assert.equal(onlyView.canViewModule('historiaClinica'), true)
  assert.equal(onlyView.canCreateModule('historiaClinica'), false)
  assert.equal(viewAndCreate.canViewModule('historiaClinica'), true)
  assert.equal(viewAndCreate.canCreateModule('historiaClinica'), true)
})

test('vet final matrix exposes Reportes only with View', () => {
  const hidden = createVetPermissionHelpers({
    Reportes: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  })
  const visible = createVetPermissionHelpers({
    Reportes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  })

  assert.equal(hidden.canViewModule('reportes'), false)
  assert.equal(visible.canViewModule('reportes'), true)
})

test('vet permission helpers map Especies y Razas to especiesRazas and gate actions by View', () => {
  const withoutView = createVetPermissionHelpers({
    'Especies y Razas': { canView: false, canCreate: true, canEdit: true, canDelete: true },
  })
  const full = createVetPermissionHelpers({
    'Especies y Razas': { canView: true, canCreate: true, canEdit: true, canDelete: false },
  })

  assert.equal(withoutView.canViewModule('especiesRazas'), false)
  assert.equal(withoutView.canCreateModule('especiesRazas'), false)
  assert.equal(withoutView.canEditModule('especiesRazas'), false)
  assert.equal(withoutView.canDeleteModule('especiesRazas'), false)

  assert.equal(full.canViewModule('especiesRazas'), true)
  assert.equal(full.canCreateModule('especiesRazas'), true)
  assert.equal(full.canEditModule('especiesRazas'), true)
  assert.equal(full.canDeleteModule('especiesRazas'), false)
})

test('vet permission helpers map Servicios to servicios and gate actions by View', () => {
  const withoutView = createVetPermissionHelpers({
    Servicios: { canView: false, canCreate: true, canEdit: true, canDelete: true },
  })
  const viewOnly = createVetPermissionHelpers({
    Servicios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  })

  assert.equal(withoutView.canViewModule('servicios'), false)
  assert.equal(withoutView.canCreateModule('servicios'), false)

  assert.equal(viewOnly.canViewModule('servicios'), true)
  assert.equal(viewOnly.canCreateModule('servicios'), false)
  assert.equal(viewOnly.canEditModule('servicios'), false)
  assert.equal(viewOnly.canDeleteModule('servicios'), false)
})

test('vet permission helpers map Veterinarios to profesionales and gate actions by View', () => {
  const withoutView = createVetPermissionHelpers({
    Veterinarios: { canView: false, canCreate: true, canEdit: true, canDelete: true },
  })
  const full = createVetPermissionHelpers({
    Veterinarios: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  })

  assert.equal(withoutView.canViewModule('profesionales'), false)
  assert.equal(withoutView.canCreateModule('profesionales'), false)

  assert.equal(full.canViewModule('profesionales'), true)
  assert.equal(full.canCreateModule('profesionales'), true)
  assert.equal(full.canEditModule('profesionales'), true)
  assert.equal(full.canDeleteModule('profesionales'), true)
})

