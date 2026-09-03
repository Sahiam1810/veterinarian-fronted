import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  AgendaCalendarEvent,
  AgendaStatusFilter,
  AgendaViewMode,
  AgendaWeekPayload,
} from '../types'
import { fetchVetAgendaWeek } from '../services'
import { shiftAgendaAnchor, toDateKey } from '../utils/buildVetAgenda'

const ALL_STATUS_FILTERS: AgendaStatusFilter[] = [
  'AGENDADA',
  'EN_ESPERA',
  'ATENDIDA',
  'CANCELADA',
  'NO_ASISTIO',
]

export function useVetAgenda(enabled: boolean) {
  const [agenda, setAgenda] = useState<AgendaWeekPayload | null>(null)
  const [viewMode, setViewMode] = useState<AgendaViewMode>('semana')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [statusFilters, setStatusFilters] = useState<AgendaStatusFilter[]>(ALL_STATUS_FILTERS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }, [])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function loadAgenda() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchVetAgendaWeek({
          viewMode,
          anchorDate,
        })
        if (!cancelled) setAgenda(data)
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'No se pudo cargar la agenda'
          setError(msg)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadAgenda()
    return () => {
      cancelled = true
    }
  }, [enabled, viewMode, anchorDate])

  const visibleAgenda = useMemo(() => {
    if (!agenda) return null
    const allowed = new Set(statusFilters)
    return {
      ...agenda,
      viewMode,
      events: agenda.events.filter(
        (event) => event.status === 'BLOQUEO' || allowed.has(event.status as AgendaStatusFilter),
      ),
    }
  }, [agenda, statusFilters, viewMode])

  const handlePrevPeriod = () => {
    setAnchorDate((current) => shiftAgendaAnchor(current, viewMode, -1))
  }

  const handleNextPeriod = () => {
    setAnchorDate((current) => shiftAgendaAnchor(current, viewMode, 1))
  }

  const handleGoToday = () => {
    setAnchorDate(new Date())
    showNotice('Mostrando el periodo de hoy')
  }

  const handleChangeView = (mode: AgendaViewMode) => {
    setViewMode(mode)
    if (mode === 'mes') {
      showNotice('Vista mes: se muestra la semana del mes seleccionado')
    }
  }

  const handleOpenFilters = () => {
    setFiltersOpen((open) => !open)
  }

  const handleToggleStatusFilter = (status: AgendaStatusFilter) => {
    setStatusFilters((current) => {
      if (current.includes(status)) {
        if (current.length === 1) return current
        return current.filter((item) => item !== status)
      }
      return [...current, status]
    })
  }

  const handleSelectEvent = (event: AgendaCalendarEvent) => {
    if (event.status === 'BLOQUEO') {
      showNotice(event.blockLabel ?? 'Fuera de horario')
      return
    }
    showNotice(`${event.petName}: ${event.service} (${event.startTime})`)
  }

  return {
    agenda: visibleAgenda,
    viewMode,
    statusFilters,
    filtersOpen,
    isLoading,
    error,
    notice,
    anchorKey: toDateKey(anchorDate),
    handlePrevPeriod,
    handleNextPeriod,
    handleGoToday,
    handleChangeView,
    handleOpenFilters,
    handleToggleStatusFilter,
    handleSelectEvent,
  }
}
