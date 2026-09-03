import { useEffect } from 'react'
import { RecepMascotasView } from '../../components'
import { useRecepMascotas } from '../../hooks'

interface MascotasPageProps {
  onNotice?: (message: string) => void
}

// Página Mascotas del recepcionista (conectada al backend real)
export function MascotasPage({ onNotice }: MascotasPageProps) {
  const {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    pageStart,
    pageEnd,
    totalCount,
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

  if (isLoading && !directory) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[300px]">
        <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-sage font-medium">Cargando directorio de mascotas…</p>
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
      <RecepMascotasView
        items={filteredItems}
        selectedDetail={selectedDetail}
        search={search}
        pageStart={pageStart}
        pageEnd={pageEnd}
        totalCount={totalCount}
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
