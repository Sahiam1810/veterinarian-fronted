import type {
  ReportesCitaDetalleVm,
  ReportesDateRange,
  ReportesStatusVm,
  ReportesSummaryVm,
  ReportesTopServiceVm,
} from '../types/reportesSuperAdmin.types'
import { resolveStatusBarClassName } from './reportesStatusBar.ts'

export function reportesPct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0
}

// Top servicios desde detalle de citas (hasta que exista GET /api/Reports/top-services).
export function buildTopServicesFromCitas(citas: ReportesCitaDetalleVm[]): ReportesTopServiceVm[] {
  const total = citas.length
  const serviceCounts = new Map<string, number>()
  for (const c of citas) {
    serviceCounts.set(c.service, (serviceCounts.get(c.service) ?? 0) + 1)
  }
  return [...serviceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([serviceName, appointmentsCount], idx) => ({
      serviceId: `local-service-${idx}`,
      serviceName,
      appointmentsCount,
      percentage: reportesPct(appointmentsCount, total),
    }))
}

// Summary KPI desde by-status real del API (opción a) + top desde citas.
export function buildSummaryFromByStatus(
  range: ReportesDateRange,
  byStatus: ReportesStatusVm[],
  topServices: ReportesTopServiceVm[],
): ReportesSummaryVm {
  const countOf = (...names: string[]) =>
    byStatus
      .filter((s) => names.includes(s.statusName.trim().toUpperCase()))
      .reduce((sum, s) => sum + s.count, 0)

  const totalAppointments = byStatus.reduce((sum, s) => sum + s.count, 0)
  const attendedCount = countOf('ATENDIDA')
  const canceledCount = countOf('CANCELADA')
  const noShowCount = countOf('NO_ASISTIO')
  const scheduledCount = countOf('AGENDADA', 'CONFIRMADA', 'EN_PROGRESO')
  const top = topServices[0]

  return {
    from: range.from,
    to: range.to,
    totalAppointments,
    attendedCount,
    canceledCount,
    noShowCount,
    scheduledCount,
    attendanceRate: reportesPct(attendedCount, totalAppointments),
    topServiceName: top?.serviceName ?? null,
    topServiceCount: top?.appointmentsCount ?? 0,
    topServicePercentage: top?.percentage ?? 0,
  }
}

// Mapea respuesta simulada/API de by-status → VM de UI (incl. estados en 0).
export function mapAppointmentsByStatusToVm(
  rows: Array<{
    statusId: string
    statusName: string
    count: number
    percentage: number
  }>,
): ReportesStatusVm[] {
  return rows.map((row) => ({
    statusId: row.statusId,
    statusName: row.statusName,
    count: row.count,
    percentage: row.percentage,
    barClassName: resolveStatusBarClassName(row.statusName),
  }))
}

// DTOs crudos de /api/Reports/summary y /api/Reports/top-services
export interface ApiAppointmentsSummaryResponse {
  from: string
  to: string
  totalAppointments: number
  attendedCount: number
  canceledCount: number
  noShowCount: number
  scheduledCount: number
  attendanceRate: number
  topServiceName: string | null
  topServiceCount: number
  topServicePercentage: number
}

export interface ApiTopServiceItem {
  serviceId: string
  serviceName: string
  appointmentsCount: number
  percentage: number
}

// Mapea respuesta de GET /api/Reports/summary → VM de UI
export function mapAppointmentsSummaryToVm(
  res?: Partial<ApiAppointmentsSummaryResponse> | null,
  fallbackRange?: ReportesDateRange,
): ReportesSummaryVm {
  return {
    from: res?.from ?? fallbackRange?.from ?? '',
    to: res?.to ?? fallbackRange?.to ?? '',
    totalAppointments: res?.totalAppointments ?? 0,
    attendedCount: res?.attendedCount ?? 0,
    canceledCount: res?.canceledCount ?? 0,
    noShowCount: res?.noShowCount ?? 0,
    scheduledCount: res?.scheduledCount ?? 0,
    attendanceRate: res?.attendanceRate ?? 0,
    topServiceName: res?.topServiceName ?? null,
    topServiceCount: res?.topServiceCount ?? 0,
    topServicePercentage: res?.topServicePercentage ?? 0,
  }
}

// Mapea respuesta de GET /api/Reports/top-services → VM de UI
export function mapTopServicesToVm(
  rows?: Array<Partial<ApiTopServiceItem>> | null,
): ReportesTopServiceVm[] {
  return (rows ?? []).map((row, idx) => ({
    serviceId: row.serviceId ?? `service-${idx}`,
    serviceName: row.serviceName ?? '—',
    appointmentsCount: row.appointmentsCount ?? 0,
    percentage: row.percentage ?? 0,
  }))
}

