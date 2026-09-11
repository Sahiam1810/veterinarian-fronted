import assert from 'node:assert/strict'
import test from 'node:test'

import {
  filterProfessionals,
  normalizeFilterText,
  resolveProfessionalLabel,
  type ProfessionalFilterOption,
} from '../../src/modules/superadmin/utils/professionalFilter.ts'

const MOCK_PROFESIONALES: ProfessionalFilterOption[] = [
  { id: 'p1', name: 'Dr. Santiago Becerra', subtitle: 'Cirugía General' },
  { id: 'p2', name: 'Dra. Laura Pérez', subtitle: 'Dermatología' },
  { id: 'p3', name: 'Dr. Ángel Ramírez', subtitle: 'Oftalmología' },
  { id: 'p4', name: 'Dra. María José Gómez', subtitle: 'Medicina Interna' },
  { id: 'p5', name: 'Dr. Carlos Mendoza' },
]

test('normalizeFilterText elimina acentos, convierte a minúsculas y remueve espacios sobrantes', () => {
  assert.equal(normalizeFilterText('  ÁNGEL Pérez  '), 'angel perez')
  assert.equal(normalizeFilterText('María José'), 'maria jose')
  assert.equal(normalizeFilterText(''), '')
  assert.equal(normalizeFilterText('   '), '')
})

test('filterProfessionals retorna todas las opciones cuando el query está vacío', () => {
  const result = filterProfessionals(MOCK_PROFESIONALES, '')
  assert.equal(result.length, 5)

  const whitespaceResult = filterProfessionals(MOCK_PROFESIONALES, '   ')
  assert.equal(whitespaceResult.length, 5)
})

test('filterProfessionals filtra por coincidencia parcial de nombre en vivo', () => {
  const result = filterProfessionals(MOCK_PROFESIONALES, 'santi')
  assert.equal(result.length, 1)
  assert.equal(result[0]?.id, 'p1')
  assert.equal(result[0]?.name, 'Dr. Santiago Becerra')
})

test('filterProfessionals es insensible a mayúsculas y acentos/tildes', () => {
  // Búsqueda sin tilde encuentra nombre con tilde
  const resultSinTilde = filterProfessionals(MOCK_PROFESIONALES, 'angel')
  assert.equal(resultSinTilde.length, 1)
  assert.equal(resultSinTilde[0]?.id, 'p3')
  assert.equal(resultSinTilde[0]?.name, 'Dr. Ángel Ramírez')

  // Búsqueda con tilde y mayúsculas encuentra nombre
  const resultConTilde = filterProfessionals(MOCK_PROFESIONALES, 'PÉREZ')
  assert.equal(resultConTilde.length, 1)
  assert.equal(resultConTilde[0]?.id, 'p2')
  assert.equal(resultConTilde[0]?.name, 'Dra. Laura Pérez')
})

test('filterProfessionals busca también por subtítulo si está disponible', () => {
  const result = filterProfessionals(MOCK_PROFESIONALES, 'oftalmologia')
  assert.equal(result.length, 1)
  assert.equal(result[0]?.id, 'p3')
  assert.equal(result[0]?.name, 'Dr. Ángel Ramírez')
})

test('filterProfessionals retorna lista vacía cuando no hay coincidencias', () => {
  const result = filterProfessionals(MOCK_PROFESIONALES, 'veterinario inexistente')
  assert.equal(result.length, 0)
})

test('resolveProfessionalLabel retorna "Todos los Profesionales" cuando value es "all" o vacío', () => {
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, 'all'), 'Todos los Profesionales')
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, ''), 'Todos los Profesionales')
})

test('resolveProfessionalLabel retorna el nombre del profesional cuando value coincide', () => {
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, 'p1'), 'Dr. Santiago Becerra')
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, 'p3'), 'Dr. Ángel Ramírez')
})

test('resolveProfessionalLabel maneja IDs no encontrados retornando allOptionLabel', () => {
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, 'id_desconocido'), 'Todos los Profesionales')
})
