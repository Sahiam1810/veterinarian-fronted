import type { RecepMascotaDetail, RecepMascotaListItem } from '../types'
import { ViewPopup } from './ViewPopup'
import { RecepMascotasToolbar } from './RecepMascotasToolbar'
import { RecepMascotasTable } from './RecepMascotasTable'
import { RecepMascotaDetailPanel } from './RecepMascotaDetailPanel'

interface RecepMascotasViewProps {
  items: RecepMascotaListItem[]
  selectedDetail: RecepMascotaDetail | null
  search: string
  pageStart: number
  pageEnd: number
  totalCount: number
  onSearchChange: (value: string) => void
  onOpenFilters?: () => void
  onNewPet?: () => void
  onSelect: (petId: string) => void
  onCloseDetail: () => void
  onViewClinicalHistory?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

// Vista Mascotas recepción: toolbar + tabla; el panel solo al seleccionar
export function RecepMascotasView({
  items,
  selectedDetail,
  search,
  pageStart,
  pageEnd,
  totalCount,
  onSearchChange,
  onOpenFilters,
  onNewPet,
  onSelect,
  onCloseDetail,
  onViewClinicalHistory,
  onPrevPage,
  onNextPage,
}: RecepMascotasViewProps) {
  return (
    <ViewPopup
      animationKey="mascotas"
      className="flex flex-col gap-3 sm:gap-4 h-full min-h-0 min-w-0 overflow-hidden"
    >
      <div className="shrink-0 min-w-0">
        <RecepMascotasToolbar
          search={search}
          onSearchChange={onSearchChange}
          onOpenFilters={onOpenFilters}
          onNewPet={onNewPet}
        />
      </div>

      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden">
        <RecepMascotasTable
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
          <RecepMascotaDetailPanel
            detail={selectedDetail}
            onClose={onCloseDetail}
            onViewClinicalHistory={onViewClinicalHistory}
          />
        )}
      </div>
    </ViewPopup>
  )
}
