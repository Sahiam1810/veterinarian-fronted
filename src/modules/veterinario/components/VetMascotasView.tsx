import type { HistoriaClinicaPayload, MascotaDetail, MascotaListItem } from '../types'
import { MascotasToolbar } from './MascotasToolbar'
import { MascotasTable } from './MascotasTable'
import { MascotaDetailPanel } from './MascotaDetailPanel'
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
  historia: HistoriaClinicaPayload | null
  isHistoriaOpen: boolean
  isHistoriaLoading?: boolean
  onSearchChange: (value: string) => void
  onSpeciesChange: (value: string) => void
  onOpenFilters?: () => void
  onSelect: (petId: string) => void
  onCloseDetail: () => void
  onViewClinicalHistory?: () => void
  onCloseHistoria: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

// Vista Mascotas: tabla + detalle + modal de historia clínica
export function VetMascotasView({
  items,
  selectedDetail,
  search,
  speciesFilter,
  speciesOptions,
  pageStart,
  pageEnd,
  totalCount,
  historia,
  isHistoriaOpen,
  isHistoriaLoading = false,
  onSearchChange,
  onSpeciesChange,
  onOpenFilters,
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
            onSearchChange={onSearchChange}
            onSpeciesChange={onSpeciesChange}
            onOpenFilters={onOpenFilters}
          />
        </div>

        <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden">
          <MascotasTable
            items={items}
            selectedId={selectedDetail?.id ?? null}
            pageStart={pageStart}
            pageEnd={pageEnd}
            totalCount={totalCount}
            onSelect={onSelect}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
          />

          {selectedDetail && (
            <MascotaDetailPanel
              detail={selectedDetail}
              onClose={onCloseDetail}
              onViewClinicalHistory={onViewClinicalHistory}
              isHistoryLoading={isHistoriaLoading}
            />
          )}
        </div>
      </ViewPopup>

      {isHistoriaOpen && historia && (
        <HistoriaClinicaModal historia={historia} onClose={onCloseHistoria} />
      )}
    </>
  )
}
