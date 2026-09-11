import type { ApiAvailabilityResponse } from '../services/superAdminAvailabilitiesService'

export const NO_VET_AVAILABILITY_MESSAGE =
  'El veterinario no tiene disponibilidad configurada para ese día u horario.'

// DayOfWeek .NET: 0=Domingo … 6=Sábado (mediodía local para no cruzar fecha).
export function dayOfWeekFromDateKey(dateKey: string): number {
  return new Date(`${dateKey}T12:00:00`).getDay()
}

function toHm(value: string): string {
  return value.trim().slice(0, 5)
}

// Busca un bloque activo que cubra día + franja; no crea disponibilidad.
export function findMatchingAvailabilityId(
  availabilities: ApiAvailabilityResponse[],
  dateKey: string,
  startTime: string,
  endTime: string,
): string | null {
  const day = dayOfWeekFromDateKey(dateKey)
  const start = toHm(startTime)
  const end = toHm(endTime)

  const match = availabilities.find((item) => {
    const dow = typeof item.dayOfWeek === 'string' ? Number(item.dayOfWeek) : item.dayOfWeek
    if (!item.isActive || Number(dow) !== day) return false
    const blockStart = toHm(item.startTime)
    const blockEnd = toHm(item.endTime)
    return start >= blockStart && end <= blockEnd
  })

  return match?.id ?? null
}

export async function resolveAvailabilityId(
  veterinarianId: string,
  dateKey: string,
  startTime: string,
  endTime: string,
  fetchByVeterinarian: (veterinarianId: string) => Promise<ApiAvailabilityResponse[]>,
): Promise<string> {
  const list = await fetchByVeterinarian(veterinarianId)
  const matchedId = findMatchingAvailabilityId(list, dateKey, startTime, endTime)
  if (!matchedId) {
    throw new Error(NO_VET_AVAILABILITY_MESSAGE)
  }
  return matchedId
}
