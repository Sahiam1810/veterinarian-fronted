import { useEffect } from 'react'
import { VetAgendaView } from '../../components'
import { useVetAgenda } from '../../hooks'

interface AgendaPageProps {
  onNotice?: (message: string) => void
}

// Página Agenda del veterinario (sin scroll)
export function AgendaPage({ onNotice }: AgendaPageProps) {
  const {
    agenda,
    viewMode,
    statusFilters,
    filtersOpen,
    isLoading,
    error,
    notice,
    handlePrevPeriod,
    handleNextPeriod,
    handleGoToday,
    handleChangeView,
    handleOpenFilters,
    handleToggleStatusFilter,
    handleSelectEvent,
  } = useVetAgenda(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading && !agenda) {
    return <p className="text-sm text-sage font-medium">Cargando agenda…</p>
  }

  if (error && !agenda) {
    return (
      <p className="text-sm text-danger font-medium" role="alert">
        {error}
      </p>
    )
  }

  if (!agenda) return null

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden relative">
      {isLoading ? (
        <p className="absolute top-2 right-2 z-30 text-[11px] font-semibold text-sage bg-white/90 px-2 py-1 rounded-lg border border-border-tan">
          Actualizando…
        </p>
      ) : null}
      {error ? (
        <p className="absolute top-2 left-2 z-30 text-[11px] font-semibold text-danger bg-white/90 px-2 py-1 rounded-lg border border-danger/20">
          {error}
        </p>
      ) : null}
      <VetAgendaView
        agenda={agenda}
        viewMode={viewMode}
        statusFilters={statusFilters}
        filtersOpen={filtersOpen}
        onPrevPeriod={handlePrevPeriod}
        onNextPeriod={handleNextPeriod}
        onGoToday={handleGoToday}
        onChangeView={handleChangeView}
        onOpenFilters={handleOpenFilters}
        onToggleStatusFilter={handleToggleStatusFilter}
        onSelectEvent={handleSelectEvent}
      />
    </div>
  )
}
