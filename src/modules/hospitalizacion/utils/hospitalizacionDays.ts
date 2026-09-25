export function calculateStayDays(
  admittedAt: string | null | undefined,
  dischargedAt?: string | null,
  nowMs: number = Date.now(),
): number {
  if (!admittedAt) return 0
  const start = new Date(admittedAt).getTime()
  if (Number.isNaN(start)) return 0

  const end = dischargedAt ? new Date(dischargedAt).getTime() : nowMs
  if (Number.isNaN(end) || end < start) return 0

  const diffMs = end - start
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function formatStayDays(days: number): string {
  if (days <= 0) return '0 días'
  if (days === 1) return '1 día'
  return `${days} días`
}

export function validateAdmissionForm(
  clientPetId: string | null | undefined,
  motivo: string | null | undefined,
): { ok: boolean; error?: string } {
  if (!clientPetId || !clientPetId.trim()) {
    return { ok: false, error: 'Debes seleccionar una mascota.' }
  }

  const cleanMotivo = motivo ? motivo.trim() : ''
  if (!cleanMotivo) {
    return { ok: false, error: 'El motivo de hospitalización es obligatorio.' }
  }

  return { ok: true }
}
