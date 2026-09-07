import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  AgendaCalendarEvent,
  AgendaStatusFilter,
  AgendaViewMode,
  AgendaWeekPayload,
  HistoriaClinicaPayload,
} from '../types'
import {
  fetchVetAgendaWeek,
  fetchStatusAppointments,
  updateAppointmentStatus,
  findStatusId,
  fetchHistoriaClinica,
} from '../services'
import type { CitaActionTarget } from '../components'
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

  // Modales
  const [selectedAppointment, setSelectedAppointment] = useState<CitaActionTarget | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false)
  const [historiaModalTarget, setHistoriaModalTarget] = useState<HistoriaClinicaPayload | null>(null)
  const [isHistoriaModalOpen, setIsHistoriaModalOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }, [])

  const loadAgenda = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchVetAgendaWeek({
        viewMode,
        anchorDate,
      })
      setAgenda(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar la agenda'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [viewMode, anchorDate])

  useEffect(() => {
    if (!enabled) return
    void loadAgenda()
  }, [enabled, loadAgenda])

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

    const target: CitaActionTarget = {
      id: event.id,
      dateKey: event.dateKey,
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.status,
      petName: event.petName,
      species: event.species,
      service: event.service,
      clientPetId: event.clientPetId,
      petId: event.petId,
      ownerName: event.ownerName,
      ownerPhone: event.ownerPhone,
      rawStatusName: event.rawStatusName,
    }

    setSelectedAppointment(target)
    setIsActionModalOpen(true)
  }

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false)
  }

  const handleUpdateStatus = async (
    appointmentId: string,
    statusKeyword: 'atendida' | 'cancelada' | 'no_asistio',
    comment?: string | null,
  ) => {
    setIsUpdatingStatus(true)
    try {
      const statuses = await fetchStatusAppointments()
      const targetId = findStatusId(statuses, statusKeyword)
      if (!targetId) {
        showNotice(`No se encontró el estado ${statusKeyword.toUpperCase()} en el catálogo.`)
        return
      }

      await updateAppointmentStatus(appointmentId, {
        statusId: targetId,
        comment: comment || null,
      })

      showNotice(`Estado de la cita actualizado a ${statusKeyword.toUpperCase()}.`)
      await loadAgenda()

      // Actualizar el estado local de la cita seleccionada
      setSelectedAppointment((prev) => {
        if (!prev || prev.id !== appointmentId) return prev
        return {
          ...prev,
          status: statusKeyword === 'atendida' ? 'ATENDIDA' : statusKeyword === 'cancelada' ? 'CANCELADA' : 'NO_ASISTIO',
          rawStatusName: statusKeyword.toUpperCase(),
        }
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el estado de la cita'
      showNotice(msg)
      throw err
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAttendAndRegister = (appointment: CitaActionTarget) => {
    setSelectedAppointment(appointment)
    setIsActionModalOpen(false)
    setIsRegistrarOpen(true)
  }

  const handleCloseRegistrar = () => {
    setIsRegistrarOpen(false)
  }

  const handleViewHistoria = async (petId: string) => {
    try {
      const data = await fetchHistoriaClinica(petId)
      if (!data) {
        showNotice('No se encontró historia clínica para este paciente.')
        return
      }
      setHistoriaModalTarget(data)
      setIsHistoriaModalOpen(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar historia clínica'
      showNotice(msg)
    }
  }

  const handleCloseHistoria = () => {
    setIsHistoriaModalOpen(false)
    setHistoriaModalTarget(null)
  }

  const handleRegistrationSuccess = async (result: {
    recordId: string
    petId: string
    appointmentId: string
  }) => {
    setIsRegistrarOpen(false)
    showNotice('¡Atención médica y consulta registradas con éxito!')
    await loadAgenda()

    // Recargar y abrir la historia clínica automáticamente para mostrar el nuevo registro
    if (result.petId) {
      try {
        const updatedHistoria = await fetchHistoriaClinica(result.petId)
        if (updatedHistoria) {
          setHistoriaModalTarget(updatedHistoria)
          setIsHistoriaModalOpen(true)
        }
      } catch {
        // Fallback silencioso si la carga automática de la historia falla
      }
    }
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
    selectedAppointment,
    isActionModalOpen,
    isRegistrarOpen,
    historiaModalTarget,
    isHistoriaModalOpen,
    isUpdatingStatus,
    handlePrevPeriod,
    handleNextPeriod,
    handleGoToday,
    handleChangeView,
    handleOpenFilters,
    handleToggleStatusFilter,
    handleSelectEvent,
    handleCloseActionModal,
    handleUpdateStatus,
    handleAttendAndRegister,
    handleCloseRegistrar,
    handleViewHistoria,
    handleCloseHistoria,
    handleRegistrationSuccess,
    reloadAgenda: loadAgenda,
  }
}

