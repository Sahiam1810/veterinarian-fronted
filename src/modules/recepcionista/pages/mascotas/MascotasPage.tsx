import { useEffect } from 'react'
import { RecepMascotasView } from '../../components'
import { useRecepMascotas } from '../../hooks'

interface MascotasPageProps {
  onNotice?: (message: string) => void
}

// Página Mascotas del recepcionista
export function MascotasPage({ onNotice }: MascotasPageProps) {
  const {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    isLoading,
    error,
    notice,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleNewPet,
    handlePrevPage,
    handleNextPage,
    handleViewClinicalHistory,
  } = useRecepMascotas(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando mascotas…</p>
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
      <RecepMascotasView
        items={filteredItems}
        selectedDetail={selectedDetail}
        search={search}
        pageStart={directory.pageStart}
        pageEnd={Math.min(directory.pageEnd, filteredItems.length || directory.pageEnd)}
        totalCount={directory.totalCount}
        onSearchChange={setSearch}
        onOpenFilters={handleOpenFilters}
        onNewPet={handleNewPet}
        onSelect={handleSelect}
        onCloseDetail={handleCloseDetail}
        onViewClinicalHistory={handleViewClinicalHistory}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  )
}
