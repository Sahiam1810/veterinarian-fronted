import assert from 'node:assert/strict'
import test from 'node:test'

import { buildVetMascotasDirectory } from '../../src/modules/veterinario/utils/buildVetMascotasDirectory.ts'
import type {
  ApiAppointment,
  ApiClient,
  ApiClientPet,
  ApiNamedCatalog,
  ApiPet,
} from '../../src/modules/veterinario/api/apiTypes.ts'

const mockPets: ApiPet[] = [
  {
    id: 'p-1',
    name: 'Bella',
    age: 3,
    gender: 'Hembra',
    weight: 8,
    observations: null,
    speciesId: 's-1',
    raceId: 'r-1',
    photoUrl: null,
  },
  {
    id: 'p-2',
    name: 'Luna',
    age: 2,
    gender: 'Hembra',
    weight: 4,
    observations: 'Alergia a penicilina',
    speciesId: 's-2',
    raceId: 'r-2',
    photoUrl: null,
  },
]

const mockClients: ApiClient[] = [
  {
    id: 'c-1',
    userId: 'u-1',
    fullName: 'María Fernández',
    identificationNumber: '1088899900',
    phoneNumber: '+57 300 123 4567',
    address: 'Blvd. Sueños Rotos',
    registrationDate: '2026-01-01',
    createdAt: '2026-01-01',
  },
  {
    id: 'c-2',
    userId: 'u-2',
    fullName: null,
    identificationNumber: '1032456789',
    phoneNumber: null,
    address: 'Calle 10 # 5-20',
    registrationDate: '2026-01-01',
    createdAt: '2026-01-01',
  },
]

const mockClientPets: ApiClientPet[] = [
  {
    id: 'cp-1',
    clientId: 'c-1',
    petId: 'p-1',
    isPrimaryOwner: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cp-2',
    clientId: 'c-2',
    petId: 'p-2',
    isPrimaryOwner: true,
    createdAt: '2026-01-01',
  },
]

const mockSpecies: ApiNamedCatalog[] = [
  { id: 's-1', name: 'Canino' },
  { id: 's-2', name: 'Felino' },
]

const mockRaces: ApiNamedCatalog[] = [
  { id: 'r-1', name: 'Criollo / Mestizo' },
  { id: 'r-2', name: 'Siamés' },
]

const mockAppointments: ApiAppointment[] = []

test('buildVetMascotasDirectory prioriza client.fullName sobre la cédula', () => {
  const result = buildVetMascotasDirectory({
    pets: mockPets,
    clients: mockClients,
    clientPets: mockClientPets,
    species: mockSpecies,
    races: mockRaces,
    appointments: mockAppointments,
  })

  const bellaItem = result.items.find((item) => item.id === 'p-1')
  assert.ok(bellaItem)
  assert.equal(bellaItem.ownerName, 'María Fernández')

  const bellaDetail = result.detailsById['p-1']
  assert.ok(bellaDetail)
  assert.equal(bellaDetail.ownerName, 'María Fernández')
  assert.equal(bellaDetail.ownerPhone, '+57 300 123 4567')
})

test('buildVetMascotasDirectory cae a "Cliente {cedula}" solo cuando no hay fullName', () => {
  const result = buildVetMascotasDirectory({
    pets: mockPets,
    clients: mockClients,
    clientPets: mockClientPets,
    species: mockSpecies,
    races: mockRaces,
    appointments: mockAppointments,
  })

  const lunaItem = result.items.find((item) => item.id === 'p-2')
  assert.ok(lunaItem)
  assert.equal(lunaItem.ownerName, 'Cliente 1032456789')

  const lunaDetail = result.detailsById['p-2']
  assert.ok(lunaDetail)
  assert.equal(lunaDetail.ownerName, 'Cliente 1032456789')
  assert.equal(lunaDetail.ownerPhone, 'Calle 10 # 5-20')
})
