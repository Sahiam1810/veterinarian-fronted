import { MascotaFichaModal } from '@/modules/superadmin'
import type { HistoriaClinicaPayload, MascotaDetail, MascotaListItem } from '../types'
import { MascotasToolbar } from './MascotasToolbar'
import { MascotasTable } from './MascotasTable'
import { HistoriaClinicaModal } from './HistoriaClinicaModal'
import { ViewPopup } from './ViewPopup'

interface VetMascotasViewProps {
  items: MascotaListItem[]
  selectedDetail: MascotaDetail | null
  search: string
  speciesFilter: string
  speciesOptions: string[]
  pageStart: number
  pageEnd: number
  totalCount: number
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  historia: HistoriaClinicaPayload | null
  isHistoriaOpen: boolean
  isHistoriaLoading?: boolean
  onSearchChange: (value: string) => void
  onSpeciesChange: (value: string) => void
  onOpenFilters?: () => void
  onCreatePet?: () => void
  onEditPet?: (petId?: string) => void
  onDeletePet?: (petId?: string) => void
  onSelect: (petId: string) => void
  onCloseDetail: () => void
  onViewClinicalHistory?: () => void
  onCloseHistoria: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

// Vista Mascotas: tabla a ancho completo (como SuperAdmin); "Ver" abre la
// misma ficha modal compartida en vez de un panel lateral fijo (S48).
export function VetMascotasView({
  items,
  selectedDetail,
  search,
  speciesFilter,
  speciesOptions,
  pageStart,
  pageEnd,
  totalCount,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  historia,
  isHistoriaOpen,
  isHistoriaLoading = false,
  onSearchChange,
  onSpeciesChange,
  onOpenFilters,
  onCreatePet,
  onEditPet,
  onDeletePet,
  onSelect,
  onCloseDetail,
  onViewClinicalHistory,
  onCloseHistoria,
  onPrevPage,
  onNextPage,
}: VetMascotasViewProps) {
  return (
    <>
      <ViewPopup
        animationKey="mascotas"
        className="flex flex-col gap-3 sm:gap-4 h-full min-h-0 min-w-0 overflow-hidden"
      >
        <div className="shrink-0 min-w-0">
          <MascotasToolbar
            search={search}
            speciesFilter={speciesFilter}
            speciesOptions={speciesOptions}
            canCreate={canCreate}
            onSearchChange={onSearchChange}
            onSpeciesChange={onSpeciesChange}
            onOpenFilters={onOpenFilters}
            onCreatePet={onCreatePet}
          />
        </div>

        <div className="relative flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <MascotasTable
            items={items}
            selectedId={selectedDetail?.id ?? null}
            pageStart={pageStart}
            pageEnd={pageEnd}
            totalCount={totalCount}
            canEdit={canEdit}
            canDelete={canDelete}
            onSelect={onSelect}
            onEditPet={onEditPet}
            onDeletePet={onDeletePet}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
          />
        </div>
      </ViewPopup>

      <MascotaFichaModal
        item={selectedDetail ? { type: 'vetMascota', data: selectedDetail } : null}
        onClose={onCloseDetail}
        onViewHistoria={onViewClinicalHistory}
        isHistoriaLoading={isHistoriaLoading}
      />

      {isHistoriaOpen && historia && (
        <HistoriaClinicaModal
          historia={historia}
          onClose={onCloseHistoria}
        />
      )}
    </>
  )
}
