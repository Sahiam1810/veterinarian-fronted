import { useEffect } from 'react'
import { RecepDuenosView } from '../../components'
import { useRecepDuenos } from '../../hooks'

interface DuenosPageProps {
  onNotice?: (message: string) => void
}

// Página Dueños del recepcionista
export function DuenosPage({ onNotice }: DuenosPageProps) {
  const {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
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

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando dueños…</p>
  }

  if (error) {
    return (
      <p className="text-sm text-danger font-medium" role="alert">
        {error}
      </p>
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
        pageStart={directory.pageStart}
        pageEnd={Math.min(directory.pageEnd, filteredItems.length || directory.pageEnd)}
        totalCount={directory.totalCount}
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
