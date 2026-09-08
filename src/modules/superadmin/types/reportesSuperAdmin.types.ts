// Tipos de la vista Reportes (panel Admin/SuperAdmin).
// Alineados al contrato futuro GET /api/Reports/* (aún no cableado).

export type ReportesPeriodoId = 'este-mes' | '30-dias' | 'ultimo-ano'

export type ReportesTabId = 'resumen' | 'detalles'

// Rango ISO yyyy-MM-dd que usarán los endpoints B1–B4
export interface ReportesDateRange {
  from: string
  to: string
}

// GET /api/Reports/summary
export interface ReportesSummaryVm {
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

// GET /api/Reports/appointments-by-status
export interface ReportesStatusVm {
  statusId: string
  statusName: string
  count: number
  percentage: number
  // Color solo UI
  barClassName: string
}

// GET /api/Reports/appointments-by-veterinarian
export interface ReportesVeterinarianVm {
  veterinarianId: string
  veterinarianName: string
  totalAppointments: number
  attendedCount: number
  canceledCount: number
  scheduledCount: number
  otherCount: number
  // % relativo al total del periodo (UI)
  percentage: number
}

// GET /api/Reports/appointments-by-day
export interface ReportesDayVm {
  date: string
  totalAppointments: number
  attendedCount: number
  canceledCount: number
  scheduledCount: number
}

// GET /api/Reports/top-services
export interface ReportesTopServiceVm {
  serviceId: string
  serviceName: string
  appointmentsCount: number
  percentage: number
}

// Detalle de citas (sigue viniendo de Appointments hasta que exista endpoint de detalle)
export interface ReportesCitaDetalleVm {
  id: string
  dateStr: string
  timeStr: string
  professionalName: string
  service: string
  petName: string
  petBreed: string
  status: 'Atendido' | 'Agendado' | 'Cancelado'
  scheduledStart: string
}

// Modelo unificado que consume la página
export interface ReportesDashboardVm {
  range: ReportesDateRange
  summary: ReportesSummaryVm
  byStatus: ReportesStatusVm[]
  byVeterinarian: ReportesVeterinarianVm[]
  byDay: ReportesDayVm[]
  topServices: ReportesTopServiceVm[]
  citasDetalle: ReportesCitaDetalleVm[]
}

export const REPORTES_PERIODO_OPTIONS: { id: ReportesPeriodoId; label: string }[] = [
  { id: 'este-mes', label: 'Este Mes' },
  { id: '30-dias', label: 'Últimos 30 días' },
  { id: 'ultimo-ano', label: 'Último Año' },
]
