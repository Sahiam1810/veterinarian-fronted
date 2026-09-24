import type {
  ApiSupplyConsumption,
  ApiSupply,
  FormattedSupplyConsumption,
} from '../types/hospitalizacion.types'

/**
 * Cruza la lista de consumos con el catálogo de insumos para obtener
 * el nombre, la unidad de medida y el stock disponible de cada insumo.
 */
export function mapSupplyConsumptions(
  consumptions: ApiSupplyConsumption[] | null | undefined,
  supplies: ApiSupply[] | null | undefined,
): FormattedSupplyConsumption[] {
  if (!consumptions || consumptions.length === 0) return []

  const suppliesMap = new Map<string, ApiSupply>()
  if (supplies && supplies.length > 0) {
    for (const supply of supplies) {
      suppliesMap.set(supply.id, supply)
    }
  }

  return consumptions.map((consumption) => {
    const supply = suppliesMap.get(consumption.supplyId)
    return {
      ...consumption,
      supplyName: supply ? supply.name : 'Insumo no encontrado',
      supplyUnit: supply ? supply.unit : '-',
      supplyStock: supply?.stock,
    }
  })
}

/**
 * Calcula la suma de los totales de cada consumo registrado.
 */
export function calculateSupplyConsumptionsTotal(
  consumptions: ApiSupplyConsumption[] | null | undefined,
): number {
  if (!consumptions || consumptions.length === 0) return 0
  return consumptions.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
}

export interface ValidateSupplyConsumptionParams {
  supplyId: string
  quantity: number | string
  notes?: string | null
  selectedSupply?: ApiSupply | null
}

export interface ValidationResult {
  ok: boolean
  error?: string
  quantityNum: number
}

/**
 * Valida los datos del formulario de registro de consumo.
 */
export function validateSupplyConsumptionForm({
  supplyId,
  quantity,
  notes,
  selectedSupply,
}: ValidateSupplyConsumptionParams): ValidationResult {
  if (!supplyId || !supplyId.trim()) {
    return { ok: false, error: 'Debes seleccionar un insumo.', quantityNum: 0 }
  }

  if (quantity === '' || quantity === null || quantity === undefined) {
    return { ok: false, error: 'La cantidad es obligatoria.', quantityNum: 0 }
  }

  const quantityNum = Number(quantity)
  if (isNaN(quantityNum) || quantityNum <= 0) {
    return { ok: false, error: 'La cantidad debe ser mayor que cero.', quantityNum: 0 }
  }

  if (selectedSupply && quantityNum > selectedSupply.stock) {
    return {
      ok: false,
      error: `El stock disponible es insuficiente (disponible: ${selectedSupply.stock}).`,
      quantityNum,
    }
  }

  if (notes && notes.length > 500) {
    return {
      ok: false,
      error: 'Las notas no deben superar los 500 caracteres.',
      quantityNum,
    }
  }

  return { ok: true, quantityNum }
}

/**
 * Formato de moneda para presentación de precios y totales.
 */
export function formatSupplyCurrency(amount: number | null | undefined): string {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea una fecha ISO a formato local legible.
 */
export function formatSupplyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return dateStr
  }
}
