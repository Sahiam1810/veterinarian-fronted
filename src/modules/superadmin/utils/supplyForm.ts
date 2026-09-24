// Validación del formulario de insumos. Replica las reglas del backend
// (CreateSupplyCommandValidator / UpdateSupplyCommandValidator) para dar feedback
// inmediato. Función pura y sin imports de servicios: la usan los tests bajo
// tsconfig.node.json, que no tiene jsx configurado.
export const SUPPLY_NAME_MAX_LENGTH = 150
export const SUPPLY_UNIT_MAX_LENGTH = 50

export interface SupplyFormInput {
  name: string
  unit: string
  unitPrice: string | number
  stock: string | number
}

export type SupplyFormValidation =
  | { ok: true; payload: { name: string; unit: string; unitPrice: number; stock: number } }
  | { ok: false; error: string }

function parseNonNegative(value: string | number): number | null {
  if (value === '' || (typeof value === 'string' && value.trim() === '')) return null
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0) return null
  return parsed
}

export function validateSupplyForm(input: SupplyFormInput): SupplyFormValidation {
  const name = input.name.trim()
  const unit = input.unit.trim()

  if (!name) return { ok: false, error: 'El nombre del insumo es obligatorio.' }
  if (name.length > SUPPLY_NAME_MAX_LENGTH) {
    return { ok: false, error: `El nombre del insumo no debe superar ${SUPPLY_NAME_MAX_LENGTH} caracteres.` }
  }
  if (!unit) return { ok: false, error: 'La unidad de medida es obligatoria.' }
  if (unit.length > SUPPLY_UNIT_MAX_LENGTH) {
    return { ok: false, error: `La unidad de medida no debe superar ${SUPPLY_UNIT_MAX_LENGTH} caracteres.` }
  }

  const unitPrice = parseNonNegative(input.unitPrice)
  if (unitPrice === null) {
    return { ok: false, error: 'El precio unitario debe ser un número mayor o igual a 0.' }
  }
  const stock = parseNonNegative(input.stock)
  if (stock === null) {
    return { ok: false, error: 'El stock debe ser un número mayor o igual a 0.' }
  }

  return { ok: true, payload: { name, unit, unitPrice, stock } }
}
