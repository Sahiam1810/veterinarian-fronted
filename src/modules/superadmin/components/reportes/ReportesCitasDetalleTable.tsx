import type { ReportesCitaDetalleVm } from '../../types/reportesSuperAdmin.types'
import { SearchIcon } from '@/global/components'

interface ReportesCitasDetalleTableProps {
  citas: ReportesCitaDetalleVm[]
  searchQuery: string
  onSearchChange: (value: string) => void
}

// Tabla de detalle de citas del periodo (fuente: Appointments, no Reports API)
export function ReportesCitasDetalleTable({
  citas,
  searchQuery,
  onSearchChange,
}: ReportesCitasDetalleTableProps) {
  return (
    <div className="relative z-10 bg-white border border-border-tan rounded-2xl shadow-[0_4px_20px_rgba(35,78,70,0.04)] overflow-hidden animate-view-popup flex-1 flex flex-col">
      <div className="p-4 border-b border-border-tan/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
        <h3 className="text-base font-bold text-brand">Detalle de Citas Recientes</h3>
        <div className="relative w-full sm:w-[280px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-sage w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar profesional o servicio..."
            className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-border-tan bg-bone/30 focus:bg-white text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-bone/80 border-b border-border-tan/60 text-sage text-[0.72rem] font-bold tracking-wider uppercase">
              <th className="py-3 px-6 w-1/4">Fecha & Hora</th>
              <th className="py-3 px-4 w-1/4">Profesional</th>
              <th className="py-3 px-4 w-1/4">Servicio</th>
              <th className="py-3 px-4 w-1/4">Paciente</th>
              <th className="py-3 px-6 text-center w-24">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
            {citas.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sage font-medium">
                  No se encontraron registros de citas en este período.
                </td>
              </tr>
            ) : (
              citas.map((c) => (
                <tr key={c.id} className="hover:bg-bone/40 transition">
                  <td className="py-3.5 px-6 font-medium text-charcoal">
                    <p className="font-semibold text-charcoal">{c.dateStr}</p>
                    <p className="text-[11px] text-sage mt-0.5">{c.timeStr}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sage-soft text-brand font-bold text-xs flex items-center justify-center">
                        {c.professionalName.split(' ')[1]?.charAt(0) ||
                          c.professionalName.charAt(0) ||
                          'M'}
                      </div>
                      <span className="font-bold text-charcoal">{c.professionalName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal/80 font-medium">{c.service}</td>
                  <td className="py-3.5 px-4 text-charcoal/85">
                    <p className="font-semibold text-charcoal">{c.petName}</p>
                    <p className="text-[11px] text-sage">{c.petBreed}</p>
                  </td>
                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                        c.status === 'Atendido'
                          ? 'bg-terracotta-soft text-[#A66D5B]'
                          : c.status === 'Agendado'
                            ? 'bg-[#E8F2EF] text-brand'
                            : 'bg-[#FBF1E6] text-ochre'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border-tan/50 bg-white text-xs text-sage">
        <span>
          Mostrando {citas.length} registro{citas.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  )
}
