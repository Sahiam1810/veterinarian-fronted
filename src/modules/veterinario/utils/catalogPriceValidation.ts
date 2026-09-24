export function validateCatalogPrice(
  price: number | string | null | undefined,
): { ok: boolean; error?: string; value: number } {
  if (price === undefined || price === null || price === '') {
    return { ok: true, value: 0 }
  }

  const num = typeof price === 'number' ? price : Number(price)

  if (Number.isNaN(num)) {
    return { ok: false, error: 'El precio debe ser un número válido.', value: 0 }
  }

  if (num < 0) {
    return { ok: false, error: 'El precio no puede ser negativo.', value: 0 }
  }

  return { ok: true, value: num }
}

export function formatCatalogCurrency(amount: number | null | undefined): string {
  const value = amount ?? 0
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}
