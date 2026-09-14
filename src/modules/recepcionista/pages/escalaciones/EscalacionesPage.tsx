import { useEffect } from 'react'
import { RecepEscalacionesView } from '../../components'
import { useRecepEscalaciones } from '../../hooks'

interface EscalacionesPageProps {
  onNotice?: (message: string) => void
}

// Página Bandeja de Asesor / Conversaciones Escaladas para Recepcionista
export function EscalacionesPage({ onNotice }: EscalacionesPageProps) {
  const {
    directory,
    filteredItems,
    selectedId,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isRefreshing,
    pageStart,
    pageEnd,
    totalCount,
    totalPages,
    currentPage,
    isLoading,
    error,
    notice,
    handleSelect,
    reloadDirectory,
    handlePrevPage,
    handleNextPage,
    handleGoToPage,
  } = useRecepEscalaciones(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading && !directory) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[300px]">
        <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-sage font-medium">Cargando bandeja de asesor…</p>
      </div>
    )
  }

  if (error && !directory) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex flex-col items-center gap-3 text-center my-4">
        <p className="text-sm font-semibold" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void reloadDirectory()}
          className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!directory) return null

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden">
      <RecepEscalacionesView
        items={filteredItems}
        selectedId={selectedId}
        search={search}
        statusFilter={statusFilter}
        isRefreshing={isRefreshing}
        totalPending={directory.pendingCount}
        totalUrgent={directory.urgentCount}
        pageStart={pageStart}
        pageEnd={pageEnd}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => void reloadDirectory()}
        onSelect={handleSelect}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onGoToPage={handleGoToPage}
      />
    </div>
  )
}
