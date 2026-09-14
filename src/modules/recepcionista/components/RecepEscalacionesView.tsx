import type {
  EscalatedConversationListItem,
  EscalationStatusFilter,
} from '../types'
import { ViewPopup } from './ViewPopup'
import { RecepEscalacionesToolbar } from './RecepEscalacionesToolbar'
import { RecepEscalacionesTable } from './RecepEscalacionesTable'

interface RecepEscalacionesViewProps {
  items: EscalatedConversationListItem[]
  selectedId: string | null
  search: string
  statusFilter: EscalationStatusFilter
  isRefreshing?: boolean
  totalPending?: number
  totalUrgent?: number
  pageStart: number
  pageEnd: number
  totalCount: number
  currentPage?: number
  totalPages?: number
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: EscalationStatusFilter) => void
  onRefresh?: () => void
  onSelect: (id: string) => void
  onPrevPage?: () => void
  onNextPage?: () => void
  onGoToPage?: (page: number) => void
}

export function RecepEscalacionesView({
  items,
  selectedId,
  search,
  statusFilter,
  isRefreshing = false,
  totalPending,
  totalUrgent,
  pageStart,
  pageEnd,
  totalCount,
  currentPage,
  totalPages,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
  onSelect,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: RecepEscalacionesViewProps) {
  return (
    <ViewPopup
      animationKey="conversaciones"
      className="flex flex-col gap-3 sm:gap-4 h-full min-h-0 min-w-0 overflow-hidden"
    >
      <div className="shrink-0 min-w-0">
        <RecepEscalacionesToolbar
          search={search}
          statusFilter={statusFilter}
          isRefreshing={isRefreshing}
          totalPending={totalPending}
          totalUrgent={totalUrgent}
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
          onRefresh={onRefresh}
        />
      </div>

      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
        <RecepEscalacionesTable
          items={items}
          selectedId={selectedId}
          pageStart={pageStart}
          pageEnd={pageEnd}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onSelect={onSelect}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          onGoToPage={onGoToPage}
        />
      </div>
    </ViewPopup>
  )
}
