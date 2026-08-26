import { useEffect } from 'react'
import { VetMascotasView } from '../../components'
import { useVetMascotas } from '../../hooks'

interface MascotasPageProps {
  onNotice?: (message: string) => void
}

// Página Mascotas del veterinario
export function MascotasPage({ onNotice }: MascotasPageProps) {
  const {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    speciesFilter,
    setSpeciesFilter,
    isLoading,
    error,
    notice,
    historia,
    isHistoriaOpen,
    isHistoriaLoading,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleViewClinicalHistory,
    handleCloseHistoria,
    handlePrevPage,
    handleNextPage,
  } = useVetMascotas(true)

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
      <VetMascotasView
        items={filteredItems}
        selectedDetail={selectedDetail}
        search={search}
        speciesFilter={speciesFilter}
        speciesOptions={directory.speciesOptions}
        pageStart={directory.pageStart}
        pageEnd={Math.min(directory.pageEnd, filteredItems.length || directory.pageEnd)}
        totalCount={directory.totalCount}
        historia={historia}
        isHistoriaOpen={isHistoriaOpen}
        isHistoriaLoading={isHistoriaLoading}
        onSearchChange={setSearch}
        onSpeciesChange={setSpeciesFilter}
        onOpenFilters={handleOpenFilters}
        onSelect={handleSelect}
        onCloseDetail={handleCloseDetail}
        onViewClinicalHistory={() => {
          void handleViewClinicalHistory()
        }}
        onCloseHistoria={handleCloseHistoria}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  )
}
