import { useState, useMemo } from 'react'
import type { ReportesCitaDetalleVm } from '../../types/reportesSuperAdmin.types'
import { SearchIcon, Pagination } from '@/global/components'

interface ReportesCitasDetalleTableProps {
  citas: ReportesCitaDetalleVm[]
  searchQuery: string
  onSearchChange: (value: string) => void
}

const ITEMS_PER_PAGE = 5

// Tabla de detalle de citas del periodo (fuente: Appointments, no Reports API)
export function ReportesCitasDetalleTable({
  citas,
  searchQuery,
  onSearchChange,
}: ReportesCitasDetalleTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(citas.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedCitas = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return citas.slice(start, start + ITEMS_PER_PAGE)
  }, [citas, safePage])

  const handleSearchChange = (value: string) => {
    setCurrentPage(1)
    onSearchChange(value)
  }

  return (
    <div className="relative z-10 bg-white border border-border-tan rounded-xl shadow-2xs overflow-hidden animate-view-popup flex-1 flex flex-col">
      <div className="p-3 sm:p-3.5 border-b border-border-tan/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white">
        <h3 className="text-sm font-bold text-brand">Detalle de Citas Recientes</h3>
        <div className="relative w-full sm:w-[260px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-sage w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar profesional o servicio..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-border-tan bg-bone/30 focus:bg-white text-xs text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-bone/80 border-b border-border-tan/60 text-sage text-[0.7rem] font-bold tracking-wider uppercase">
              <th className="py-2.5 px-4 w-1/4">Fecha & Hora</th>
              <th className="py-2.5 px-4 w-1/4">Profesional</th>
              <th className="py-2.5 px-4 w-1/4">Servicio</th>
              <th className="py-2.5 px-4 w-1/4">Paciente</th>
              <th className="py-2.5 px-4 text-center w-24">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-tan/30 text-xs">
            {paginatedCitas.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sage font-medium">
                  No se encontraron registros de citas en este período.
                </td>
              </tr>
            ) : (
              paginatedCitas.map((c) => (
                <tr key={c.id} className="hover:bg-bone/40 transition">
                  <td className="py-2.5 px-4 font-medium text-charcoal">
                    <p className="font-semibold text-charcoal">{c.dateStr}</p>
                    <p className="text-[10px] text-sage mt-0.5">{c.timeStr}</p>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-sage-soft text-brand font-bold text-[11px] flex items-center justify-center">
                        {c.professionalName.split(' ')[1]?.charAt(0) ||
                          c.professionalName.charAt(0) ||
                          'M'}
                      </div>
                      <span className="font-bold text-charcoal">{c.professionalName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-charcoal/80 font-medium">{c.service}</td>
                  <td className="py-2.5 px-4 text-charcoal/85">
                    <p className="font-semibold text-charcoal">{c.petName}</p>
                    <p className="text-[10px] text-sage">{c.petBreed}</p>
                  </td>
                  <td className="py-2.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t border-border-tan/50 bg-white text-xs text-sage mt-auto">
        <span>
          Mostrando {paginatedCitas.length} de {citas.length} registro{citas.length === 1 ? '' : 's'}
        </span>
        {totalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}
