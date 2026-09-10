import type {
  ReportesCitaDetalleVm,
  ReportesDashboardVm,
  ReportesDateRange,
  ReportesDayVm,
  ReportesStatusVm,
  ReportesVeterinarianVm,
} from '../types/reportesSuperAdmin.types'
import { eachDateKeyInRange, toIsoDateLocal } from '../services/superAdminReportsService'
import { resolveStatusBarClassName } from './reportesStatusBar'
import {
  buildTopServicesFromCitas,
  reportesPct,
} from './reportesApiMappers'

export { STATUS_BAR, resolveStatusBarClassName } from './reportesStatusBar'
export {
  reportesPct,
  buildTopServicesFromCitas,
  buildSummaryFromByStatus,
  mapAppointmentsByStatusToVm,
  mapAppointmentsSummaryToVm,
  mapTopServicesToVm,
} from './reportesApiMappers'


// Arma el view-model de reportes a partir del detalle de citas (fallback sin /api/Reports)
export function buildReportesDashboardFromCitas(
  range: ReportesDateRange,
  citas: ReportesCitaDetalleVm[],
): Omit<ReportesDashboardVm, 'citasDetalle'> {
  const total = citas.length
  const attended = citas.filter((c) => c.status === 'Atendido').length
  const scheduled = citas.filter((c) => c.status === 'Agendado').length
  const canceled = citas.filter((c) => c.status === 'Cancelado').length
  const pct = (n: number) => reportesPct(n, total)

  const topServices = buildTopServicesFromCitas(citas)
  const top = topServices[0]
  const summary = {
    from: range.from,
    to: range.to,
    totalAppointments: total,
    attendedCount: attended,
    canceledCount: canceled,
    noShowCount: 0,
    scheduledCount: scheduled,
    attendanceRate: pct(attended),
    topServiceName: top?.serviceName ?? null,
    topServiceCount: top?.appointmentsCount ?? 0,
    topServicePercentage: top?.percentage ?? 0,
  }

  const byStatus: ReportesStatusVm[] = [
    {
      statusId: 'local-attended',
      statusName: 'Atendido',
      count: attended,
      percentage: pct(attended),
      barClassName: resolveStatusBarClassName('Atendido'),
    },
    {
      statusId: 'local-scheduled',
      statusName: 'Agendado',
      count: scheduled,
      percentage: pct(scheduled),
      barClassName: resolveStatusBarClassName('Agendado'),
    },
    {
      statusId: 'local-canceled',
      statusName: 'Cancelado',
      count: canceled,
      percentage: pct(canceled),
      barClassName: resolveStatusBarClassName('Cancelado'),
    },
  ]

  const profMap = new Map<string, ReportesVeterinarianVm>()
  for (const c of citas) {
    const key = c.professionalName
    const row =
      profMap.get(key) ??
      ({
        veterinarianId: `local-vet-${key}`,
        veterinarianName: key,
        totalAppointments: 0,
        attendedCount: 0,
        canceledCount: 0,
        scheduledCount: 0,
        otherCount: 0,
        percentage: 0,
      } satisfies ReportesVeterinarianVm)
    row.totalAppointments += 1
    if (c.status === 'Atendido') row.attendedCount += 1
    else if (c.status === 'Cancelado') row.canceledCount += 1
    else if (c.status === 'Agendado') row.scheduledCount += 1
    else row.otherCount += 1
    profMap.set(key, row)
  }
  const byVeterinarian = [...profMap.values()]
    .map((r) => ({ ...r, percentage: pct(r.totalAppointments) }))
    .sort((a, b) => b.totalAppointments - a.totalAppointments)
    .slice(0, 8)

  const dayMap = new Map<string, ReportesDayVm>()
  for (const key of eachDateKeyInRange(range)) {
    dayMap.set(key, {
      date: key,
      totalAppointments: 0,
      attendedCount: 0,
      canceledCount: 0,
      scheduledCount: 0,
    })
  }
  for (const c of citas) {
    const key = toIsoDateLocal(new Date(c.scheduledStart))
    const row = dayMap.get(key)
    if (!row) continue
    row.totalAppointments += 1
    if (c.status === 'Atendido') row.attendedCount += 1
    else if (c.status === 'Cancelado') row.canceledCount += 1
    else row.scheduledCount += 1
  }
  const byDay = [...dayMap.values()]

  return { range, summary, byStatus, byVeterinarian, byDay, topServices }
}
