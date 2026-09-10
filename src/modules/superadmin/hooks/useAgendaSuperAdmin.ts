import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  CitaSuperAdmin,
  CitaFormData,
  AgendaPetOption,
  AgendaServiceOption,
} from '../types'
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  fetchVeterinarians,
  fetchPets,
  fetchClientsPets,
  fetchClients,
  fetchUsers,
  fetchSpecies,
  fetchRaces,
  fetchServices,
  fetchStatusAppointments,
  fetchAvailabilitiesByVeterinarian,
  createAvailability,
} from '../services'
import { mapAppointmentToCita, buildWeekDays, formatNotesWithConsultorio } from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

// DayOfWeek .NET: 0=Domingo … 6=Sábado
function dayOfWeekFromDateKey(dateKey: string): number {
  return new Date(`${dateKey}T12:00:00`).getDay()
}

function findStatusId(
  statuses: { id: string; name: string }[],
  ...keywords: string[]
): string | undefined {
  const lower = keywords.map((k) => k.toLowerCase())
  const match = statuses.find((s) => lower.some((k) => s.name.toLowerCase().includes(k)))
  return match?.id
}

export function useAgendaSuperAdmin() {
  const [citas, setCitas] = useState<CitaSuperAdmin[]>([])
  const [selectedCitaId, setSelectedCitaId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [baseDate, setBaseDate] = useState<Date>(() => new Date())
  const weekDays = useMemo(() => buildWeekDays(baseDate), [baseDate])

  const [profesionalesOpciones, setProfesionalesOpciones] = useState<{ id: string; name: string }[]>([])
  const [serviciosOpciones, setServiciosOpciones] = useState<AgendaServiceOption[]>([])
  const [mascotasOpciones, setMascotasOpciones] = useState<AgendaPetOption[]>([])
  const [statusCatalog, setStatusCatalog] = useState<{ id: string; name: string }[]>([])

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'semana' | 'dia'>('semana')
  const [activeDayIndex, setActiveDayIndex] = useState<number>(() => {
    const day = new Date().getDay()
    return day === 0 ? 6 : day - 1
  })

  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingCita, setEditingCita] = useState<CitaSuperAdmin | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification(null)
    }, 3200)
  }, [])

  const goToPrevious = useCallback(() => {
    if (viewMode === 'dia') {
      setActiveDayIndex((prev) => {
        if (prev > 0) return prev - 1
        setBaseDate((d) => {
          const next = new Date(d)
          next.setDate(next.getDate() - 7)
          return next
        })
        return 6
      })
    } else {
      setBaseDate((d) => {
        const next = new Date(d)
        next.setDate(next.getDate() - 7)
        return next
      })
    }
  }, [viewMode])

  const goToNext = useCallback(() => {
    if (viewMode === 'dia') {
      setActiveDayIndex((prev) => {
        if (prev < 6) return prev + 1
        setBaseDate((d) => {
          const next = new Date(d)
          next.setDate(next.getDate() + 7)
          return next
        })
        return 0
      })
    } else {
      setBaseDate((d) => {
        const next = new Date(d)
        next.setDate(next.getDate() + 7)
        return next
      })
    }
  }, [viewMode])

  const goToToday = useCallback(() => {
    const now = new Date()
    setBaseDate(now)
    const day = now.getDay()
    setActiveDayIndex(day === 0 ? 6 : day - 1)
  }, [])


  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        apiAppointments,
        veterinarians,
        pets,
        clientsPets,
        clients,
        users,
        species,
        races,
        services,
        statuses,
      ] = await Promise.all([
        fetchAppointments(),
        fetchVeterinarians(),
        fetchPets(),
        fetchClientsPets(),
        fetchClients(),
        fetchUsers().catch(() => []),
        fetchSpecies(),
        fetchRaces(),
        fetchServices(),
        fetchStatusAppointments(),
      ])

      const usersById = new Map(users.map((u) => [u.id, u]))
      const clientsById = new Map(clients.map((c) => [c.id, c]))
      const petsById = new Map(pets.map((p) => [p.id, p]))
      const speciesById = new Map(species.map((s) => [s.id, s.name]))
      const racesById = new Map(races.map((r) => [r.id, r.name]))
      const vetsById = new Map(veterinarians.map((v) => [v.id, v]))

      setStatusCatalog(statuses.map((s) => ({ id: s.id, name: s.name })))

      const mapped = apiAppointments.map((apt) => {
        const clientPet = clientsPets.find((cp) => cp.id === apt.clientPetId)
        const pet = clientPet ? petsById.get(clientPet.petId) : undefined
        const client = clientPet ? clientsById.get(clientPet.clientId) : undefined
        const ownerUser = client ? usersById.get(client.userId) : undefined
        const vet = vetsById.get(apt.veterinarianId)

        return mapAppointmentToCita(apt, {
          petName: pet?.name,
          petBreed: pet ? racesById.get(pet.raceId) : undefined,
          species: pet ? speciesById.get(pet.speciesId) : undefined,
          ownerName: ownerUser?.fullName || client?.fullName || (client?.identificationNumber ? `Cliente ${client.identificationNumber}` : undefined),
          professionalName: vet?.userFullName ?? undefined,
        })
      })

      setCitas(mapped)
      setProfesionalesOpciones(
        veterinarians.map((v) => ({
          id: v.id,
          name: v.userFullName ?? 'Profesional',
        })),
      )
      setServiciosOpciones(services.map((s) => ({ id: s.id, name: s.name })))
      setMascotasOpciones(
        clientsPets.map((cp) => {
          const pet = petsById.get(cp.petId)
          const client = clientsById.get(cp.clientId)
          const owner = client ? usersById.get(client.userId) : undefined
          return {
            clientPetId: cp.id,
            petId: cp.petId,
            petName: pet?.name ?? 'Mascota',
            breed: pet ? racesById.get(pet.raceId) ?? '' : '',
            species: pet ? speciesById.get(pet.speciesId) ?? '' : '',
            ownerName: owner?.fullName || client?.fullName || (client?.identificationNumber ? `Cliente ${client.identificationNumber}` : 'Dueño'),
            clientId: cp.clientId,
            ownerPhone: client?.phoneNumber ?? undefined,
          }
        }),
      )

      setSelectedCitaId((prev) => prev ?? mapped[0]?.id ?? null)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar las citas.'
      showToast(message)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedCita = useMemo(() => {
    return citas.find((c) => c.id === selectedCitaId) || null
  }, [citas, selectedCitaId])

  const filteredCitas = useMemo(() => {
    return citas.filter((c) => {
      const matchProf =
        selectedProfessionalId === 'all' || c.professionalId === selectedProfessionalId
      return matchProf
    })
  }, [citas, selectedProfessionalId])

  // Resuelve availability del vet para el día; si no hay, crea una franja temporal
  const resolveAvailabilityId = async (
    veterinarianId: string,
    dateKey: string,
    startTime: string,
    endTime: string,
    consultingRoom?: string,
  ): Promise<string> => {
    const day = dayOfWeekFromDateKey(dateKey)
    const list = await fetchAvailabilitiesByVeterinarian(veterinarianId)
    const match = list.find((a) => {
      const dow = typeof a.dayOfWeek === 'string' ? Number(a.dayOfWeek) : a.dayOfWeek
      return a.isActive && Number(dow) === day
    })
    if (match) return match.id

    const created = await createAvailability({
      veterinarianId,
      dayOfWeek: day,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      isActive: true,
      slotDurationMinutes: 30,
      maxConcurrentAppointments: 1,
      consultingRoom: consultingRoom || null,
    })
    if (!created.id) {
      throw new Error('No se pudo crear la disponibilidad del veterinario.')
    }
    return created.id
  }

  const handleSaveCita = async (data: CitaFormData) => {
    if (!data.clientPetId) {
      const msg = 'Selecciona una mascota registrada.'
      showToast(msg)
      throw new Error(msg)
    }
    if (!data.serviceId) {
      const msg = 'Selecciona un servicio del catálogo.'
      showToast(msg)
      throw new Error(msg)
    }
    if (!data.professionalId) {
      const msg = 'Selecciona un profesional.'
      showToast(msg)
      throw new Error(msg)
    }

    const start = new Date(`${data.dateKey}T${data.startTime}:00`)
    const end = new Date(`${data.dateKey}T${data.endTime}:00`)

    try {
      if (editingCita) {
        const availabilityId =
          editingCita.availabilityId ||
          (await resolveAvailabilityId(
            data.professionalId,
            data.dateKey,
            data.startTime,
            data.endTime,
            data.consultorio,
          ))

        const formattedNotes = formatNotesWithConsultorio(data.consultorio, data.notes)

        await updateAppointment(editingCita.id, {
          clientPetId: data.clientPetId,
          veterinarianId: data.professionalId,
          serviceId: data.serviceId,
          statusId: editingCita.statusId || statusCatalog[0]?.id || '',
          availabilityId,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          notes: formattedNotes,
          consultingRoom: data.consultorio || null,
        })

        // Si cambiaron estado en el drawer y la cita está AGENDADA, usar transición canónica
        if (
          editingCita.status === 'AGENDADA' &&
          data.status !== 'AGENDADA' &&
          data.status !== 'EN_ESPERA' &&
          data.status !== 'BLOQUEO'
        ) {
          const targetId = findStatusId(statusCatalog, data.status.toLowerCase())
          if (targetId) {
            const needsComment = data.status === 'CANCELADA' || data.status === 'NO_ASISTIO'
            await updateAppointmentStatus(editingCita.id, {
              statusId: targetId,
              comment: needsComment ? data.notes || 'Actualizado desde agenda SuperAdmin' : null,
            })
          }
        }

        showToast(`Cita de ${data.petName} actualizada.`)
      } else {
        const agendadaId = findStatusId(statusCatalog, 'agendada')
        if (!agendadaId) {
          const msg = 'No hay estado AGENDADA en el catálogo. Ejecuta el seed de estados.'
          showToast(msg)
          throw new Error(msg)
        }

        const availabilityId = await resolveAvailabilityId(
          data.professionalId,
          data.dateKey,
          data.startTime,
          data.endTime,
          data.consultorio,
        )

        const formattedNotes = formatNotesWithConsultorio(data.consultorio, data.notes)
        const ownerPhone =
          mascotasOpciones.find((m) => m.clientPetId === data.clientPetId)?.ownerPhone?.trim() || ''

        if (ownerPhone.replace(/\D/g, '').length < 7) {
          const msg =
            'El dueño de la mascota no tiene un teléfono válido. Actualízalo en Dueños/Mascotas.'
          showToast(msg)
          throw new Error(msg)
        }

        const created = await createAppointment({
          clientPetId: data.clientPetId,
          veterinarianId: data.professionalId,
          serviceId: data.serviceId,
          statusId: agendadaId,
          availabilityId,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          notes: formattedNotes,
          requesterPhoneNumber: ownerPhone,
          consultingRoom: data.consultorio || null,
        })

        setSelectedCitaId(created.id)
        showToast(`Cita de ${data.petName} creada correctamente.`)
      }

      setIsDrawerOpen(false)
      setEditingCita(null)
      await loadData()
    } catch (err) {
      // Validaciones locales ya hicieron toast; API sí necesita uno.
      if (err instanceof ApiError) {
        showToast(err.message)
      } else if (!(err instanceof Error)) {
        showToast('No se pudo guardar la cita.')
      }
      throw err
    }
  }

  const handleCancelCita = async (id: string) => {
    const target = citas.find((c) => c.id === id)
    if (!target) return
    if (!window.confirm('¿Cancelar esta cita? Quedará como CANCELADA en el sistema.')) return

    const cancelId = findStatusId(statusCatalog, 'cancelada')
    if (!cancelId) {
      showToast('No hay estado CANCELADA en el catálogo.')
      return
    }

    try {
      if (target.status === 'AGENDADA') {
        await updateAppointmentStatus(id, {
          statusId: cancelId,
          comment: 'Cancelada desde agenda SuperAdmin',
        })
      } else {
        showToast('Solo se pueden cancelar citas en estado AGENDADA.')
        return
      }
      setSelectedCitaId(null)
      showToast('Cita cancelada.')
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo cancelar la cita.'
      showToast(message)
    }
  }

  // Backend no tiene EN_ESPERA: "Iniciar atención" = marcar ATENDIDA
  const handleStartAttention = async (id: string) => {
    const target = citas.find((c) => c.id === id)
    if (!target) return

    const attendedId = findStatusId(statusCatalog, 'atendida')
    if (!attendedId) {
      showToast('No hay estado ATENDIDA en el catálogo.')
      return
    }

    if (target.status !== 'AGENDADA') {
      showToast('Solo se puede atender una cita AGENDADA.')
      return
    }

    try {
      await updateAppointmentStatus(id, {
        statusId: attendedId,
        comment: null,
      })
      showToast('Cita marcada como ATENDIDA.')
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.'
      showToast(message)
    }
  }

  return {
    citas,
    isLoading,
    baseDate,
    setBaseDate,
    weekDays,
    goToPrevious,
    goToNext,
    goToToday,
    selectedCitaId,
    setSelectedCitaId,
    selectedCita,
    filteredCitas,
    profesionalesOpciones,
    serviciosOpciones,
    mascotasOpciones,
    selectedProfessionalId,
    setSelectedProfessionalId,
    viewMode,
    setViewMode,
    activeDayIndex,
    setActiveDayIndex,
    activeNotification,
    showToast,
    isDrawerOpen,
    setIsDrawerOpen,
    editingCita,
    setEditingCita,
    handleSaveCita,
    handleCancelCita,
    handleStartAttention,
    reload: loadData,
  }
}

