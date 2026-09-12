import { MascotaFichaModal, type MascotaFichaModalItem } from '@/modules/superadmin'
import type { RecepDuenoDetail, RecepDuenoListItem, RecepDuenoStatusFilter } from '../types'
import { ViewPopup } from './ViewPopup'
import { RecepDuenosToolbar } from './RecepDuenosToolbar'
import { RecepDuenosTable } from './RecepDuenosTable'

interface RecepDuenosViewProps {
  items: RecepDuenoListItem[]
  selectedDetail: RecepDuenoDetail | null
  search: string
  statusFilter: RecepDuenoStatusFilter
  pageStart: number
  pageEnd: number
  totalCount: number
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: RecepDuenoStatusFilter) => void
  onNewOwner?: () => void
  onEditOwner?: (detail: RecepDuenoDetail) => void
  onSelect: (ownerId: string) => void
  onCloseDetail: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
  onGoToPage?: (page: number) => void
}

// S53: la ficha del dueño usa el modal compartido con SuperAdmin/Veterinario
// (MascotaFichaModal) en vez de un panel lateral propio del módulo.
function toFichaItem(detail: RecepDuenoDetail): MascotaFichaModalItem {
  return {
    type: 'dueno',
    data: {
      id: detail.id,
      name: detail.fullName,
      documentId: detail.documentId,
      email: detail.email,
      phone: detail.phone,
      address: detail.address || '',
      city: detail.city || '',
      status: detail.estado,
      registrationDate: detail.registrationDateLabel || '',
      mascotasSummary: detail.pets.map((pet) => `${pet.name} (${pet.species})`),
    },
  }
}

// Vista Dueños: filtros + tabla; ficha en modal solo al seleccionar
export function RecepDuenosView({
  items,
  selectedDetail,
  search,
  statusFilter,
  pageStart,
  pageEnd,
  totalCount,
  onSearchChange,
  onStatusFilterChange,
  onNewOwner,
  onEditOwner,
  onSelect,
  onCloseDetail,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: RecepDuenosViewProps) {
  return (
    <>
      <ViewPopup
        animationKey="duenos"
        className="flex flex-col gap-3 sm:gap-4 h-full min-h-0 min-w-0 overflow-hidden"
      >
        <div className="shrink-0 min-w-0">
          <RecepDuenosToolbar
            search={search}
            statusFilter={statusFilter}
            onSearchChange={onSearchChange}
            onStatusFilterChange={onStatusFilterChange}
            onNewOwner={onNewOwner}
          />
        </div>

        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <RecepDuenosTable
            items={items}
            selectedId={selectedDetail?.id ?? null}
            pageStart={pageStart}
            pageEnd={pageEnd}
            totalCount={totalCount}
            onSelect={onSelect}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            onGoToPage={onGoToPage}
          />
        </div>
      </ViewPopup>

      <MascotaFichaModal
        item={selectedDetail ? toFichaItem(selectedDetail) : null}
        onClose={onCloseDetail}
        onEditDueno={
          onEditOwner && selectedDetail ? () => onEditOwner(selectedDetail) : undefined
        }
      />
    </>
  )
}
