import type { ReportesSummaryVm, ReportesTopServiceVm } from '../../types/reportesSuperAdmin.types'

interface ReportesKpiCardsProps {
  summary: ReportesSummaryVm
  topServices: ReportesTopServiceVm[]
}

// Tarjetas KPI del resumen (total, asistencia, servicio top)
export function ReportesKpiCards({ summary, topServices }: ReportesKpiCardsProps) {
  const topName = summary.topServiceName ?? topServices[0]?.serviceName ?? '—'
  const topPct = Math.round(summary.topServicePercentage || topServices[0]?.percentage || 0)
  const attendance = Math.round(summary.attendanceRate)

  return (
    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 animate-pop-in stagger-2">
      <div className="bg-white border border-border-tan rounded-xl p-3 sm:p-3.5 shadow-2xs flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-sage uppercase tracking-wider">
            Total Citas
          </span>
          <p className="text-xl sm:text-2xl font-black text-brand tracking-tight leading-none">
            {summary.totalAppointments.toLocaleString('es-ES')}
          </p>
          <p className="text-[10px] text-sage font-semibold">
            Del {summary.from} al {summary.to}
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-sage-soft text-brand flex items-center justify-center shrink-0">
          <CalendarIcon />
        </div>
      </div>

      <div className="bg-white border border-border-tan rounded-xl p-3 sm:p-3.5 shadow-2xs flex items-center justify-between">
        <div className="space-y-0.5 w-full pr-2">
          <span className="text-[10px] font-bold text-sage uppercase tracking-wider">
            % de Asistencia
          </span>
          <p className="text-xl sm:text-2xl font-black text-brand tracking-tight leading-none">{attendance}%</p>
          <div className="w-full h-1.5 bg-[#F1EFEA] rounded-full overflow-hidden my-0.5">
            <div className="h-full bg-brand rounded-full" style={{ width: `${attendance}%` }} />
          </div>
          <p className="text-[10px] text-sage font-medium leading-none">
            {summary.attendedCount} atendidas · {summary.canceledCount} canceladas
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-sage-soft text-brand flex items-center justify-center shrink-0">
          <CheckIcon />
        </div>
      </div>

      <div className="bg-white border border-border-tan rounded-xl p-3 sm:p-3.5 shadow-2xs flex items-center justify-between">
        <div className="space-y-0.5 min-w-0 pr-2">
          <span className="text-[10px] font-bold text-sage uppercase tracking-wider">
            Servicio más solicitado
          </span>
          <p
            className="text-base sm:text-lg font-black text-[#A66D5B] tracking-tight truncate"
            title={topName}
          >
            {topName}
          </p>
          <p className="text-[10px] text-sage font-semibold">{topPct}% de las citas</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-terracotta-soft text-[#A66D5B] flex items-center justify-center shrink-0">
          <BoxIcon />
        </div>
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  )
}
