import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatPetWeight,
  parseWeightToDecimal,
  mapPetToMascota,
} from '../../src/modules/superadmin/utils/superAdminApiMappers.ts'
import type { ApiPetResponse } from '../../src/modules/superadmin/services/superAdminPetsService.ts'
import { buildVetMascotasDirectory } from '../../src/modules/veterinario/utils/buildVetMascotasDirectory.ts'
import { mapDbPetToUi } from '../../src/modules/cliente/utils/dbMappers.ts'
import type { DbPet } from '../../src/modules/cliente/types/db.types.ts'

test('formatPetWeight returns "Sin peso" for null, undefined, empty or non-positive values', () => {
  assert.equal(formatPetWeight(null), 'Sin peso')
  assert.equal(formatPetWeight(undefined), 'Sin peso')
  assert.equal(formatPetWeight(''), 'Sin peso')
  assert.equal(formatPetWeight('   '), 'Sin peso')
  assert.equal(formatPetWeight(0), 'Sin peso')
  assert.equal(formatPetWeight(-5), 'Sin peso')
})

test('formatPetWeight formats valid positive numbers and strings as "{weight} kg"', () => {
  assert.equal(formatPetWeight(12.5), '12.5 kg')
  assert.equal(formatPetWeight('12.5'), '12.5 kg')
  assert.equal(formatPetWeight(4), '4 kg')
})

test('formatPetWeight preserves legacy 0.01 kg without converting to Sin peso', () => {
  assert.equal(formatPetWeight(0.01), '0.01 kg')
  assert.equal(formatPetWeight('0.01'), '0.01 kg')
})

test('parseWeightToDecimal converts empty/zero/null values to null and valid values to numbers', () => {
  assert.equal(parseWeightToDecimal(null), null)
  assert.equal(parseWeightToDecimal(undefined), null)
  assert.equal(parseWeightToDecimal(''), null)
  assert.equal(parseWeightToDecimal('0'), null)
  assert.equal(parseWeightToDecimal(0), null)
  assert.equal(parseWeightToDecimal(-1), null)
  assert.equal(parseWeightToDecimal(12.5), 12.5)
  assert.equal(parseWeightToDecimal('12.5'), 12.5)
  assert.equal(parseWeightToDecimal(0.01), 0.01)
})

test('mapPetToMascota maps null pet weight correctly to "Sin peso"', () => {
  const petWithNullWeight: ApiPetResponse = {
    id: 'pet-1',
    name: 'Firulais',
    speciesId: 'sp-1',
    raceId: 'rc-1',
    age: 2,
    gender: 'Macho',
    weight: null,
    observations: null,
    photoUrl: null,
  }

  const mascota = mapPetToMascota({
    pet: petWithNullWeight,
    speciesName: 'Canino',
    raceName: 'Labrador',
    owner: {
      id: 'c-1',
      name: 'Juan Perez',
      email: 'juan@test.com',
      documentId: '12345',
      phone: '3001234567',
      address: 'Calle 1',
      city: 'Bogotá',
      status: 'Activo',
      registrationDate: '2026-01-01',
      mascotasSummary: [],
    },
  })

  assert.equal(mascota.weight, 'Sin peso')
  assert.equal(mascota.ownerName, 'Juan Perez')
  assert.equal(mascota.species, 'Canino')
  assert.equal(mascota.breed, 'Labrador')
})

test('mapPetToMascota maps valid and legacy 0.01 weights with "kg"', () => {
  const petValid: ApiPetResponse = {
    id: 'pet-2',
    name: 'Mishi',
    speciesId: 'sp-2',
    raceId: 'rc-2',
    age: 1,
    gender: 'Hembra',
    weight: 12.5,
    observations: null,
    photoUrl: null,
  }

  const mascotaValid = mapPetToMascota({
    pet: petValid,
    speciesName: 'Felino',
    raceName: 'Siamés',
  })
  assert.equal(mascotaValid.weight, '12.5 kg')

  const petLegacy: ApiPetResponse = {
    id: 'pet-3',
    name: 'Pelusa',
    speciesId: 'sp-1',
    raceId: 'rc-1',
    age: 4,
    gender: 'Hembra',
    weight: 0.01,
    observations: null,
    photoUrl: null,
  }

  const mascotaLegacy = mapPetToMascota({
    pet: petLegacy,
    speciesName: 'Canino',
    raceName: 'Criollo',
  })
  assert.equal(mascotaLegacy.weight, '0.01 kg')
})

test('buildVetMascotasDirectory correctly handles null, valid, and legacy pet weights', () => {
  const result = buildVetMascotasDirectory({
    pets: [
      {
        id: 'p-null',
        name: 'Sin Peso Pet',
        age: 3,
        gender: 'Macho',
        weight: null,
        observations: null,
        speciesId: 's-1',
        raceId: 'r-1',
        photoUrl: null,
      },
      {
        id: 'p-valid',
        name: 'Valid Pet',
        age: 5,
        gender: 'Hembra',
        weight: 18.2,
        observations: null,
        speciesId: 's-1',
        raceId: 'r-1',
        photoUrl: null,
      },
      {
        id: 'p-legacy',
        name: 'Legacy Pet',
        age: 1,
        gender: 'Macho',
        weight: 0.01,
        observations: null,
        speciesId: 's-1',
        raceId: 'r-1',
        photoUrl: null,
      },
    ],
    clients: [],
    clientPets: [],
    species: [],
    races: [],
    appointments: [],
  })

  assert.equal(result.detailsById['p-null'].weightLabel, 'Sin peso')
  assert.equal(result.detailsById['p-valid'].weightLabel, '18.2 kg')
  assert.equal(result.detailsById['p-legacy'].weightLabel, '0.01 kg')
})

test('mapDbPetToUi maps null weight to "Sin peso" and preserves valid / legacy weights', () => {
  const dbPetNull: DbPet = {
    pet_id: 1,
    name: 'Rocky',
    species_id: 1,
    race_id: 1,
    age: 3,
    gender: 'Macho',
    weight_kg: null,
    observations: null,
  }

  const profileNull = mapDbPetToUi(dbPetNull)
  assert.equal(profileNull.weightLabel, 'Sin peso')

  const dbPetValid: DbPet = {
    ...dbPetNull,
    pet_id: 2,
    weight_kg: 7.5,
  }
  const profileValid = mapDbPetToUi(dbPetValid)
  assert.equal(profileValid.weightLabel, '7.5 kg')

  const dbPetLegacy: DbPet = {
    ...dbPetNull,
    pet_id: 3,
    weight_kg: 0.01,
  }
  const profileLegacy = mapDbPetToUi(dbPetLegacy)
  assert.equal(profileLegacy.weightLabel, '0.01 kg')
})

