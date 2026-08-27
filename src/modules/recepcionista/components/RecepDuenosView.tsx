import type { RecepDuenoDetail, RecepDuenoListItem, RecepDuenoStatusFilter } from '../types'
import { ViewPopup } from './ViewPopup'
import { RecepDuenosToolbar } from './RecepDuenosToolbar'
import { RecepDuenosTable } from './RecepDuenosTable'
import { RecepDuenoDetailPanel } from './RecepDuenoDetailPanel'

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
  onSelect: (ownerId: string) => void
  onCloseDetail: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
  onGoToPage?: (page: number) => void
}

// Vista Dueños: filtros + tabla; panel de detalle solo al seleccionar
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
  onSelect,
  onCloseDetail,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: RecepDuenosViewProps) {
  return (
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

      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden">
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

        {selectedDetail && (
          <RecepDuenoDetailPanel detail={selectedDetail} onClose={onCloseDetail} />
        )}
      </div>
    </ViewPopup>
  )
}
