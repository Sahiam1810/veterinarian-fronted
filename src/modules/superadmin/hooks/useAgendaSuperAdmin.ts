import { useState, useMemo, useEffect, useCallback } from 'react'
import type { CitaSuperAdmin, CitaFormData } from '../types'
import {
  fetchAppointments,
  fetchVeterinarians,
  fetchPets,
  fetchClientsPets,
  fetchClients,
  fetchUsers,
  fetchSpecies,
  fetchRaces,
  fetchServices,
  fetchStatusAppointments,
  deleteAppointment,
  updateAppointment,
} from '../services'
import {
  mapAppointmentToCita,
  buildCurrentWeekDays,
  mapSpeciesNameToEspecie,
} from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

export function useAgendaSuperAdmin() {
  const [citas, setCitas] = useState<CitaSuperAdmin[]>([])
  const [selectedCitaId, setSelectedCitaId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [weekDays] = useState(() => buildCurrentWeekDays())

  const [profesionalesOpciones, setProfesionalesOpciones] = useState<{ id: string; name: string }[]>([])
  const [serviciosOpciones, setServiciosOpciones] = useState<string[]>([])

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'semana' | 'dia'>('semana')
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0)

  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingCita, setEditingCita] = useState<CitaSuperAdmin | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification(null)
    }, 3200)
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
      ] = await Promise.all([
        fetchAppointments(),
        fetchVeterinarians(),
        fetchPets(),
        fetchClientsPets(),
        fetchClients(),
        fetchUsers(),
        fetchSpecies(),
        fetchRaces(),
        fetchServices(),
      ])

      const usersById = new Map(users.map((u) => [u.id, u]))
      const clientsById = new Map(clients.map((c) => [c.id, c]))
      const petsById = new Map(pets.map((p) => [p.id, p]))
      const speciesById = new Map(species.map((s) => [s.id, s.name]))
      const racesById = new Map(races.map((r) => [r.id, r.name]))
      const vetsById = new Map(veterinarians.map((v) => [v.id, v]))

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
          ownerName: ownerUser?.fullName,
          professionalName: vet?.userFullName ?? undefined,
        })
      })

      setCitas(mapped)
      setProfesionalesOpciones(
        veterinarians.map((v) => ({
          id: v.id,
          name: v.userFullName ?? 'Profesional',
        }))
      )
      setServiciosOpciones(services.map((s) => s.name))

      if (!selectedCitaId && mapped[0]) {
        setSelectedCitaId(mapped[0].id)
      }
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

  const handleSaveCita = async (data: CitaFormData) => {
    const profName =
      profesionalesOpciones.find((p) => p.id === data.professionalId)?.name || 'Médico'

    if (editingCita?.clientPetId && editingCita.serviceId && editingCita.statusId && editingCita.availabilityId) {
      try {
        const start = new Date(`${data.dateKey}T${data.startTime}:00`)
        const end = new Date(`${data.dateKey}T${data.endTime}:00`)

        await updateAppointment(editingCita.id, {
          clientPetId: editingCita.clientPetId,
          veterinarianId: data.professionalId,
          serviceId: editingCita.serviceId,
          statusId: editingCita.statusId,
          availabilityId: editingCita.availabilityId,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          notes: data.notes || null,
        })

        showToast(`Cita de ${data.petName} actualizada correctamente.`)
        setIsDrawerOpen(false)
        setEditingCita(null)
        await loadData()
        return
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'No se pudo actualizar la cita.'
        showToast(message)
        return
      }
    }

    // Creación local temporal si la API no tiene todos los IDs del formulario
    const newCita: CitaSuperAdmin = {
      id: `cita-${Date.now()}`,
      ...data,
      professionalName: profName,
      species: mapSpeciesNameToEspecie(data.species),
    }
    setCitas((prev) => [newCita, ...prev])
    setSelectedCitaId(newCita.id)
    showToast('Cita registrada en vista. Para persistir en API vincula una mascota existente.')
    setIsDrawerOpen(false)
    setEditingCita(null)
  }

  const handleCancelCita = async (id: string) => {
    const target = citas.find((c) => c.id === id)
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) return

    if (target?.clientPetId) {
      try {
        await deleteAppointment(id)
        setSelectedCitaId(null)
        showToast('Cita cancelada correctamente.')
        await loadData()
        return
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'No se pudo cancelar la cita.'
        showToast(message)
        return
      }
    }

    setCitas((prev) => prev.filter((c) => c.id !== id))
    setSelectedCitaId(null)
    showToast('Cita eliminada de la vista.')
  }

  const handleStartAttention = async (id: string) => {
    const target = citas.find((c) => c.id === id)
    if (!target?.clientPetId || !target.serviceId || !target.statusId || !target.availabilityId) {
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'EN_ESPERA' } : c))
      )
      showToast('Atención iniciada (solo vista).')
      return
    }

    try {
      const statuses = await fetchStatusAppointments()
      const waitingStatus = statuses.find((s) => s.name.toLowerCase().includes('espera'))
        ?? statuses.find((s) => s.name.toLowerCase().includes('sala'))
        ?? statuses[0]

      if (!waitingStatus) {
        showToast('No hay estados de cita configurados.')
        return
      }

      const start = new Date(`${target.dateKey}T${target.startTime}:00`)
      const end = new Date(`${target.dateKey}T${target.endTime}:00`)

      await updateAppointment(id, {
        clientPetId: target.clientPetId,
        veterinarianId: target.professionalId ?? '',
        serviceId: target.serviceId,
        statusId: waitingStatus.id,
        availabilityId: target.availabilityId,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        notes: target.notes ?? null,
      })

      showToast('Cita marcada en espera.')
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.'
      showToast(message)
    }
  }

  return {
    citas,
    isLoading,
    weekDays,
    selectedCitaId,
    setSelectedCitaId,
    selectedCita,
    filteredCitas,
    profesionalesOpciones,
    serviciosOpciones,
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
