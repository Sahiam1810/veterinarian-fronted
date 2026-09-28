import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPageItems,
  calculatePaginationBounds,
} from '../../src/modules/recepcionista/utils/recepDuenosPagination.ts'

test('getPageItems: cuando totalPages <= 5, no incluye puntos suspensivos', () => {
  // Caso 1: 1 página
  assert.deepEqual(getPageItems(1, 1), [1])

  // Caso 2: 2 páginas
  assert.deepEqual(getPageItems(1, 2), [1, 2])
  assert.deepEqual(getPageItems(2, 2), [1, 2])

  // Caso 3: 3 páginas (18 dueños / 8 por página)
  assert.deepEqual(getPageItems(1, 3), [1, 2, 3])
  assert.deepEqual(getPageItems(2, 3), [1, 2, 3])
  assert.deepEqual(getPageItems(3, 3), [1, 2, 3])

  // Caso 4: 5 páginas
  assert.deepEqual(getPageItems(3, 5), [1, 2, 3, 4, 5])
})

test('getPageItems: cuando totalPages > 5 y estamos al inicio (página 1, 2 o 3), muestra [1, 2, 3, 4, ellipsis-end, totalPages]', () => {
  assert.deepEqual(getPageItems(1, 10), [1, 2, 3, 4, 'ellipsis-end', 10])
  assert.deepEqual(getPageItems(2, 10), [1, 2, 3, 4, 'ellipsis-end', 10])
  assert.deepEqual(getPageItems(3, 10), [1, 2, 3, 4, 'ellipsis-end', 10])
})

test('getPageItems: cuando totalPages > 5 y estamos al final, muestra [1, ellipsis-start, totalPages-3, totalPages-2, totalPages-1, totalPages]', () => {
  assert.deepEqual(getPageItems(8, 10), [1, 'ellipsis-start', 7, 8, 9, 10])
  assert.deepEqual(getPageItems(9, 10), [1, 'ellipsis-start', 7, 8, 9, 10])
  assert.deepEqual(getPageItems(10, 10), [1, 'ellipsis-start', 7, 8, 9, 10])
})

test('getPageItems: cuando totalPages > 5 y estamos en el centro, muestra ambas elipsis', () => {
  assert.deepEqual(getPageItems(5, 10), [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10])
  assert.deepEqual(getPageItems(6, 10), [1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 10])
})

test('calculatePaginationBounds: calcula límites correctos en cada página', () => {
  const ITEMS_PER_PAGE = 8
  const totalCount = 18

  // Página 1:
  const bounds1 = calculatePaginationBounds(totalCount, 1, ITEMS_PER_PAGE)
  assert.equal(bounds1.totalPages, 3)
  assert.equal(bounds1.pageStart, 1)
  assert.equal(bounds1.pageEnd, 8)

  // Página 2:
  const bounds2 = calculatePaginationBounds(totalCount, 2, ITEMS_PER_PAGE)
  assert.equal(bounds2.totalPages, 3)
  assert.equal(bounds2.pageStart, 9)
  assert.equal(bounds2.pageEnd, 16)

  // Página 3:
  const bounds3 = calculatePaginationBounds(totalCount, 3, ITEMS_PER_PAGE)
  assert.equal(bounds3.totalPages, 3)
  assert.equal(bounds3.pageStart, 17)
  assert.equal(bounds3.pageEnd, 18)
})

test('calculatePaginationBounds: estado vacío (0 registros)', () => {
  const bounds = calculatePaginationBounds(0, 1, 8)
  assert.equal(bounds.totalPages, 1)
  assert.equal(bounds.pageStart, 0)
  assert.equal(bounds.pageEnd, 0)
})

test('slicing de elementos según la página actual', () => {
  const ITEMS_PER_PAGE = 8
  const mockItems = Array.from({ length: 18 }, (_, i) => ({ id: `owner-${i + 1}`, name: `Dueño ${i + 1}` }))

  // Página 1: 8 items (owner-1 a owner-8)
  const page1Items = mockItems.slice(0, ITEMS_PER_PAGE)
  assert.equal(page1Items.length, 8)
  assert.equal(page1Items[0]?.id, 'owner-1')
  assert.equal(page1Items[7]?.id, 'owner-8')

  // Página 2: 8 items (owner-9 a owner-16)
  const page2Items = mockItems.slice(8, 16)
  assert.equal(page2Items.length, 8)
  assert.equal(page2Items[0]?.id, 'owner-9')
  assert.equal(page2Items[7]?.id, 'owner-16')

  // Página 3: 2 items (owner-17 y owner-18)
  const page3Items = mockItems.slice(16, 24)
  assert.equal(page3Items.length, 2)
  assert.equal(page3Items[0]?.id, 'owner-17')
  assert.equal(page3Items[1]?.id, 'owner-18')
})

test('filtrado de dueños por búsqueda y estado', () => {
  const owners = [
    { fullName: 'Carlos Gómez', documentId: '10101', phone: '3001', email: 'carlos@test.com', code: '001', estado: 'Activo' as const },
    { fullName: 'María Pérez', documentId: '10102', phone: '3002', email: 'maria@test.com', code: '002', estado: 'Inactivo' as const },
    { fullName: 'Daniela Ortiz', documentId: '1020304061', phone: '3215550111', email: 'daniela.ortiz@correo.test', code: '017', estado: 'Activo' as const },
  ]

  // Búsqueda por nombre
  const searchName = owners.filter(o => o.fullName.toLowerCase().includes('daniela'))
  assert.equal(searchName.length, 1)
  assert.equal(searchName[0]?.fullName, 'Daniela Ortiz')

  // Búsqueda por documento
  const searchDoc = owners.filter(o => o.documentId.includes('1020304061'))
  assert.equal(searchDoc.length, 1)
  assert.equal(searchDoc[0]?.fullName, 'Daniela Ortiz')

  // Filtro de estado
  const activeOwners = owners.filter(o => o.estado === 'Activo')
  assert.equal(activeOwners.length, 2)

  const inactiveOwners = owners.filter(o => o.estado === 'Inactivo')
  assert.equal(inactiveOwners.length, 1)
  assert.equal(inactiveOwners[0]?.fullName, 'María Pérez')
})
