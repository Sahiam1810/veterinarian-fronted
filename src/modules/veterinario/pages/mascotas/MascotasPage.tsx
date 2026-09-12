import { useEffect } from 'react'
import {
  VetMascotasView,
  VetMascotaModal,
  VetEliminarMascotaModal,
} from '../../components'
import { useVetMascotas } from '../../hooks'

interface MascotasPageProps {
  onNotice?: (message: string) => void
}

// Página Mascotas del veterinario con soporte CRUD según permisos
export function MascotasPage({ onNotice }: MascotasPageProps) {
  const {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    speciesFilter,
    setSpeciesFilter,
    pageStart,
    pageEnd,
    totalCount,
    isLoading,
    error,
    notice,
    historia,
    isHistoriaOpen,
    isHistoriaLoading,
    permissions,
    speciesList,
    racesList,
    clientsList,
    isCreateOpen,
    isEditOpen,
    editingPet,
    isDeleteOpen,
    deletingPetName,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleViewClinicalHistory,
    handleCloseHistoria,
    handleOpenCreate,
    handleCloseCreate,
    handleCreatePet,
    handleOpenEdit,
    handleCloseEdit,
    handleUpdatePet,
    handleOpenDelete,
    handleCloseDelete,
    handleDeletePet,
    handlePrevPage,
    handleNextPage,
  } = useVetMascotas(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading && !directory) {
    return <p className="text-sm text-sage font-medium">Cargando mascotas…</p>
  }

  if (error && !directory) {
    return (
      <p className="text-sm text-danger font-medium" role="alert">
        {error}
      </p>
    )
  }

  if (!directory) return null

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden relative">
      {isLoading ? (
        <p className="absolute top-2 right-2 z-30 text-[11px] font-semibold text-sage bg-white/90 px-2 py-1 rounded-lg border border-border-tan">
          Actualizando…
        </p>
      ) : null}
      <VetMascotasView
        items={filteredItems}
        selectedDetail={selectedDetail}
        search={search}
        speciesFilter={speciesFilter}
        speciesOptions={directory.speciesOptions}
        pageStart={pageStart}
        pageEnd={pageEnd}
        totalCount={totalCount}
        canCreate={permissions.canCreate}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
        historia={historia}
        isHistoriaOpen={isHistoriaOpen}
        isHistoriaLoading={isHistoriaLoading}
        onSearchChange={setSearch}
        onSpeciesChange={setSpeciesFilter}
        onOpenFilters={handleOpenFilters}
        onCreatePet={handleOpenCreate}
        onEditPet={handleOpenEdit}
        onDeletePet={handleOpenDelete}
        onSelect={handleSelect}
        onCloseDetail={handleCloseDetail}
        onViewClinicalHistory={() => {
          void handleViewClinicalHistory()
        }}
        onCloseHistoria={handleCloseHistoria}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />

      {/* Modal Registrar Nueva Mascota */}
      {isCreateOpen && (
        <VetMascotaModal
          isOpen={isCreateOpen}
          mode="create"
          speciesList={speciesList}
          racesList={racesList}
          clientsList={clientsList}
          onClose={handleCloseCreate}
          onSubmit={handleCreatePet}
        />
      )}

      {/* Modal Editar Mascota */}
      {isEditOpen && (
        <VetMascotaModal
          isOpen={isEditOpen}
          mode="edit"
          initialData={editingPet}
          speciesList={speciesList}
          racesList={racesList}
          clientsList={clientsList}
          onClose={handleCloseEdit}
          onSubmit={handleUpdatePet}
        />
      )}

      {/* Modal Eliminar Mascota */}
      {isDeleteOpen && (
        <VetEliminarMascotaModal
          isOpen={isDeleteOpen}
          petName={deletingPetName}
          onClose={handleCloseDelete}
          onConfirm={handleDeletePet}
        />
      )}

    </div>
  )
}


