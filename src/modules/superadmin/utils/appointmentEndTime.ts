// Con servicio, el fin de la cita es inicio + Services.DurationMinutes (el backend lo recalcula igual).
export interface ServiceDurationOption {
  id: string
  durationMinutes?: number
}

export const INVALID_SERVICE_DURATION_MESSAGE =
  'El servicio seleccionado no tiene una duración válida configurada. Corrígelo en Servicios antes de agendar.'

const MINUTES_IN_DAY = 24 * 60

export function parseTimeToMinutes(time: string): number {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function formatMinutes(totalMinutes: number): string {
  const normalized = ((totalMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
  const h = String(Math.floor(normalized / 60)).padStart(2, '0')
  const m = String(normalized % 60).padStart(2, '0')
  return `${h}:${m}`
}

export function resolveServiceDurationMinutes(
  services: ServiceDurationOption[],
  serviceId: string,
): number | null {
  const duration = services.find((s) => s.id === serviceId)?.durationMinutes
  return typeof duration === 'number' && Number.isInteger(duration) && duration > 0 ? duration : null
}

export function deriveEndTime(startTime: string, durationMinutes: number): string {
  return formatMinutes(parseTimeToMinutes(startTime) + durationMinutes)
}
