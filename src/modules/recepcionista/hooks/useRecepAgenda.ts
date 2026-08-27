import { useEffect, useMemo, useState } from 'react'
import type {
  RecepAgendaCatalogPayload,
  RecepAgendaDayAppointment,
  RecepAgendaFormState,
  RecepAgendaOwnerOption,
  RecepAgendaPetOption,
} from '../types'
import { fetchRecepAgendaCatalog, fetchRecepDayAppointments } from '../services'

const EMPTY_FORM: RecepAgendaFormState = {
  ownerQuery: '',
  ownerId: '',
  petId: '',
  serviceId: 'srv-general',
  professionalId: 'pro-roberto',
  dateValue: '',
  timeSlotId: '09:30',
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
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<RecepAgendaFormState>(EMPTY_FORM)
  const [notice, setNotice] = useState<string | null>(null)
  const [isDayPanelOpen, setIsDayPanelOpen] = useState(false)
  const [dayAppointments, setDayAppointments] = useState<RecepAgendaDayAppointment[]>(
    [],
  )
  const [isDayLoading, setIsDayLoading] = useState(false)
  const [dayPanelDate, setDayPanelDate] = useState('')

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function loadCatalog() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchRecepAgendaCatalog()
        if (!cancelled) setCatalog(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar Agenda y Citas')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadCatalog()
    return () => {
      cancelled = true
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setForm(EMPTY_FORM)
      setIsDayPanelOpen(false)
      setDayAppointments([])
      setDayPanelDate('')
    }
  }, [enabled])

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }

  // Recarga citas al abrir el panel o al cambiar la fecha consultada
  useEffect(() => {
    if (!enabled || !isDayPanelOpen || !dayPanelDate) return

    let cancelled = false

    async function loadDay() {
      setIsDayLoading(true)
      try {
        const list = await fetchRecepDayAppointments(dayPanelDate)
        if (!cancelled) setDayAppointments(list)
      } catch {
        if (!cancelled) {
          setDayAppointments([])
          setNotice('No se pudieron cargar las citas del día')
        }
      } finally {
        if (!cancelled) setIsDayLoading(false)
      }
    }

    void loadDay()
    return () => {
      cancelled = true
    }
  }, [enabled, isDayPanelOpen, dayPanelDate])

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
    return catalog.pets.filter((pet) => pet.ownerId === form.ownerId)
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
      // Al cambiar dueño se limpia la mascota seleccionada
      if (key === 'ownerId') next.petId = ''
      return next
    })

    // Si cambia la fecha con el panel abierto, sincroniza la consulta
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

  const handleConfirm = () => {
    if (!form.ownerId || !form.petId) {
      showNotice('Selecciona dueño y mascota')
      return
    }
    if (!form.dateValue || !form.timeSlotId) {
      showNotice('Selecciona fecha y horario')
      return
    }
    showNotice('Cita agendada (mock)')
  }

  const handleCancel = () => {
    setForm({
      ...EMPTY_FORM,
      serviceId: catalog?.services[0]?.id ?? '',
      professionalId: catalog?.professionals[0]?.id ?? '',
      timeSlotId: catalog?.timeSlots.find((s) => s.available)?.id ?? '',
    })
    showNotice('Formulario limpiado')
  }

  // Abre el calendario flotante con citas del día (fecha del form o hoy)
  const handleOpenDayPanel = () => {
    const targetDate = form.dateValue || todayIsoDate()
    if (!form.dateValue) {
      setForm((prev) => ({ ...prev, dateValue: targetDate }))
    }
    setDayPanelDate(targetDate)
    setIsDayPanelOpen(true)
  }

  const handleCloseDayPanel = () => setIsDayPanelOpen(false)

  // Cambia el día mostrado en el calendario flotante
  const handleChangeDayPanelDate = (nextDate: string) => {
    if (!nextDate) return
    setDayPanelDate(nextDate)
    setForm((prev) => ({ ...prev, dateValue: nextDate }))
  }

  // Carga la cita en el formulario para editarla (solo pendientes / en curso)
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
  }
}
