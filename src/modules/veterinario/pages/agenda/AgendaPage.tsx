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
    isLoading,
    error,
    notice,
    handlePrevPeriod,
    handleNextPeriod,
    handleGoToday,
    handleChangeView,
    handleOpenFilters,
    handleSelectEvent,
  } = useVetAgenda(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando agenda…</p>
  }

  if (error) {
    return (
      <p className="text-sm text-danger font-medium" role="alert">
        {error}
      </p>
    )
  }

  if (!agenda) return null

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden">
      <VetAgendaView
        agenda={agenda}
        viewMode={viewMode}
        onPrevPeriod={handlePrevPeriod}
        onNextPeriod={handleNextPeriod}
        onGoToday={handleGoToday}
        onChangeView={handleChangeView}
        onOpenFilters={handleOpenFilters}
        onSelectEvent={handleSelectEvent}
      />
    </div>
  )
}
