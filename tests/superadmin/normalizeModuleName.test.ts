import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeModuleName } from '../../src/modules/superadmin/utils/normalizeModuleName.ts'

test('normalizeModuleName maps Hospitalización variants to hospitalizacion', () => {
  assert.equal(normalizeModuleName('Hospitalización'), 'hospitalizacion')
  assert.equal(normalizeModuleName('hospitalizacion'), 'hospitalizacion')
  assert.equal(normalizeModuleName('Hospitalizacion'), 'hospitalizacion')
  assert.equal(normalizeModuleName(' HOSPITALIZACIÓN '), 'hospitalizacion')
  assert.equal(normalizeModuleName('Hospital'), 'hospitalizacion')
})

test('normalizeModuleName preserves mappings for all other modules', () => {
  assert.equal(normalizeModuleName('Usuarios'), 'usuarios')
  assert.equal(normalizeModuleName('Especies y Razas'), 'especiesRazas')
  assert.equal(normalizeModuleName('Mascotas'), 'mascotas')
  assert.equal(normalizeModuleName('Dueños'), 'duenos')
  assert.equal(normalizeModuleName('Clientes'), 'duenos')
  assert.equal(normalizeModuleName('Servicios'), 'servicios')
  assert.equal(normalizeModuleName('Profesionales'), 'profesionales')
  assert.equal(normalizeModuleName('Veterinarios'), 'profesionales')
  assert.equal(normalizeModuleName('Disponibilidad'), 'disponibilidad')
  assert.equal(normalizeModuleName('Citas'), 'agenda')
  assert.equal(normalizeModuleName('Agenda'), 'agenda')
  assert.equal(normalizeModuleName('Historiales Clínicos'), 'historiaClinica')
  assert.equal(normalizeModuleName('Reportes'), 'reportes')
  assert.equal(normalizeModuleName('Órdenes Médicas'), 'ordenesMedicas')
  assert.equal(normalizeModuleName('Insumos'), 'insumos')
})

test('normalizeModuleName returns null for unknown module names', () => {
  assert.equal(normalizeModuleName('Facturación'), null)
  assert.equal(normalizeModuleName('ConfiguracionGeneral'), null)
  assert.equal(normalizeModuleName(''), null)
})
