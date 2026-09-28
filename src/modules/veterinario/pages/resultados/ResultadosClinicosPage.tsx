import { useEffect } from 'react'
import { ClinicalHistoryIcon } from '@/global/components'
import { useClinicalResults } from '../../hooks/useClinicalResults'
import type { ClinicalResultStatus } from '../../types/resultadosClinicos.types'

interface ResultadosClinicosPageProps {
  onNotice?: (message: string) => void
}

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function ResultadosClinicosPage({ onNotice }: ResultadosClinicosPageProps) {
  const {
    filters,
    results,
    veterinarians,
    pagination,
    page,
    isLoading,
    error,
    notice,
    setFilters,
    clearFilters,
    setPage,
    openResult,
  } = useClinicalResults()

  useEffect(() => {
    if (notice) onNotice?.(notice)
  }, [notice, onNotice])

  return (
    <div className="h-full min-h-0 min-w-0 overflow-y-auto relative flex flex-col gap-4 sm:gap-5">
      <header className="relative z-10 flex flex-col gap-1 animate-pop-in">
        <div className="flex items-center gap-2 text-brand">
          <ClinicalHistoryIcon className="w-6 h-6" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Resultados clínicos</h1>
        </div>
        <p className="text-xs sm:text-sm text-sage font-medium">
          Consulta centralizada de resultados de procedimientos completados.
        </p>
      </header>

      <section className="relative z-10 rounded-2xl border border-border-tan bg-white p-4 shadow-2xs animate-pop-in">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <label className="xl:col-span-2 text-xs font-bold text-sage">
            Buscar
            <input
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Mascota, propietario o procedimiento"
              className="mt-1 w-full rounded-xl border border-border-tan px-3 py-2.5 text-sm font-medium text-charcoal outline-none focus:border-brand"
            />
          </label>

          <label className="text-xs font-bold text-sage">
            Veterinario
            <select
              value={filters.veterinarianId}
              onChange={(event) => setFilters({ veterinarianId: event.target.value })}
              className="mt-1 w-full rounded-xl border border-border-tan bg-white px-3 py-2.5 text-sm font-medium text-charcoal outline-none focus:border-brand"
            >
              <option value="">Todos</option>
              {veterinarians.map((veterinarian) => (
                <option key={veterinarian.id} value={veterinarian.id}>
                  {veterinarian.userFullName || 'Veterinario sin nombre'}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-sage">
            Estado
            <select
              value={filters.status}
              onChange={(event) => setFilters({ status: event.target.value })}
              className="mt-1 w-full rounded-xl border border-border-tan bg-white px-3 py-2.5 text-sm font-medium text-charcoal outline-none focus:border-brand"
            >
              <option value="">Todos</option>
              <option value="COMPLETED_WITH_RESULT">Completada con resultado</option>
              <option value="COMPLETED_WITHOUT_RESULT">Completada sin resultado</option>
              <option value="PENDING">Pendiente</option>
            </select>
          </label>

          <label className="text-xs font-bold text-sage">
            Desde
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters({ from: event.target.value })}
              className="mt-1 w-full rounded-xl border border-border-tan px-3 py-2.5 text-sm font-medium text-charcoal outline-none focus:border-brand"
            />
          </label>

          <label className="text-xs font-bold text-sage">
            Hasta
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters({ to: event.target.value })}
              className="mt-1 w-full rounded-xl border border-border-tan px-3 py-2.5 text-sm font-medium text-charcoal outline-none focus:border-brand"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-3 text-xs font-bold text-brand hover:text-brand-hover cursor-pointer"
        >
          Limpiar filtros
        </button>
      </section>

      {error && (
        <div className="relative z-10 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger" role="alert">
          {error}
        </div>
      )}

      <section className="relative z-10 min-h-0 rounded-2xl border border-border-tan bg-white shadow-2xs overflow-hidden animate-view-popup">
        {isLoading ? (
          <p className="px-4 py-10 text-center text-sm font-medium text-sage">Cargando resultados clínicos…</p>
        ) : results.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <ClinicalHistoryIcon className="mx-auto h-10 w-10 text-sage/60" />
            <p className="mt-3 text-sm font-bold text-charcoal">No hay resultados clínicos disponibles.</p>
            <p className="mt-1 text-xs font-medium text-sage">
              Los procedimientos completados con archivos adjuntos aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-bone border-b border-border-tan">
                  <tr className="text-[10px] uppercase tracking-wide text-sage">
                    <th className="px-4 py-3 font-extrabold">Mascota / propietario</th>
                    <th className="px-4 py-3 font-extrabold">Procedimiento</th>
                    <th className="px-4 py-3 font-extrabold">Solicitud</th>
                    <th className="px-4 py-3 font-extrabold">Completado</th>
                    <th className="px-4 py-3 font-extrabold">Veterinario</th>
                    <th className="px-4 py-3 font-extrabold">Estado</th>
                    <th className="px-4 py-3 font-extrabold">Precio</th>
                    <th className="px-4 py-3 font-extrabold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tan/60">
                  {results.map((result) => (
                    <tr key={result.procedureOrderId} className="align-top hover:bg-bone/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-charcoal">{result.petName}</p>
                        <p className="mt-0.5 text-xs font-medium text-sage">{result.ownerName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-charcoal">{result.procedureName || 'Procedimiento'}</p>
                        {result.notes && <p className="mt-0.5 max-w-[220px] text-xs text-sage">{result.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-charcoal">{formatDate(result.requestedAt)}</td>
                      <td className="px-4 py-3 text-xs font-medium text-charcoal">{formatDate(result.completedAt)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-charcoal">{result.veterinarianName || 'Sin registrar'}</td>
                      <td className="px-4 py-3"><StatusBadge status={result.status} /></td>
                      <td className="px-4 py-3 text-xs font-bold text-charcoal">
                        {result.unitPrice == null ? 'No disponible' : moneyFormatter.format(result.unitPrice)}
                      </td>
                      <td className="px-4 py-3">
                        {result.resultFileUrl?.trim() ? (
                          <a
                            href={result.resultFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex whitespace-nowrap rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-hover"
                          >
                            Ver resultado
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openResult(result.resultFileUrl)}
                            className="whitespace-nowrap rounded-lg border border-border-tan bg-white px-3 py-2 text-xs font-bold text-charcoal transition hover:bg-bone cursor-pointer"
                          >
                            Resultado no disponible
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-border-tan bg-bone px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-sage">
                {pagination.totalItems} resultado{pagination.totalItems === 1 ? '' : 's'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border border-border-tan bg-white px-3 py-2 text-xs font-bold text-charcoal disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  Anterior
                </button>
                <span className="px-2 text-xs font-bold text-charcoal">
                  Página {pagination.page} de {Math.max(pagination.totalPages, 1)}
                </span>
                <button
                  type="button"
                  disabled={pagination.totalPages === 0 || page >= pagination.totalPages || isLoading}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border border-border-tan bg-white px-3 py-2 text-xs font-bold text-charcoal disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function formatDate(value?: string | null): string {
  if (!value) return 'Sin registrar'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Fecha inválida' : dateFormatter.format(date)
}

function StatusBadge({ status }: { status: ClinicalResultStatus }) {
  const label = status === 'COMPLETED_WITH_RESULT'
    ? 'Completada con resultado'
    : status === 'COMPLETED_WITHOUT_RESULT'
      ? 'Completada sin resultado'
      : status === 'PENDING'
        ? 'Pendiente'
        : status

  return (
    <span className="inline-flex whitespace-nowrap rounded-full border border-brand/15 bg-mint-soft px-2.5 py-1 text-[10px] font-extrabold text-brand">
      {label}
    </span>
  )
}
