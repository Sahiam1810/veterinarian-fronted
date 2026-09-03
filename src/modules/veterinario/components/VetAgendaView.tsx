import type {
  AgendaCalendarEvent,
  AgendaStatusFilter,
  AgendaViewMode,
  AgendaWeekPayload,
} from '../types'
import { AgendaToolbar } from './AgendaToolbar'
import { AgendaLegendBar } from './AgendaLegendBar'
import { AgendaWeekGrid } from './AgendaWeekGrid'
import { ViewPopup } from './ViewPopup'

interface VetAgendaViewProps {
  agenda: AgendaWeekPayload
  viewMode: AgendaViewMode
  statusFilters?: AgendaStatusFilter[]
  filtersOpen?: boolean
  onPrevPeriod?: () => void
  onNextPeriod?: () => void
  onGoToday?: () => void
  onChangeView?: (mode: AgendaViewMode) => void
  onOpenFilters?: () => void
  onToggleStatusFilter?: (status: AgendaStatusFilter) => void
  onSelectEvent?: (event: AgendaCalendarEvent) => void
}

// Contenido de Agenda: sin scroll, adaptable al alto del panel
export function VetAgendaView({
  agenda,
  viewMode,
  statusFilters,
  filtersOpen,
  onPrevPeriod,
  onNextPeriod,
  onGoToday,
  onChangeView,
  onOpenFilters,
  onToggleStatusFilter,
  onSelectEvent,
}: VetAgendaViewProps) {
  return (
    <ViewPopup
      animationKey={`agenda-${viewMode}-${agenda.monthLabel}-${agenda.days[0]?.dateKey || 'x'}`}
      className="flex flex-col gap-3 sm:gap-4 h-full min-h-0 min-w-0 overflow-hidden"
    >
      <div className="shrink-0 min-w-0">
        <AgendaToolbar
          monthLabel={agenda.monthLabel}
          viewMode={viewMode}
          onPrevPeriod={onPrevPeriod}
          onNextPeriod={onNextPeriod}
          onGoToday={onGoToday}
          onChangeView={onChangeView}
        />
      </div>

      <div className="shrink-0 min-w-0">
        <AgendaLegendBar
          statusFilters={statusFilters}
          filtersOpen={filtersOpen}
          onOpenFilters={onOpenFilters}
          onToggleStatusFilter={onToggleStatusFilter}
        />
      </div>

      <AgendaWeekGrid
        days={agenda.days}
        events={agenda.events}
        hourStart={agenda.hourStart}
        hourEnd={agenda.hourEnd}
        currentTime={agenda.currentTime}
        currentDateKey={agenda.currentDateKey}
        onSelectEvent={onSelectEvent}
      />
    </ViewPopup>
  )
}
