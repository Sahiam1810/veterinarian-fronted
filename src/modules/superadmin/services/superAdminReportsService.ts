import type { ReportesDateRange, ReportesPeriodoId } from '../types/reportesSuperAdmin.types'

// true cuando existan B1–B4 en el API; hoy permanece false (sin cablear /api/Reports)
export const REPORTES_USE_API = false

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

// Cuando REPORTES_USE_API sea true, aquí vivirán:
// fetchReportesSummary / byStatus / byVeterinarian / byDay / topServices.
// Hoy no se llaman para no romper el build sin backend.
