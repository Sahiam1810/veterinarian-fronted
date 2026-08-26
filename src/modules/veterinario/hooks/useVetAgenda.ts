import { useEffect, useState } from 'react'
import type { AgendaCalendarEvent, AgendaViewMode, AgendaWeekPayload } from '../types'
import { fetchVetAgendaWeek } from '../services'

export function useVetAgenda(enabled: boolean) {
  const [agenda, setAgenda] = useState<AgendaWeekPayload | null>(null)
  const [viewMode, setViewMode] = useState<AgendaViewMode>('semana')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function loadAgenda() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchVetAgendaWeek()
        if (!cancelled) {
          setAgenda(data)
          setViewMode(data.viewMode)
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar la agenda')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadAgenda()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }

  const handlePrevPeriod = () => showNotice('Navegación de periodo: pendiente de API')
  const handleNextPeriod = () => showNotice('Navegación de periodo: pendiente de API')
  const handleGoToday = () => showNotice('Ir a hoy: pendiente de API')

  const handleChangeView = (mode: AgendaViewMode) => {
    setViewMode(mode)
    if (mode !== 'semana') {
      showNotice(`Vista “${mode}” pendiente; mostrando semana de ejemplo`)
    }
  }

  const handleOpenFilters = () => showNotice('Filtros: módulo pendiente')

  const handleSelectEvent = (event: AgendaCalendarEvent) => {
    if (event.status === 'BLOQUEO') {
      showNotice(event.blockLabel ?? 'Bloqueo')
      return
    }
    showNotice(`${event.petName}: ${event.service}`)
  }

  return {
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
  }
}
