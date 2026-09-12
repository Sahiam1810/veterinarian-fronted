import assert from 'node:assert/strict'
import test from 'node:test'

import { buildDuenoDrawerFormState } from '../../src/modules/superadmin/utils/buildDuenoDrawerFormState.ts'
import type { SuperAdminDueno } from '../../src/modules/superadmin/types/mascotasSuperAdmin.types.ts'

const editingDueno: SuperAdminDueno = {
  id: 'dueno-1',
  name: 'Carlos Ruiz',
  documentId: '1098765432',
  email: 'carlos@huellitas.test',
  phone: '3001234567',
  address: 'Calle 123 #45-67',
  city: 'Medellín',
  status: 'Inactivo',
  registrationDate: '2026-01-15',
}

test('abrir el drawer con editingDueno puebla los 7 campos con valores reales', () => {
  const form = buildDuenoDrawerFormState(editingDueno)

  assert.deepEqual(form, {
    name: 'Carlos Ruiz',
    documentId: '1098765432',
    email: 'carlos@huellitas.test',
    phone: '3001234567',
    address: 'Calle 123 #45-67',
    city: 'Medellín',
    status: 'Inactivo',
  })
})

test('modo Registrar (sin editingDueno) resetea a vacío/valores por defecto', () => {
  const afterEdit = buildDuenoDrawerFormState(editingDueno)
  assert.equal(afterEdit.name, 'Carlos Ruiz')

  const createMode = buildDuenoDrawerFormState(null)

  assert.deepEqual(createMode, {
    name: '',
    documentId: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bogotá',
    status: 'Activo',
  })
  assert.notEqual(createMode.name, afterEdit.name)
  assert.notEqual(createMode.documentId, afterEdit.documentId)
})
