import assert from 'node:assert/strict'
import test from 'node:test'

import { filterAuxMascotas } from '../../src/modules/auxiliar/utils/auxMascotasFilter.ts'
import type { MascotaAuxSearchFields } from '../../src/modules/auxiliar/utils/auxMascotasFilter.ts'

type MascotaAuxItem = MascotaAuxSearchFields & {
  id: string
  petId: string
  age: string
  gender: string
  weight: string
  ownerPhone?: string
  nextAppointment: string
  sterilized: 'Sí' | 'No'
  allergyAlert: string | null
  avatarUrl?: string | null
  citaActual?: { service: string; time: string; vetName: string } | null
}

function makePet(overrides: Partial<MascotaAuxItem> = {}): MascotaAuxItem {
  return {
    id: 'pet-1',
    petId: '#M-0001',
    name: 'Rocky',
    specie: 'Canino',
    breed: 'Pastor Alemán',
    age: '4 Años',
    gender: 'Macho',
    weight: '35',
    ownerName: 'Luis Miguel',
    ownerPhone: '3115556677',
    nextAppointment: 'Sin citas',
    sterilized: 'No',
    allergyAlert: null,
    avatarUrl: null,
    citaActual: null,
    ...overrides,
  }
}

// S? (unificación con Recepcionista): la página de Mascotas del auxiliar pasó
// de pestañas por especie a un buscador de texto libre, igual que
// useRecepMascotas.ts. filterAuxMascotas debe filtrar por nombre, dueño,
// raza o especie, sin distinguir mayúsculas/minúsculas.
test('filterAuxMascotas sin query devuelve todas las mascotas', () => {
  const pets = [makePet({ id: '1', name: 'Rocky' }), makePet({ id: '2', name: 'Toby' })]
  assert.equal(filterAuxMascotas(pets, '').length, 2)
  assert.equal(filterAuxMascotas(pets, '   ').length, 2)
})

test('filterAuxMascotas filtra por nombre de la mascota', () => {
  const pets = [makePet({ id: '1', name: 'Rocky' }), makePet({ id: '2', name: 'Toby' })]
  const result = filterAuxMascotas(pets, 'rocky')
  assert.equal(result.length, 1)
  assert.equal(result[0]?.id, '1')
})

test('filterAuxMascotas filtra por nombre del dueño', () => {
  const pets = [
    makePet({ id: '1', name: 'Rocky', ownerName: 'Luis Miguel' }),
    makePet({ id: '2', name: 'Toby', ownerName: 'Ana Torres' }),
  ]
  const result = filterAuxMascotas(pets, 'ana torres')
  assert.equal(result.length, 1)
  assert.equal(result[0]?.id, '2')
})

test('filterAuxMascotas filtra por raza y especie, sin distinguir mayúsculas', () => {
  const pets = [
    makePet({ id: '1', breed: 'Pastor Alemán', specie: 'Canino' }),
    makePet({ id: '2', breed: 'Siamés', specie: 'Felino' }),
  ]
  assert.equal(filterAuxMascotas(pets, 'SIAMÉS').length, 1)
  assert.equal(filterAuxMascotas(pets, 'felino')[0]?.id, '2')
})

test('filterAuxMascotas sin coincidencias devuelve lista vacía', () => {
  const pets = [makePet({ id: '1', name: 'Rocky' })]
  assert.equal(filterAuxMascotas(pets, 'inexistente').length, 0)
})
