import { useEffect, useMemo, useState, useCallback } from 'react'
import { fetchMyModulePermissions, type MyPermissionsMap } from '@/modules/auth'
import type {
  RecepAgendaCatalogPayload,
  RecepAgendaDayAppointment,
  RecepAgendaFormState,
  RecepAgendaOwnerOption,
  RecepAgendaPetOption,
  RecepAgendaTimeSlot,
} from '../types'
import { canMarkRecepNoAsistio, canCheckIn, isRecepAppointmentEditable } from '../types'
import {
  fetchRecepAgendaCatalog,
  fetchRecepDayAppointments,
  fetchRecepAvailableTimeSlots,
  createRecepAppointment,
  markRecepAppointmentNoAsistio,
  checkInRecepAppointment,
  registerRecepAppointmentPayment,
  fetchAppointmentReceipt,
  type AppointmentReceiptResponse
} from '../services'
import {
  isAppointmentDateInThePast,
  PAST_APPOINTMENT_MESSAGE,
} from '@/modules/superadmin/utils/appointmentDateGuard'
import { createRecepPermissionHelpers } from '../utils/recepModulePermissions'
import { buildAvailableDaysLabel } from '../utils/availableDays'
import { fetchAvailabilitiesByVeterinarian } from '@/modules/superadmin/services/superAdminAvailabilitiesService'

const EMPTY_FORM: RecepAgendaFormState = {
  ownerQuery: '',
  ownerId: '',
  petId: '',
  serviceId: '',
  professionalId: '',
  dateValue: '',
  timeSlotId: '',
  notes: '',
}

const PAID_APPOINTMENTS_KEY = 'huellitas_paid_appointments'

function readPaidAppointments(): string[] {
  try {
    const raw = localStorage.getItem(PAID_APPOINTMENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writePaidAppointments(ids: string[]): void {
  try {
    localStorage.setItem(PAID_APPOINTMENTS_KEY, JSON.stringify(ids))
  } catch (e) {
    console.error('Error saving paid appointments', e)
  }
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
  const [modulePermissions, setModulePermissions] =
    useState<MyPermissionsMap | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<RecepAgendaFormState>(EMPTY_FORM)
  const [notice, setNotice] = useState<string | null>(null)
  const [isDayPanelOpen, setIsDayPanelOpen] = useState(false)
  const [dayAppointments, setDayAppointments] = useState<RecepAgendaDayAppointment[]>([])
  const [isDayLoading, setIsDayLoading] = useState(false)
  const [dayPanelDate, setDayPanelDate] = useState('')
  const [timeSlots, setTimeSlots] = useState<RecepAgendaTimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [availableDaysLabel, setAvailableDaysLabel] = useState<string>('')
  const [receiptData, setReceiptData] = useState<AppointmentReceiptResponse | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [paidAppointmentIds, setPaidAppointmentIds] = useState<string[]>(readPaidAppointments)

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 3200)
  }, [])

  const permissionHelpers = useMemo(
    () => createRecepPermissionHelpers(modulePermissions),
    [modulePermissions],
  )

  const canCreate = permissionHelpers.canCreateModule('agenda')
  const canEdit = permissionHelpers.canEditModule('agenda')
  const canDelete = permissionHelpers.canDeleteModule('agenda')

  const loadPermissions = useCallback(async () => {
    try {
      const permissions = await fetchMyModulePermissions()
      setModulePermissions(permissions)
    } catch {
      setModulePermissions({})
    }
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
    void loadPermissions()
  }, [enabled, loadCatalog, loadPermissions])

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

  // S56: las franjas horarias dependen del veterinario y la fecha elegidos —
  // se recalculan a partir de su disponibilidad real cada vez que cambian.
  useEffect(() => {
    if (!enabled || !form.professionalId || !form.dateValue) {
      setTimeSlots([])
      return
    }
    let cancelled = false
    setIsLoadingSlots(true)
    fetchRecepAvailableTimeSlots(form.professionalId, form.dateValue)
      .then((slots) => {
        if (!cancelled) setTimeSlots(slots)
      })
      .catch(() => {
        if (!cancelled) setTimeSlots([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, form.professionalId, form.dateValue])

  // Carga los días de disponibilidad del profesional cada vez que cambia la selección
  // para mostrárselos al recepcionista como guía antes de elegir la fecha.
  useEffect(() => {
    if (!enabled || !form.professionalId) {
      setAvailableDaysLabel('')
      return
    }
    let cancelled = false
    setAvailableDaysLabel('')
    fetchAvailabilitiesByVeterinarian(form.professionalId)
      .then((avs) => {
        if (!cancelled) setAvailableDaysLabel(buildAvailableDaysLabel(avs))
      })
      .catch(() => {
        if (!cancelled) setAvailableDaysLabel('')
      })
    return () => { cancelled = true }
  }, [enabled, form.professionalId])

  // Si el horario elegido deja de estar disponible (cambió profesional/fecha
  // o ya pasó), se limpia en vez de dejar seleccionado un horario inválido.
  useEffect(() => {
    if (!form.timeSlotId || isLoadingSlots) return
    const stillValid = timeSlots.some((slot) => slot.id === form.timeSlotId)
    if (!stillValid) {
      setForm((prev) => ({ ...prev, timeSlotId: '' }))
    }
  }, [timeSlots, isLoadingSlots, form.timeSlotId])

  const matchedOwners = useMemo(() => {
    if (!catalog) return [] as RecepAgendaOwnerOption[]
    const query = form.ownerQuery.trim().toLowerCase()
    if (!query) return catalog.owners
    return catalog.owners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(query) ||
        owner.documentLabel.toLowerCase().includes(query) ||
        (owner.phone && owner.phone.toLowerCase().includes(query)) ||
        (owner.identificationNumber && owner.identificationNumber.toLowerCase().includes(query)),
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
    if (!form.timeSlotId) return null
    return timeSlots.find((slot) => slot.id === form.timeSlotId) ?? null
  }, [timeSlots, form.timeSlotId])

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
      const q = value.trim().toLowerCase()
      const match = catalog?.owners.find(
        (owner) =>
          owner.name.toLowerCase() === q ||
          owner.documentLabel.toLowerCase() === q ||
          (owner.phone && owner.phone.toLowerCase() === q) ||
          (owner.identificationNumber && owner.identificationNumber.toLowerCase() === q),
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
    if (!canCreate) {
      showNotice('No tienes permiso para crear citas.')
      return
    }
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

    // S36: ni agendar ni reprogramar hacia una fecha/hora que ya pasó.
    if (isAppointmentDateInThePast(form.dateValue, form.timeSlotId)) {
      showNotice(PAST_APPOINTMENT_MESSAGE)
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
    if (!canEdit) {
      showNotice('No tienes permiso para editar citas.')
      return
    }
    if (!catalog) return
    if (!isRecepAppointmentEditable(appointment.status)) {
      showNotice('Solo se pueden editar citas en estado agendado')
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

    setForm({
      ownerQuery: owner?.name ?? appointment.ownerName,
      ownerId: owner?.id ?? '',
      petId: pet?.id ?? '',
      serviceId: service?.id ?? catalog.services[0]?.id ?? '',
      professionalId: professional?.id ?? catalog.professionals[0]?.id ?? '',
      dateValue: dayPanelDate || todayIsoDate(),
      // Franja de la cita ya agendada: se conserva aunque el listado dinámico
      // de horarios (S56) aún no haya terminado de cargar para este profesional/fecha.
      timeSlotId: appointment.time,
      notes: appointment.notes ?? '',
    })
    setIsDayPanelOpen(false)
    showNotice(`Editando cita de ${appointment.petName}`)
  }

  const handleMarkNoAsistio = async (appointment: RecepAgendaDayAppointment) => {
    if (!canEdit) {
      showNotice('No tienes permiso para cambiar el estado de citas.')
      return
    }
    if (!canMarkRecepNoAsistio(appointment.status)) {
      showNotice('Solo se puede marcar No Asistió en citas agendadas.')
      return
    }
    if (!window.confirm(`¿Marcar la cita de ${appointment.petName} como No Asistió?`)) {
      return
    }

    try {
      await markRecepAppointmentNoAsistio(appointment.id)
      showNotice(`Cita de ${appointment.petName} marcada como No Asistió.`)
      if (dayPanelDate) {
        await loadDayAppointments(dayPanelDate)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo marcar la cita como No Asistió'
      showNotice(msg)
    }
  }

  const isCitaPaid = useCallback(
    (appointmentId: string): boolean => {
      if (paidAppointmentIds.includes(appointmentId)) return true
      const apt = dayAppointments.find((a) => a.id === appointmentId)
      return apt?.isPaid ?? false
    },
    [dayAppointments, paidAppointmentIds],
  )

  const handleViewReceipt = useCallback(
    async (appointment: RecepAgendaDayAppointment) => {
      try {
        const receipt = await fetchAppointmentReceipt(appointment.id)
        setReceiptData(receipt)
        setIsReceiptModalOpen(true)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No se pudo cargar la factura'
        showNotice(msg)
      }
    },
    [showNotice],
  )

  const handleRegisterPayment = useCallback(
    async (appointment: RecepAgendaDayAppointment) => {
      if (!canEdit) {
        showNotice('No tienes permiso para registrar pagos de citas.')
        return
      }

      if (isCitaPaid(appointment.id)) {
        await handleViewReceipt(appointment)
        return
      }

      try {
        await registerRecepAppointmentPayment(appointment.id)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        const alreadyPaid = /ya (ha sido|fue|está|esta) pagad|already paid|cobrad/i.test(errorMsg)
        if (!alreadyPaid) {
          const msg = err instanceof Error ? err.message : 'No se pudo registrar el pago'
          showNotice(msg)
          return
        }
      }

      setPaidAppointmentIds((prev) => {
        if (prev.includes(appointment.id)) return prev
        const updated = [...prev, appointment.id]
        writePaidAppointments(updated)
        return updated
      })

      showNotice('Pago registrado correctamente.')
      try {
        const receipt = await fetchAppointmentReceipt(appointment.id)
        setReceiptData(receipt)
        setIsReceiptModalOpen(true)
      } catch (receiptErr) {
        console.warn('No se pudo cargar el recibo automáticamente', receiptErr)
      }

      if (dayPanelDate) {
        await loadDayAppointments(dayPanelDate)
      }
    },
    [canEdit, showNotice, dayPanelDate, loadDayAppointments, isCitaPaid, handleViewReceipt],
  )

  const handleCheckIn = async (appointment: RecepAgendaDayAppointment) => {
    if (!canEdit) {
      showNotice('No tienes permiso para cambiar el estado de citas.')
      return
    }
    if (!canCheckIn(appointment.status)) {
      showNotice('Solo se puede marcar la llegada en citas agendadas.')
      return
    }

    try {
      await checkInRecepAppointment(appointment.id)
      showNotice(`Se marcó la llegada de ${appointment.petName}.`)
      if (dayPanelDate) {
        await loadDayAppointments(dayPanelDate)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo marcar la llegada de la cita'
      showNotice(msg)
    }
  }

  return {
    catalog,
    form,
    isLoading,
    isSubmitting,
    error,
    notice,
    canCreate,
    canEdit,
    canDelete,
    timeSlots,
    isLoadingSlots,
    availableDaysLabel,
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
    handleMarkNoAsistio,
    handleCheckIn,
    handleRegisterPayment,
    handleViewReceipt,
    isCitaPaid,
    reloadAppointments: () => loadDayAppointments(dayPanelDate || todayIsoDate()),
    receiptData,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
  }
}
