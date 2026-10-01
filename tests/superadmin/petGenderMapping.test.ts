import assert from 'node:assert/strict'
import test from 'node:test'

import { mapGenderToSexo, mapSexoToGender } from '../../src/modules/superadmin/utils/superAdminApiMappers.ts'
import { mapRecepApiGenderToUi } from '../../src/modules/recepcionista/utils/recepPetMapping.ts'

test('mapGenderToSexo: F persistido por backend se muestra como Hembra', () => {
  assert.equal(mapGenderToSexo('F'), 'Hembra')
  assert.equal(mapGenderToSexo('f'), 'Hembra')
})

test('mapGenderToSexo: M persistido por backend se muestra como Macho', () => {
  assert.equal(mapGenderToSexo('M'), 'Macho')
  assert.equal(mapGenderToSexo('m'), 'Macho')
})

test('mapSexoToGender: Hembra se convierte en F para backend', () => {
  assert.equal(mapSexoToGender('Hembra'), 'F')
})

test('mapSexoToGender: Macho se convierte en M para backend', () => {
  assert.equal(mapSexoToGender('Macho'), 'M')
})

test('mapRecepApiGenderToUi: Mapea F a Hembra y M a Macho en modulo recepcionista', () => {
  assert.equal(mapRecepApiGenderToUi('F'), 'Hembra')
  assert.equal(mapRecepApiGenderToUi('M'), 'Macho')
})
