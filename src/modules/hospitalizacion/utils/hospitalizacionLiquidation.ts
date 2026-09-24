import type {
  ApiHospitalizationStay,
  ApiHospitalizationSupplyConsumption,
  HospitalizationLiquidationSummary,
} from '../types/hospitalizacion.types'
import type {
  ApiMedicationOrder,
  ApiProcedureOrder,
} from '@/modules/veterinario/services/ordenesMedicasService'

export function formatLiquidationCurrency(amount: number | null | undefined): string {
  const val = amount ?? 0
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val)
}

export function isMedicationOrderDelivered(order: Pick<ApiMedicationOrder, 'status'>): boolean {
  const norm = order.status.trim().toLowerCase()
  return norm === 'entregada' || norm === 'entregado'
}

export function isProcedureOrderCompleted(order: Pick<ApiProcedureOrder, 'status'>): boolean {
  const norm = order.status.trim().toLowerCase()
  return norm === 'completada' || norm === 'completado'
}

export function calculateHospitalizationLiquidation(
  stay: ApiHospitalizationStay | null | undefined,
  supplies: ApiHospitalizationSupplyConsumption[] = [],
  medicationOrders: ApiMedicationOrder[] = [],
  procedureOrders: ApiProcedureOrder[] = [],
): HospitalizationLiquidationSummary {
  const hospitalizationTotal = stay?.baseCost ? Number(stay.baseCost) || 0 : 0

  const insumosTotal = supplies.reduce((sum, item) => {
    const subtotal = item.subtotal !== undefined && item.subtotal !== null
      ? Number(item.subtotal)
      : (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)
    return sum + (Number.isNaN(subtotal) ? 0 : subtotal)
  }, 0)

  // Solo medicamentos entregados suman a la liquidación
  const medicamentosTotal = medicationOrders
    .filter(isMedicationOrderDelivered)
    .reduce((sum, order) => {
      const orderSubtotal = (order.items || []).reduce((itemSum, item) => {
        const itemTotal = item.subtotal !== undefined && item.subtotal !== null
          ? Number(item.subtotal)
          : (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)
        return itemSum + (Number.isNaN(itemTotal) ? 0 : itemTotal)
      }, 0)
      return sum + orderSubtotal
    }, 0)

  // Solo procedimientos completados suman a la liquidación
  const procedimientosTotal = procedureOrders
    .filter(isProcedureOrderCompleted)
    .reduce((sum, order) => {
      const orderSubtotal = (order.items || []).reduce((itemSum, item) => {
        const itemTotal = item.subtotal !== undefined && item.subtotal !== null
          ? Number(item.subtotal)
          : (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)
        return itemSum + (Number.isNaN(itemTotal) ? 0 : itemTotal)
      }, 0)
      return sum + orderSubtotal
    }, 0)

  const total = hospitalizationTotal + insumosTotal + medicamentosTotal + procedimientosTotal

  return {
    hospitalizationTotal,
    insumosTotal,
    medicamentosTotal,
    procedimientosTotal,
    total,
  }
}
