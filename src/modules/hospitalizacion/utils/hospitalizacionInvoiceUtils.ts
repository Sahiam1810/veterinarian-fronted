/**
 * Formatea un valor numérico a moneda colombiana estándar (COP).
 */
export function formatInvoiceCurrency(amount: number | null | undefined): string {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea una fecha ISO a cadena legible en español.
 */
export function formatInvoiceDate(dateStr: string | null | undefined): string {
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

export interface PaymentStatusInfo {
  isPaid: boolean
  label: string
  badgeClass: string
  paidAtFormatted?: string
}

/**
 * Determina la etiqueta y estilo para el estado de pago de la liquidación.
 */
export function getInvoicePaymentStatus(
  isPaid?: boolean | null,
  paidAt?: string | null,
): PaymentStatusInfo | null {
  if (isPaid === undefined || isPaid === null) {
    return null
  }

  if (isPaid) {
    return {
      isPaid: true,
      label: 'Pagado',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      paidAtFormatted: paidAt ? formatInvoiceDate(paidAt) : undefined,
    }
  }

  return {
    isPaid: false,
    label: 'Pendiente de pago',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  }
}

/**
 * Obtiene la clase y etiqueta para el estado de la estancia hospitalaria.
 */
export function getInvoiceStayStatusBadge(status: string | null | undefined): {
  label: string
  badgeClass: string
} {
  const normalized = (status || '').trim().toLowerCase()
  if (normalized === 'activa') {
    return {
      label: 'Estancia Activa',
      badgeClass: 'bg-brand/10 text-brand border-brand/20',
    }
  }
  if (normalized === 'dada de alta' || normalized === 'alta') {
    return {
      label: 'Dada de alta',
      badgeClass: 'bg-bone text-sage border-warm-grey/50',
    }
  }
  return {
    label: status || 'Desconocido',
    badgeClass: 'bg-bone text-sage border-warm-grey/50',
  }
}
