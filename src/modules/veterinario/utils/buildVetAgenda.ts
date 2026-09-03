import type {
  ApiAppointment,
  ApiAvailability,
  ApiClientPet,
  ApiNamedCatalog,
  ApiPet,
} from '../api/apiTypes'
import type {
  AgendaCalendarEvent,
  AgendaDayColumn,
  AgendaViewMode,
  AgendaWeekPayload,
} from '../types'
import { mapAgendaEventStatus } from './mapAgendaEventStatus'

const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'] as const
const DEFAULT_HOUR_START = 8
const DEFAULT_HOUR_END = 18

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfWeekMonday(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = result.getDay()
  const offset = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + offset)
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() + days)
  return result
}

export function formatMonthLabel(date: Date): string {
  const raw = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function formatCurrentTime(now = new Date()): string {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
}

// TimeOnly del API: "08:00:00" o "08:00".
export function normalizeTime(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return '00:00'
  return `${pad2(Number(match[1]))}:${match[2]}`
}

function timeToMinutes(time: string): number {
  const [h, m] = normalizeTime(time).split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(total: number): string {
  const clamped = Math.max(0, Math.min(total, 24 * 60 - 1))
  return `${pad2(Math.floor(clamped / 60))}:${pad2(clamped % 60)}`
}

function resolveDayOfWeek(value: number | string): number {
  if (typeof value === 'number' && value >= 0 && value <= 6) return value
  const named: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }
  const key = String(value).trim().toLowerCase()
  if (key in named) return named[key]
  const asNumber = Number(value)
  return Number.isFinite(asNumber) ? asNumber : -1
}

type Interval = { start: number; end: number }

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return []
  const sorted = [...intervals].sort((a, b) => a.start - b.start)
  const merged: Interval[] = [{ ...sorted[0] }]
  for (let i = 1; i < sorted.length; i += 1) {
    const last = merged[merged.length - 1]
    const current = sorted[i]
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end)
    } else {
      merged.push({ ...current })
    }
  }
  return merged
}

function invertIntervals(open: Interval[], rangeStart: number, rangeEnd: number): Interval[] {
  const gaps: Interval[] = []
  let cursor = rangeStart
  for (const slot of open) {
    const start = Math.max(slot.start, rangeStart)
    const end = Math.min(slot.end, rangeEnd)
    if (end <= start) continue
    if (start > cursor) gaps.push({ start: cursor, end: start })
    cursor = Math.max(cursor, end)
  }
  if (cursor < rangeEnd) gaps.push({ start: cursor, end: rangeEnd })
  return gaps
}

function buildDayColumns(
  anchor: Date,
  viewMode: AgendaViewMode,
  todayKey: string,
): AgendaDayColumn[] {
  if (viewMode === 'dia') {
    return [
      {
        dateKey: toDateKey(anchor),
        weekdayLabel: WEEKDAY_LABELS[anchor.getDay()],
        dayNumber: anchor.getDate(),
        isToday: toDateKey(anchor) === todayKey,
      },
    ]
  }

  // Semana y mes (mes navega por mes pero reutiliza grilla semanal del diseño).
  const start = startOfWeekMonday(anchor)
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(start, index)
    return {
      dateKey: toDateKey(day),
      weekdayLabel: WEEKDAY_LABELS[day.getDay()],
      dayNumber: day.getDate(),
      isToday: toDateKey(day) === todayKey,
    }
  })
}

function resolveHourRange(availabilities: ApiAvailability[]): { hourStart: number; hourEnd: number } {
  const active = availabilities.filter((item) => item.isActive)
  if (active.length === 0) {
    return { hourStart: DEFAULT_HOUR_START, hourEnd: DEFAULT_HOUR_END }
  }

  let min = 24 * 60
  let max = 0
  for (const slot of active) {
    min = Math.min(min, timeToMinutes(slot.startTime))
    max = Math.max(max, timeToMinutes(slot.endTime))
  }

  const hourStart = Math.min(DEFAULT_HOUR_START, Math.floor(min / 60))
  const hourEnd = Math.max(DEFAULT_HOUR_END, Math.ceil(max / 60))
  return { hourStart, hourEnd: Math.max(hourStart + 1, hourEnd) }
}

function buildAvailabilityBlocks(
  days: AgendaDayColumn[],
  availabilities: ApiAvailability[],
  hourStart: number,
  hourEnd: number,
): AgendaCalendarEvent[] {
  const rangeStart = hourStart * 60
  const rangeEnd = hourEnd * 60
  const blocks: AgendaCalendarEvent[] = []

  for (const day of days) {
    const date = parseDateKey(day.dateKey)
    const dow = date.getDay()
    const open = mergeIntervals(
      availabilities
        .filter((item) => item.isActive && resolveDayOfWeek(item.dayOfWeek) === dow)
        .map((item) => ({
          start: timeToMinutes(item.startTime),
          end: timeToMinutes(item.endTime),
        }))
        .filter((item) => item.end > item.start),
    )

    const gaps =
      open.length === 0
        ? [{ start: rangeStart, end: rangeEnd }]
        : invertIntervals(open, rangeStart, rangeEnd)

    gaps.forEach((gap, index) => {
      if (gap.end - gap.start < 15) return
      blocks.push({
        id: `block-${day.dateKey}-${index}`,
        dateKey: day.dateKey,
        startTime: minutesToTime(gap.start),
        endTime: minutesToTime(gap.end),
        status: 'BLOQUEO',
        blockLabel: open.length === 0 ? 'Sin disponibilidad' : 'No disponible',
      })
    })
  }

  return blocks
}

function mapAppointmentEvents(
  appointments: ApiAppointment[],
  days: AgendaDayColumn[],
  petsById: Map<string, ApiPet>,
  clientPetsById: Map<string, ApiClientPet>,
  speciesById: Map<string, string>,
): AgendaCalendarEvent[] {
  const dayKeys = new Set(days.map((day) => day.dateKey))

  return appointments
    .filter((apt) => dayKeys.has(toDateKey(new Date(apt.scheduledStart))))
    .map((apt) => {
      const start = new Date(apt.scheduledStart)
      const end = new Date(apt.scheduledEnd)
      const link = clientPetsById.get(apt.clientPetId.toLowerCase())
      const pet = link ? petsById.get(link.petId.toLowerCase()) : undefined
      const species = pet ? speciesById.get(pet.speciesId.toLowerCase()) : undefined

      return {
        id: apt.id,
        dateKey: toDateKey(start),
        startTime: `${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
        endTime: Number.isNaN(end.getTime())
          ? `${pad2(start.getHours() + 1)}:${pad2(start.getMinutes())}`
          : `${pad2(end.getHours())}:${pad2(end.getMinutes())}`,
        status: mapAgendaEventStatus(apt.statusName),
        petName: pet?.name || 'Mascota',
        species: species || undefined,
        service: apt.serviceName || 'Servicio',
      } satisfies AgendaCalendarEvent
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function buildVetAgendaPayload(input: {
  viewMode: AgendaViewMode
  anchorDate: Date
  appointments: ApiAppointment[]
  availabilities: ApiAvailability[]
  pets: ApiPet[]
  clientPets: ApiClientPet[]
  species: ApiNamedCatalog[]
  now?: Date
}): AgendaWeekPayload {
  const now = input.now || new Date()
  const todayKey = toDateKey(now)
  const days = buildDayColumns(input.anchorDate, input.viewMode, todayKey)
  const { hourStart, hourEnd } = resolveHourRange(input.availabilities)

  const petsById = new Map(input.pets.map((pet) => [pet.id.toLowerCase(), pet]))
  const clientPetsById = new Map(
    input.clientPets.map((link) => [link.id.toLowerCase(), link]),
  )
  const speciesById = new Map(
    input.species.map((item) => [item.id.toLowerCase(), item.name]),
  )

  const appointmentEvents = mapAppointmentEvents(
    input.appointments,
    days,
    petsById,
    clientPetsById,
    speciesById,
  )
  const availabilityBlocks = buildAvailabilityBlocks(
    days,
    input.availabilities,
    hourStart,
    hourEnd,
  )

  return {
    monthLabel: formatMonthLabel(input.anchorDate),
    viewMode: input.viewMode,
    days,
    currentTime: formatCurrentTime(now),
    currentDateKey: todayKey,
    hourStart,
    hourEnd,
    events: [...availabilityBlocks, ...appointmentEvents],
  }
}

export function shiftAgendaAnchor(
  anchor: Date,
  viewMode: AgendaViewMode,
  direction: -1 | 1,
): Date {
  if (viewMode === 'dia') return addDays(anchor, direction)
  if (viewMode === 'mes') {
    return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1)
  }
  return addDays(anchor, direction * 7)
}
