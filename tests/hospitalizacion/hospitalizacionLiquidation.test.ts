import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateHospitalizationLiquidation,
  formatLiquidationCurrency,
  isMedicationOrderDelivered,
  isProcedureOrderCompleted,
} from '../../src/modules/hospitalizacion/utils/hospitalizacionLiquidation.ts'
import type {
  ApiHospitalizationStay,
  ApiHospitalizationSupplyConsumption,
} from '../../src/modules/hospitalizacion/types/hospitalizacion.types.ts'
import type {
  ApiMedicationOrder,
  ApiProcedureOrder,
} from '../../src/modules/veterinario/services/ordenesMedicasService.ts'

const mockStay: ApiHospitalizationStay = {
  id: 'stay-1',
  clientPetId: 'cp-1',
  petName: 'Max',
  ownerName: 'Carlos Gómez',
  appointmentId: null,
  admittedAt: '2026-09-24T08:00:00Z',
  dischargedAt: null,
  status: 'Activa',
  motivo: 'Gastroenteritis aguda',
  admittedByUserId: 'usr-1',
  admittedByName: 'Dra. María',
  baseCost: 50000,
}

test('calculateHospitalizationLiquidation computes stay base cost, supplies, and excludes pending orders', () => {
  const supplies: ApiHospitalizationSupplyConsumption[] = [
    {
      id: 'sup-1',
      stayId: 'stay-1',
      supplyId: 's-1',
      supplyName: 'Jeringa 5ml',
      quantity: 3,
      unitPrice: 2000,
      subtotal: 6000,
      notes: null,
      createdAt: '2026-09-24T09:00:00Z',
    },
    {
      id: 'sup-2',
      stayId: 'stay-1',
      supplyId: 's-2',
      supplyName: 'Suero Fisiológico 500ml',
      quantity: 1,
      unitPrice: 15000,
      subtotal: 15000,
      notes: null,
      createdAt: '2026-09-24T10:00:00Z',
    },
  ]

  const medicationOrders: ApiMedicationOrder[] = [
    {
      id: 'med-ord-1',
      clientPetId: 'cp-1',
      hospitalizationStayId: 'stay-1',
      isInHouse: true,
      status: 'Pendiente', // No debe sumarse
      createdAt: '2026-09-24T09:30:00Z',
      items: [
        {
          id: 'item-1',
          medicationOrderId: 'med-ord-1',
          medicationId: 'm-1',
          medicationName: 'Omeprazol 20mg',
          unitPrice: 25000,
          quantity: 1,
          subtotal: 25000,
        },
      ],
    },
    {
      id: 'med-ord-2',
      clientPetId: 'cp-1',
      hospitalizationStayId: 'stay-1',
      isInHouse: true,
      status: 'Entregada', // Sí debe sumarse
      createdAt: '2026-09-24T11:00:00Z',
      items: [
        {
          id: 'item-2',
          medicationOrderId: 'med-ord-2',
          medicationId: 'm-2',
          medicationName: 'Metoclopramida',
          unitPrice: 12000,
          quantity: 2,
          subtotal: 24000,
        },
      ],
    },
  ]

  const procedureOrders: ApiProcedureOrder[] = [
    {
      id: 'proc-ord-1',
      clientPetId: 'cp-1',
      hospitalizationStayId: 'stay-1',
      isInHouse: true,
      status: 'Pendiente', // No debe sumarse
      createdAt: '2026-09-24T09:45:00Z',
      items: [
        {
          id: 'p-item-1',
          procedureOrderId: 'proc-ord-1',
          procedureId: 'p-1',
          procedureName: 'Ecografía Abdominal',
          unitPrice: 80000,
          quantity: 1,
          subtotal: 80000,
        },
      ],
    },
    {
      id: 'proc-ord-2',
      clientPetId: 'cp-1',
      hospitalizationStayId: 'stay-1',
      isInHouse: true,
      status: 'Completada', // Sí debe sumarse
      createdAt: '2026-09-24T12:00:00Z',
      items: [
        {
          id: 'p-item-2',
          procedureOrderId: 'proc-ord-2',
          procedureId: 'p-2',
          procedureName: 'Hemograma Completo',
          unitPrice: 45000,
          quantity: 1,
          subtotal: 45000,
        },
      ],
    },
    {
      id: 'proc-ord-3',
      clientPetId: 'cp-1',
      hospitalizationStayId: 'stay-1',
      isInHouse: true,
      status: 'Cancelada', // No debe sumarse
      createdAt: '2026-09-24T13:00:00Z',
      items: [
        {
          id: 'p-item-3',
          procedureOrderId: 'proc-ord-3',
          procedureId: 'p-3',
          procedureName: 'Radiografía',
          unitPrice: 60000,
          quantity: 1,
          subtotal: 60000,
        },
      ],
    },
  ]

  const summary = calculateHospitalizationLiquidation(mockStay, supplies, medicationOrders, procedureOrders)

  assert.equal(summary.hospitalizationTotal, 50000)
  assert.equal(summary.insumosTotal, 21000) // 6000 + 15000
  assert.equal(summary.medicamentosTotal, 24000) // Solo med-ord-2
  assert.equal(summary.procedimientosTotal, 45000) // Solo proc-ord-2
  assert.equal(summary.total, 50000 + 21000 + 24000 + 45000) // 140000
})

test('calculateHospitalizationLiquidation returns zeros for empty records', () => {
  const summary = calculateHospitalizationLiquidation(null, [], [], [])
  assert.equal(summary.hospitalizationTotal, 0)
  assert.equal(summary.insumosTotal, 0)
  assert.equal(summary.medicamentosTotal, 0)
  assert.equal(summary.procedimientosTotal, 0)
  assert.equal(summary.total, 0)
})

test('isMedicationOrderDelivered and isProcedureOrderCompleted helper status matching', () => {
  assert.equal(isMedicationOrderDelivered({ status: 'Entregada' }), true)
  assert.equal(isMedicationOrderDelivered({ status: 'entregada' }), true)
  assert.equal(isMedicationOrderDelivered({ status: 'Entregado' }), true)
  assert.equal(isMedicationOrderDelivered({ status: 'Pendiente' }), false)
  assert.equal(isMedicationOrderDelivered({ status: 'Cancelada' }), false)

  assert.equal(isProcedureOrderCompleted({ status: 'Completada' }), true)
  assert.equal(isProcedureOrderCompleted({ status: 'completada' }), true)
  assert.equal(isProcedureOrderCompleted({ status: 'Completado' }), true)
  assert.equal(isProcedureOrderCompleted({ status: 'Pendiente' }), false)
  assert.equal(isProcedureOrderCompleted({ status: 'Cancelada' }), false)
})

test('formatLiquidationCurrency formats correctly for COP', () => {
  const formatted = formatLiquidationCurrency(150000)
  assert.match(formatted, /150\.000/)
})
