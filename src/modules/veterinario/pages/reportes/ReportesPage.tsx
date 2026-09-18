import { useEffect } from 'react'
import { ReportesKpiCards } from '@/modules/superadmin/components/reportes/ReportesKpiCards'
import { ReportesChartsPanel } from '@/modules/superadmin/components/reportes/ReportesChartsPanel'
import { ReportesCitasDetalleTable } from '@/modules/superadmin/components/reportes/ReportesCitasDetalleTable'
import { useReportesSuperAdmin } from '@/modules/superadmin'
import type { ReportesPeriodoId } from '@/modules/superadmin'

interface ReportesPageProps {
  onNotice?: (message: string) => void
}

export function ReportesPage({ onNotice }: ReportesPageProps) {
  const {
    period,
    setPeriod,
    periodOptions,
    range,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredCitas,
    dashboard,
    activeNotification,
    exportCsv,
    isLoading,
    usingReportsApi,
  } = useReportesSuperAdmin()

  useEffect(() => {
    if (!activeNotification) return
    onNotice?.(activeNotification)
  }, [activeNotification, onNotice])

  return (
    <div className="h-full min-h-0 min-w-0 overflow-y-auto relative flex flex-col gap-5 sm:gap-6">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
            Reportes
          </h1>
          <p className="text-xs sm:text-sm text-sage font-medium mt-1">
            Indicadores del periodo {range.from} - {range.to}.
            {usingReportsApi
              ? ' Datos desde API de Reportes.'
              : ' Métricas provisionales desde citas.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportesPeriodoId)}
            className="px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-bold focus:outline-none cursor-pointer shadow-2xs"
          >
            {periodOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={exportCsv}
            className="bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs active:translate-y-0.5"
          >
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="relative z-10 text-sm text-sage font-medium animate-pop-in">
          Cargando reportes...
        </p>
      )}

      <div className="relative z-10 border-b border-border-tan/70 flex items-center justify-between gap-4 animate-pop-in">
        <div className="flex items-center gap-6 sm:gap-8">
          <TabButton
            active={activeTab === 'resumen'}
            onClick={() => setActiveTab('resumen')}
            label="Resumen General"
          />
          <TabButton
            active={activeTab === 'detalles'}
            onClick={() => setActiveTab('detalles')}
            label="Detalle de Citas"
          />
        </div>
      </div>

      {activeTab === 'resumen' && !isLoading && (
        <div className="flex-1 flex flex-col gap-6 sm:gap-7 animate-view-popup">
          <ReportesKpiCards summary={dashboard.summary} topServices={dashboard.topServices} />
          <ReportesChartsPanel
            byStatus={dashboard.byStatus}
            byVeterinarian={dashboard.byVeterinarian}
            byDay={dashboard.byDay}
            topServices={dashboard.topServices}
          />
        </div>
      )}

      {activeTab === 'detalles' && !isLoading && (
        <ReportesCitasDetalleTable
          citas={filteredCitas}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-5 pt-3 pb-3.5 text-sm sm:text-[15px] font-semibold transition-colors cursor-pointer ${
        active
          ? "text-brand font-bold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full"
          : 'text-sage hover:text-brand'
      }`}
    >
      {label}
    </button>
  )
}

