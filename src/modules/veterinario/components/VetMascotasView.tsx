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

// Vista Mascotas: en móvil el detalle cubre la lista; en desktop va al lado.
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
        <div className={`shrink-0 min-w-0 ${selectedDetail ? 'hidden lg:block' : ''}`}>
          <MascotasToolbar
            search={search}
            speciesFilter={speciesFilter}
            speciesOptions={speciesOptions}
            onSearchChange={onSearchChange}
            onSpeciesChange={onSpeciesChange}
            onOpenFilters={onOpenFilters}
          />
        </div>

        <div className="relative flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden">
          <div
            className={`min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden ${
              selectedDetail ? 'hidden lg:flex' : 'flex'
            }`}
          >
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
          </div>

          {selectedDetail ? (
            <div className="absolute inset-0 z-20 lg:static lg:inset-auto lg:z-auto lg:w-[340px] xl:w-[360px] lg:shrink-0 min-h-0 min-w-0">
              <MascotaDetailPanel
                detail={selectedDetail}
                onClose={onCloseDetail}
                onViewClinicalHistory={onViewClinicalHistory}
                isHistoryLoading={isHistoriaLoading}
              />
            </div>
          ) : null}
        </div>
      </ViewPopup>

      {isHistoriaOpen && historia && (
        <HistoriaClinicaModal historia={historia} onClose={onCloseHistoria} />
      )}
    </>
  )
}
