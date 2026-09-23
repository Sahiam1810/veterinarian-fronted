import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildUnifiedPendingOrders,
  filterPendingOrders,
} from '../../src/modules/veterinario/utils/pendingOrdersView.ts'

// Réplica local mínima de PendingMedicationOrder/PendingProcedureOrder (ordenesMedicasService.ts):
// ese archivo importa vetApiFetch -> @/modules/auth, cuyo barrel arrastra páginas .tsx, y
// tsconfig.node.json (el que gobierna tests/) no tiene jsx configurado -- importar el tipo
// desde ahí rompe `pnpm lint`. El tipado estructural de TS hace este duplicado seguro.
interface PendingMedicationOrder {
  id: string
  petName: string
  ownerName: string
  appointmentId: string
  isInHouse: boolean
  status: string
  createdAt: string
  items: unknown[]
}

type PendingProcedureOrder = PendingMedicationOrder & { resultFileUrl?: string | null }

function medicationOrder(overrides: Partial<PendingMedicationOrder> = {}): PendingMedicationOrder {
  return {
    id: 'med-1',
    petName: 'Firulais',
    ownerName: 'Ana Dueña',
    appointmentId: 'apt-1',
    isInHouse: true,
    status: 'Pendiente',
    createdAt: '2026-09-20T10:00:00Z',
    items: [],
    ...overrides,
  }
}

function procedureOrder(overrides: Partial<PendingProcedureOrder> = {}): PendingProcedureOrder {
  return {
    id: 'proc-1',
    petName: 'Michi',
    ownerName: 'Carlos Cliente',
    appointmentId: 'apt-2',
    isInHouse: true,
    status: 'Pendiente',
    createdAt: '2026-09-21T10:00:00Z',
    items: [],
    ...overrides,
  }
}

test('buildUnifiedPendingOrders junta medicamentos y procedimientos en una sola lista', () => {
  const result = buildUnifiedPendingOrders([medicationOrder()], [procedureOrder()])

  assert.equal(result.length, 2)
  assert.ok(result.some((o) => o.type === 'MEDICAMENTO' && o.id === 'med-1'))
  assert.ok(result.some((o) => o.type === 'PROCEDIMIENTO' && o.id === 'proc-1'))
})

test('buildUnifiedPendingOrders ordena de más reciente a más antiguo', () => {
  const older = medicationOrder({ id: 'med-old', createdAt: '2026-09-18T00:00:00Z' })
  const newer = procedureOrder({ id: 'proc-new', createdAt: '2026-09-22T00:00:00Z' })

  const result = buildUnifiedPendingOrders([older], [newer])

  assert.equal(result[0].id, 'proc-new')
  assert.equal(result[1].id, 'med-old')
})

test('buildUnifiedPendingOrders usa un placeholder si falta el nombre de mascota o dueño', () => {
  const result = buildUnifiedPendingOrders(
    [medicationOrder({ petName: '', ownerName: '' })],
    [],
  )

  assert.equal(result[0].petName, 'Mascota no registrada')
  assert.equal(result[0].ownerName, 'Cliente no registrado')
})

test('filterPendingOrders filtra por tipo', () => {
  const unified = buildUnifiedPendingOrders([medicationOrder()], [procedureOrder()])

  const soloMedicamentos = filterPendingOrders(unified, 'MEDICAMENTO', '')
  const soloProcedimientos = filterPendingOrders(unified, 'PROCEDIMIENTO', '')

  assert.equal(soloMedicamentos.length, 1)
  assert.equal(soloMedicamentos[0].type, 'MEDICAMENTO')
  assert.equal(soloProcedimientos.length, 1)
  assert.equal(soloProcedimientos[0].type, 'PROCEDIMIENTO')
})

test('filterPendingOrders busca por mascota, dueño o id, sin distinguir mayúsculas', () => {
  const unified = buildUnifiedPendingOrders([medicationOrder()], [procedureOrder()])

  assert.equal(filterPendingOrders(unified, 'TODOS', 'firulais').length, 1)
  assert.equal(filterPendingOrders(unified, 'TODOS', 'CARLOS').length, 1)
  assert.equal(filterPendingOrders(unified, 'TODOS', 'proc-1').length, 1)
  assert.equal(filterPendingOrders(unified, 'TODOS', 'nadie-existe').length, 0)
})
