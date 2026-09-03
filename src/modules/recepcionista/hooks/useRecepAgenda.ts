import { useEffect, useMemo, useState, useCallback } from 'react'
import type {
  RecepAgendaCatalogPayload,
  RecepAgendaDayAppointment,
  RecepAgendaFormState,
  RecepAgendaOwnerOption,
  RecepAgendaPetOption,
} from '../types'
import {
  fetchRecepAgendaCatalog,
  fetchRecepDayAppointments,
  createRecepAppointment,
} from '../services'

const EMPTY_FORM: RecepAgendaFormState = {
  ownerQuery: '',
  ownerId: '',
  petId: '',
  serviceId: '',
  professionalId: '',
  dateValue: '',
  timeSlotId: '09:00',
  notes: '',
}

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatSummaryDate(dateValue: string, timeDisplay: string | null): string {
  if (!dateValue) return 'Sin fecha seleccionada'
  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) return dateValue

  const date = new Date(year, month - 1, day)
  const formatted = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  return timeDisplay ? `${formatted}, ${timeDisplay}` : formatted
}

function formatDayTitle(dateValue: string): string {
  if (!dateValue) return 'Hoy'
  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) return dateValue
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, day))
}

export function useRecepAgenda(enabled: boolean) {
  const [catalog, setCatalog] = useState<RecepAgendaCatalogPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<RecepAgendaFormState>(EMPTY_FORM)
  const [notice, setNotice] = useState<string | null>(null)
  const [isDayPanelOpen, setIsDayPanelOpen] = useState(false)
  const [dayAppointments, setDayAppointments] = useState<RecepAgendaDayAppointment[]>([])
  const [isDayLoading, setIsDayLoading] = useState(false)
  const [dayPanelDate, setDayPanelDate] = useState('')

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 3200)
  }, [])

  const loadCatalog = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchRecepAgendaCatalog()
      setCatalog(data)
      setForm((prev) => ({
        ...prev,
        serviceId: prev.serviceId || data.services[0]?.id || '',
        professionalId: prev.professionalId || data.professionals[0]?.id || '',
        dateValue: prev.dateValue || todayIsoDate(),
      }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar Agenda y Citas'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void loadCatalog()
  }, [enabled, loadCatalog])

  const loadDayAppointments = useCallback(async (targetDate: string) => {
    if (!targetDate) return
    setIsDayLoading(true)
    try {
      const list = await fetchRecepDayAppointments(targetDate)
      setDayAppointments(list)
    } catch {
      setDayAppointments([])
      showNotice('No se pudieron cargar las citas del día seleccionado')
    } finally {
      setIsDayLoading(false)
    }
  }, [showNotice])

  useEffect(() => {
    if (!enabled || !isDayPanelOpen || !dayPanelDate) return
    void loadDayAppointments(dayPanelDate)
  }, [enabled, isDayPanelOpen, dayPanelDate, loadDayAppointments])

  const matchedOwners = useMemo(() => {
    if (!catalog) return [] as RecepAgendaOwnerOption[]
    const query = form.ownerQuery.trim().toLowerCase()
    if (!query) return catalog.owners
    return catalog.owners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(query) ||
        owner.documentLabel.toLowerCase().includes(query),
    )
  }, [catalog, form.ownerQuery])

  const selectedOwner = useMemo(() => {
    if (!catalog || !form.ownerId) return null
    return catalog.owners.find((owner) => owner.id === form.ownerId) ?? null
  }, [catalog, form.ownerId])

  const petsForOwner = useMemo(() => {
    if (!catalog || !form.ownerId) return [] as RecepAgendaPetOption[]
    return catalog.pets.filter((pet) => pet.ownerId.toLowerCase() === form.ownerId.toLowerCase())
  }, [catalog, form.ownerId])

  const selectedPet = useMemo(() => {
    if (!catalog || !form.petId) return null
    return catalog.pets.find((pet) => pet.id === form.petId) ?? null
  }, [catalog, form.petId])

  const selectedService = useMemo(() => {
    if (!catalog) return null
    return catalog.services.find((item) => item.id === form.serviceId) ?? null
  }, [catalog, form.serviceId])

  const selectedProfessional = useMemo(() => {
    if (!catalog) return null
    return (
      catalog.professionals.find((item) => item.id === form.professionalId) ?? null
    )
  }, [catalog, form.professionalId])

  const selectedSlot = useMemo(() => {
    if (!catalog || !form.timeSlotId) return null
    return catalog.timeSlots.find((slot) => slot.id === form.timeSlotId) ?? null
  }, [catalog, form.timeSlotId])

  const summaryWhen = formatSummaryDate(
    form.dateValue,
    selectedSlot?.displayLabel ?? null,
  )

  const dayPanelTitle = formatDayTitle(dayPanelDate)

  const updateForm = <K extends keyof RecepAgendaFormState>(
    key: K,
    value: RecepAgendaFormState[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'ownerId') next.petId = ''
      return next
    })

    if (key === 'dateValue' && typeof value === 'string' && isDayPanelOpen) {
      setDayPanelDate(value || todayIsoDate())
    }
  }

  const handleOwnerQueryChange = (value: string) => {
    setForm((prev) => {
      const match = catalog?.owners.find(
        (owner) =>
          owner.name.toLowerCase() === value.trim().toLowerCase() ||
          owner.documentLabel.toLowerCase() === value.trim().toLowerCase(),
      )
      return {
        ...prev,
        ownerQuery: value,
        ownerId: match?.id ?? '',
        petId: match?.id === prev.ownerId ? prev.petId : '',
      }
    })
  }

  const handleSelectOwnerSuggestion = (owner: RecepAgendaOwnerOption) => {
    setForm((prev) => ({
      ...prev,
      ownerQuery: owner.name,
      ownerId: owner.id,
      petId: '',
    }))
  }

  const handleConfirm = async () => {
    if (!form.ownerId) {
      showNotice('Por favor selecciona un dueño de la lista')
      return
    }
    if (!form.petId) {
      showNotice('Por favor selecciona la mascota del dueño')
      return
    }
    if (!form.serviceId) {
      showNotice('Por favor selecciona un servicio')
      return
    }
    if (!form.professionalId) {
      showNotice('Por favor selecciona un profesional veterinario')
      return
    }
    if (!form.dateValue || !form.timeSlotId) {
      showNotice('Por favor selecciona fecha y horario para la cita')
      return
    }

    setIsSubmitting(true)
    try {
      await createRecepAppointment(form)
      showNotice('¡Cita agendada exitosamente en el sistema!')
      
      // Limpiar y resetear el form
      setForm({
        ...EMPTY_FORM,
        serviceId: catalog?.services[0]?.id ?? '',
        professionalId: catalog?.professionals[0]?.id ?? '',
        dateValue: form.dateValue || todayIsoDate(),
        timeSlotId: '09:00',
      })

      if (isDayPanelOpen && dayPanelDate) {
        await loadDayAppointments(dayPanelDate)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al agendar la cita'
      showNotice(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setForm({
      ...EMPTY_FORM,
      serviceId: catalog?.services[0]?.id ?? '',
      professionalId: catalog?.professionals[0]?.id ?? '',
      dateValue: todayIsoDate(),
      timeSlotId: '09:00',
    })
    showNotice('Formulario limpiado')
  }

  const handleOpenDayPanel = () => {
    const targetDate = form.dateValue || todayIsoDate()
    if (!form.dateValue) {
      setForm((prev) => ({ ...prev, dateValue: targetDate }))
    }
    setDayPanelDate(targetDate)
    setIsDayPanelOpen(true)
  }

  const handleCloseDayPanel = () => setIsDayPanelOpen(false)

  const handleChangeDayPanelDate = (nextDate: string) => {
    if (!nextDate) return
    setDayPanelDate(nextDate)
    setForm((prev) => ({ ...prev, dateValue: nextDate }))
  }

  const handleEditAppointment = (appointment: RecepAgendaDayAppointment) => {
    if (!catalog) return
    if (appointment.status === 'ATENDIDO' || appointment.status === 'CANCELADO') {
      showNotice('Esta cita ya no se puede editar')
      return
    }

    const owner =
      catalog.owners.find((item) => item.name === appointment.ownerName) ?? null
    const pet =
      catalog.pets.find(
        (item) =>
          item.name === appointment.petName &&
          (!owner || item.ownerId === owner.id),
      ) ?? null
    const service =
      catalog.services.find((item) => item.label === appointment.service) ?? null
    const professional =
      catalog.professionals.find((item) => item.name === appointment.professionalName) ??
      null
    const slot =
      catalog.timeSlots.find((item) => item.id === appointment.time) ?? null

    setForm({
      ownerQuery: owner?.name ?? appointment.ownerName,
      ownerId: owner?.id ?? '',
      petId: pet?.id ?? '',
      serviceId: service?.id ?? catalog.services[0]?.id ?? '',
      professionalId: professional?.id ?? catalog.professionals[0]?.id ?? '',
      dateValue: dayPanelDate || todayIsoDate(),
      timeSlotId: slot?.id ?? appointment.time,
      notes: appointment.notes ?? '',
    })
    setIsDayPanelOpen(false)
    showNotice(`Editando cita de ${appointment.petName}`)
  }

  return {
    catalog,
    form,
    isLoading,
    isSubmitting,
    error,
    notice,
    matchedOwners,
    selectedOwner,
    petsForOwner,
    selectedPet,
    selectedService,
    selectedProfessional,
    selectedSlot,
    summaryWhen,
    isDayPanelOpen,
    dayAppointments,
    isDayLoading,
    dayPanelTitle,
    dayPanelDate,
    updateForm,
    handleOwnerQueryChange,
    handleSelectOwnerSuggestion,
    handleConfirm,
    handleCancel,
    handleOpenDayPanel,
    handleCloseDayPanel,
    handleChangeDayPanelDate,
    handleEditAppointment,
    reloadAppointments: () => loadDayAppointments(dayPanelDate || todayIsoDate()),
  }
}
