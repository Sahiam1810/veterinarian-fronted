import { apiClient } from '@/services'
import type {
  ReportesDateRange,
  ReportesDayVm,
  ReportesPeriodoId,
  ReportesStatusVm,
  ReportesSummaryVm,
  ReportesTopServiceVm,
  ReportesVeterinarianVm,
} from '../types/reportesSuperAdmin.types'
import { resolveStatusBarClassName } from '../utils/reportesStatusBar'
import {
  mapAppointmentsSummaryToVm,
  mapTopServicesToVm,
  type ApiAppointmentsSummaryResponse,
  type ApiTopServiceItem,
} from '../utils/reportesApiMappers'

// true: usa agregaciones reales GET /api/Reports/*
export const REPORTES_USE_API = true

// Formatea Date local a yyyy-MM-dd
export function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Mapea el selector UI → from/to (mismo criterio que pedirá el backend)
export function resolveReportesDateRange(
  period: ReportesPeriodoId,
  now: Date = new Date(),
): ReportesDateRange {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const from = new Date(to)

  if (period === 'este-mes') {
    from.setDate(1)
  } else if (period === '30-dias') {
    from.setDate(from.getDate() - 29)
  } else {
    from.setFullYear(from.getFullYear() - 1)
    from.setDate(from.getDate() + 1)
  }

  return { from: toIsoDateLocal(from), to: toIsoDateLocal(to) }
}

export function isIsoInRange(iso: string, range: ReportesDateRange): boolean {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const key = toIsoDateLocal(d)
  return key >= range.from && key <= range.to
}

// Enumera cada día yyyy-MM-dd entre from y to (inclusive)
export function eachDateKeyInRange(range: ReportesDateRange): string[] {
  const keys: string[] = []
  const [fy, fm, fd] = range.from.split('-').map(Number)
  const [ty, tm, td] = range.to.split('-').map(Number)
  const cursor = new Date(fy, fm - 1, fd)
  const end = new Date(ty, tm - 1, td)
  while (cursor <= end) {
    keys.push(toIsoDateLocal(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

function reportsQuery(range: ReportesDateRange): string {
  const query = new URLSearchParams()
  query.set('from', range.from)
  query.set('to', range.to)
  return query.toString()
}

// DTO crudo del backend (camelCase)
interface ApiAppointmentsByStatusItem {
  statusId: string
  statusName: string
  count: number
  percentage: number
}

interface ApiAppointmentsByVeterinarianItem {
  veterinarianId: string
  veterinarianName: string
  totalAppointments: number
  attendedCount: number
  canceledCount: number
  scheduledCount: number
  otherCount: number
}

interface ApiAppointmentsByDayItem {
  date: string
  totalAppointments: number
  attendedCount: number
  canceledCount: number
  scheduledCount: number
}

// GET /api/Reports/summary
export async function fetchAppointmentsSummary(
  range: ReportesDateRange,
): Promise<ReportesSummaryVm> {
  const endpoint = `/api/Reports/summary?${reportsQuery(range)}`
  const res = await apiClient.get<ApiAppointmentsSummaryResponse>(endpoint)
  return mapAppointmentsSummaryToVm(res, range)
}

// GET /api/Reports/appointments-by-status
export async function fetchAppointmentsByStatus(
  range: ReportesDateRange,
): Promise<ReportesStatusVm[]> {
  const endpoint = `/api/Reports/appointments-by-status?${reportsQuery(range)}`
  const rows = await apiClient.get<ApiAppointmentsByStatusItem[]>(endpoint)
  return (rows ?? []).map((row) => ({
    statusId: row.statusId,
    statusName: row.statusName,
    count: row.count,
    percentage: row.percentage,
    barClassName: resolveStatusBarClassName(row.statusName),
  }))
}

// GET /api/Reports/appointments-by-veterinarian (percentage en cliente)
export async function fetchAppointmentsByVeterinarian(
  range: ReportesDateRange,
): Promise<ReportesVeterinarianVm[]> {
  const endpoint = `/api/Reports/appointments-by-veterinarian?${reportsQuery(range)}`
  const rows = await apiClient.get<ApiAppointmentsByVeterinarianItem[]>(endpoint)
  const list = rows ?? []
  const total = list.reduce((sum, row) => sum + row.totalAppointments, 0)
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0)

  return list.map((row) => ({
    veterinarianId: row.veterinarianId,
    veterinarianName: row.veterinarianName,
    totalAppointments: row.totalAppointments,
    attendedCount: row.attendedCount,
    canceledCount: row.canceledCount,
    scheduledCount: row.scheduledCount,
    otherCount: row.otherCount,
    percentage: pct(row.totalAppointments),
  }))
}

// GET /api/Reports/appointments-by-day
export async function fetchAppointmentsByDay(
  range: ReportesDateRange,
): Promise<ReportesDayVm[]> {
  const endpoint = `/api/Reports/appointments-by-day?${reportsQuery(range)}`
  const rows = await apiClient.get<ApiAppointmentsByDayItem[]>(endpoint)
  return (rows ?? []).map((row) => ({
    date: row.date,
    totalAppointments: row.totalAppointments,
    attendedCount: row.attendedCount,
    canceledCount: row.canceledCount,
    scheduledCount: row.scheduledCount,
  }))
}

// GET /api/Reports/top-services?from=&to=&take= (take: default 5, min 1, max 20)
export async function fetchTopServices(
  range: ReportesDateRange,
  take: number = 5,
): Promise<ReportesTopServiceVm[]> {
  const clampedTake = Math.min(20, Math.max(1, take))
  const query = new URLSearchParams()
  query.set('from', range.from)
  query.set('to', range.to)
  query.set('take', String(clampedTake))
  const endpoint = `/api/Reports/top-services?${query.toString()}`
  const rows = await apiClient.get<ApiTopServiceItem[]>(endpoint)
  return mapTopServicesToVm(rows)
}

