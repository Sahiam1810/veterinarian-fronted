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

const MOCK_SERVICIOS: ProfessionalFilterOption[] = [
  { id: 's1', name: 'Consulta General', subtitle: 'Atención básica y revisión' },
  { id: 's2', name: 'Vacunación Antirrábica', subtitle: 'Inmunización canina y felina' },
  { id: 's3', name: 'Cirugía Menor', subtitle: 'Procedimiento ambulatorio' },
  { id: 's4', name: 'Desparasitación Integral' },
]

const MOCK_DUENOS: ProfessionalFilterOption[] = [
  { id: 'd1', name: 'Ramiro Romero', subtitle: '3055968432 - 05165156' },
  { id: 'd2', name: 'María Fernanda Ruiz', subtitle: '3104567890 - 10203040' },
  { id: 'd3', name: 'Carlos Andrés Gómez', subtitle: '3201234567 - 98765432' },
]

const MOCK_ESPECIES: ProfessionalFilterOption[] = [
  { id: 'sp1', name: 'Canino' },
  { id: 'sp2', name: 'Felino' },
  { id: 'sp3', name: 'Aves' },
  { id: 'sp4', name: 'Roedores' },
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

test('filterProfessionals filtra servicios en CitaDrawer en tiempo real', () => {
  const resultVac = filterProfessionals(MOCK_SERVICIOS, 'vac')
  assert.equal(resultVac.length, 1)
  assert.equal(resultVac[0]?.id, 's2')
  assert.equal(resultVac[0]?.name, 'Vacunación Antirrábica')

  const resultCirugia = filterProfessionals(MOCK_SERVICIOS, 'cirugia')
  assert.equal(resultCirugia.length, 1)
  assert.equal(resultCirugia[0]?.id, 's3')
  assert.equal(resultCirugia[0]?.name, 'Cirugía Menor')

  const resultInexistente = filterProfessionals(MOCK_SERVICIOS, 'radiologia avanzada')
  assert.equal(resultInexistente.length, 0)
})

test('filterProfessionals filtra dueños por nombre, teléfono o cédula en tiempo real', () => {
  // Filtro por nombre
  const resultNombre = filterProfessionals(MOCK_DUENOS, 'ramiro')
  assert.equal(resultNombre.length, 1)
  assert.equal(resultNombre[0]?.id, 'd1')
  assert.equal(resultNombre[0]?.name, 'Ramiro Romero')

  // Filtro por cédula en subtítulo
  const resultCedula = filterProfessionals(MOCK_DUENOS, '05165156')
  assert.equal(resultCedula.length, 1)
  assert.equal(resultCedula[0]?.id, 'd1')

  // Filtro por teléfono en subtítulo
  const resultTelefono = filterProfessionals(MOCK_DUENOS, '310456')
  assert.equal(resultTelefono.length, 1)
  assert.equal(resultTelefono[0]?.id, 'd2')

  // Filtro inexistente
  const resultInexistente = filterProfessionals(MOCK_DUENOS, '999999999')
  assert.equal(resultInexistente.length, 0)
})

test('filterProfessionals filtra especies en RazaDrawer en tiempo real', () => {
  const resultCan = filterProfessionals(MOCK_ESPECIES, 'can')
  assert.equal(resultCan.length, 1)
  assert.equal(resultCan[0]?.id, 'sp1')
  assert.equal(resultCan[0]?.name, 'Canino')

  const resultFel = filterProfessionals(MOCK_ESPECIES, 'felino')
  assert.equal(resultFel.length, 1)
  assert.equal(resultFel[0]?.id, 'sp2')
  assert.equal(resultFel[0]?.name, 'Felino')

  const resultInexistente = filterProfessionals(MOCK_ESPECIES, 'reptil')
  assert.equal(resultInexistente.length, 0)
})

test('resolveProfessionalLabel retorna "Todos los Profesionales" cuando value es "all" o vacío con hasAllOption=true', () => {
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, 'all'), 'Todos los Profesionales')
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, ''), 'Todos los Profesionales')
})

test('resolveProfessionalLabel retorna el nombre del profesional cuando value coincide', () => {
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, 'p1'), 'Dr. Santiago Becerra')
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, 'p3'), 'Dr. Ángel Ramírez')
})

test('resolveProfessionalLabel maneja IDs no encontrados retornando allOptionLabel con hasAllOption=true', () => {
  assert.equal(resolveProfessionalLabel(MOCK_PROFESIONALES, 'id_desconocido'), 'Todos los Profesionales')
})

test('resolveProfessionalLabel con hasAllOption=false retorna cadena vacía cuando value es vacío o no coincide', () => {
  assert.equal(resolveProfessionalLabel(MOCK_SERVICIOS, '', 'Todos los Servicios', 'all', false), '')
  assert.equal(resolveProfessionalLabel(MOCK_SERVICIOS, 's1', 'Todos los Servicios', 'all', false), 'Consulta General')
  assert.equal(resolveProfessionalLabel(MOCK_SERVICIOS, 's2', 'Todos los Servicios', 'all', false), 'Vacunación Antirrábica')
  assert.equal(resolveProfessionalLabel(MOCK_SERVICIOS, 'no_existe', 'Todos los Servicios', 'all', false), '')
  assert.equal(resolveProfessionalLabel(MOCK_ESPECIES, 'sp1', 'Todas las Especies', 'all', false), 'Canino')
})
