// Colores UI: buckets legacy (3) + catálogo real STATUS_APPOINTMENTS (6).
export const STATUS_BAR: Record<string, string> = {
  Atendido: 'bg-terracotta',
  Agendado: 'bg-brand/60',
  Cancelado: 'bg-[#B24C3D]',
  AGENDADA: 'bg-brand/60',
  CONFIRMADA: 'bg-brand/50',
  EN_PROGRESO: 'bg-[#7C9A94]',
  ATENDIDA: 'bg-terracotta',
  CANCELADA: 'bg-[#B24C3D]',
  NO_ASISTIO: 'bg-charcoal/40',
}

const DEFAULT_BAR = 'bg-brand/40'

// Resuelve barra por nombre de estado (case-insensitive para el catálogo Oracle).
export function resolveStatusBarClassName(statusName: string): string {
  const exact = STATUS_BAR[statusName]
  if (exact) return exact
  const upper = statusName.trim().toUpperCase()
  return STATUS_BAR[upper] ?? DEFAULT_BAR
}
