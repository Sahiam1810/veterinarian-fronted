import type { ReactNode } from 'react'
import type {
  ReportesDayVm,
  ReportesStatusVm,
  ReportesTopServiceVm,
  ReportesVeterinarianVm,
} from '../../types/reportesSuperAdmin.types'

const PROF_BAR_COLORS = ['bg-brand', 'bg-brand/70', 'bg-[#7C9A94]', 'bg-border-tan', 'bg-brand/50']

interface ReportesChartsProps {
  byStatus: ReportesStatusVm[]
  byVeterinarian: ReportesVeterinarianVm[]
  byDay: ReportesDayVm[]
  topServices: ReportesTopServiceVm[]
}

// Bloques de resumen: estado, profesional, serie diaria y top servicios
export function ReportesChartsPanel({
  byStatus,
  byVeterinarian,
  byDay,
  topServices,
}: ReportesChartsProps) {
  const maxDay = Math.max(1, ...byDay.map((d) => d.totalAppointments))
  const daySlice = byDay.length > 10 ? byDay.slice(-10) : byDay

  return (
    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 animate-pop-in stagger-3">
      <Panel title="Citas por Estado">
        <div className="space-y-1.5 text-xs">
          {byStatus.length === 0 ? (
            <Empty text="Sin datos de estados en este período." />
          ) : (
            byStatus.slice(0, 3).map((item) => (
              <BarRow
                key={item.statusId}
                label={item.statusName}
                value={item.count}
                pct={item.percentage}
                barClassName={item.barClassName}
              />
            ))
          )}
        </div>
      </Panel>

      <Panel title="Citas por Profesional">
        <div className="space-y-1.5 text-xs">
          {byVeterinarian.length === 0 ? (
            <Empty text="Sin datos de profesionales en este período." />
          ) : (
            byVeterinarian.slice(0, 3).map((item, idx) => (
              <BarRow
                key={item.veterinarianId}
                label={item.veterinarianName}
                value={item.totalAppointments}
                pct={item.percentage}
                barClassName={PROF_BAR_COLORS[idx % PROF_BAR_COLORS.length]}
              />
            ))
          )}
        </div>
      </Panel>

      <Panel title="Citas por Día">
        {daySlice.every((d) => d.totalAppointments === 0) ? (
          <Empty text="Sin citas en los días del período." />
        ) : (
          <div className="flex items-end gap-1.5 h-16 pt-1">
            {daySlice.map((d) => {
              const h = Math.max(6, Math.round((d.totalAppointments / maxDay) * 100))
              const label = d.date.slice(5)
              return (
                <div
                  key={d.date}
                  className="flex-1 min-w-0 flex flex-col items-center gap-0.5 h-full justify-end"
                >
                  <span className="text-[9px] font-bold text-charcoal/70">
                    {d.totalAppointments || ''}
                  </span>
                  <div
                    className="w-full max-w-[14px] rounded-t-md bg-brand/80"
                    style={{ height: `${h}%` }}
                    title={`${d.date}: ${d.totalAppointments} citas`}
                  />
                  <span className="text-[9px] text-sage font-semibold truncate w-full text-center">
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {byDay.length > 10 && (
          <p className="text-[9px] text-sage mt-0.5 font-medium">
            Mostrando los últimos 10 días del rango seleccionado.
          </p>
        )}
      </Panel>

      <Panel title="Servicios más solicitados">
        <div className="space-y-1.5 text-xs">
          {topServices.length === 0 ? (
            <Empty text="Sin servicios en este período." />
          ) : (
            topServices.slice(0, 3).map((s, idx) => (
              <BarRow
                key={s.serviceId}
                label={s.serviceName}
                value={s.appointmentsCount}
                pct={s.percentage}
                barClassName={PROF_BAR_COLORS[idx % PROF_BAR_COLORS.length]}
              />
            ))
          )}
        </div>
      </Panel>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-border-tan rounded-xl p-3 shadow-2xs space-y-1.5 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border-tan/50 pb-1">
        <h3 className="text-xs sm:text-sm font-bold text-brand">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sage font-medium py-3 text-center text-xs">{text}</p>
}

function BarRow({
  label,
  value,
  pct,
  barClassName,
}: {
  label: string
  value: number
  pct: number
  barClassName: string
}) {
  const width = Math.min(100, Math.max(0, pct))
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between font-semibold text-xs">
        <span className="text-charcoal/80 truncate pr-2">{label}</span>
        <span className="font-extrabold text-charcoal shrink-0">{value}</span>
      </div>
      <div className="w-full h-2 bg-[#F1EFEA] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
