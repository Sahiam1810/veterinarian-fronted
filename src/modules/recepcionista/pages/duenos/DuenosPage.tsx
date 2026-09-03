import { useEffect } from 'react'
import { RecepDuenosView } from '../../components'
import { useRecepDuenos } from '../../hooks'

interface DuenosPageProps {
  onNotice?: (message: string) => void
}

// Página Dueños del recepcionista (conectada al backend real)
export function DuenosPage({ onNotice }: DuenosPageProps) {
  const {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    pageStart,
    pageEnd,
    totalCount,
    isLoading,
    error,
    notice,
    handleSelect,
    handleCloseDetail,
    handleNewOwner,
    handlePrevPage,
    handleNextPage,
    handleGoToPage,
  } = useRecepDuenos(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading && !directory) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[300px]">
        <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-sage font-medium">Cargando directorio de dueños…</p>
      </div>
    )
  }

  if (error && !directory) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex flex-col items-center gap-3 text-center my-4">
        <p className="text-sm font-semibold" role="alert">
          {error}
        </p>
      </div>
    )
  }

  if (!directory) return null

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden">
      <RecepDuenosView
        items={filteredItems}
        selectedDetail={selectedDetail}
        search={search}
        statusFilter={statusFilter}
        pageStart={pageStart}
        pageEnd={pageEnd}
        totalCount={totalCount}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onNewOwner={handleNewOwner}
        onSelect={handleSelect}
        onCloseDetail={handleCloseDetail}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onGoToPage={handleGoToPage}
      />
    </div>
  )
}
