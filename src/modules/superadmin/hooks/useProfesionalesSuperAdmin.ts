import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  ProfesionalSuperAdmin,
  ProfesionalFormData,
  BloqueHorario,
  DiaSemana,
  CitaSuperAdmin,
  CitaFormData,
  AgendaPetOption,
  AgendaServiceOption,
} from '../types'
import {
  fetchVeterinarians,
  fetchAvailabilities,
  fetchSpecialties,
  fetchUsers,
  fetchPets,
  fetchClientsPets,
  fetchClients,
  fetchSpecies,
  fetchRaces,
  fetchServices,
  fetchStatusAppointments,
  fetchAppointments,
  createAppointment,
  createVeterinarian,
  updateVeterinarian,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  createFullUser,
  fetchRoles,
  fetchAvailabilitiesByVeterinarian,
} from '../services'
import {
  mapVeterinarianToProfesional,
  mapAvailabilityToBloque,
  mapDiaToDayOfWeek,
  mapAppointmentToCita,
  formatNotesWithConsultorio,
} from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

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

export function useProfesionalesSuperAdmin() {
  const [profesionales, setProfesionales] = useState<ProfesionalSuperAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([])

  // Opciones para creación de citas (conectar con Agenda)
  const [mascotasOpciones, setMascotasOpciones] = useState<AgendaPetOption[]>([])
  const [serviciosOpciones, setServiciosOpciones] = useState<AgendaServiceOption[]>([])
  const [statusCatalog, setStatusCatalog] = useState<{ id: string; name: string }[]>([])
  const [citas, setCitas] = useState<CitaSuperAdmin[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('all')
  const [selectedProfesionalId, setSelectedProfesionalId] = useState<string>('')

  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [isProfModalOpen, setIsProfModalOpen] = useState(false)
  const [editingProfesional, setEditingProfesional] = useState<ProfesionalSuperAdmin | null>(null)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BloqueHorario | null>(null)

  // Drawer de Crear Nueva Cita
  const [isCitaDrawerOpen, setIsCitaDrawerOpen] = useState(false)

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
        vets,
        availabilities,
        specialtyList,
        users,
        pets,
        clientsPets,
        clients,
        species,
        races,
        services,
        statuses,
        apiAppointments,
        roles,
      ] = await Promise.all([
        fetchVeterinarians(),
        fetchAvailabilities(),
        fetchSpecialties(),
        fetchUsers(),
        fetchPets(),
        fetchClientsPets(),
        fetchClients(),
        fetchSpecies(),
        fetchRaces(),
        fetchServices(),
        fetchStatusAppointments(),
        fetchAppointments(),
        fetchRoles(),
      ])

      const defaultSpecialtyId = specialtyList[0]?.id || ''
      const defaultSpecialtyName = specialtyList[0]?.name || 'Medicina General'

      // Auto-sincronizar usuarios creados con rol Veterinario que aún no tengan registro en Veterinarians
      const vetRoles = roles.filter((r) => {
        const n = r.name.toLowerCase()
        return (
          n.includes('vet') ||
          n.includes('veterin') ||
          n.includes('profesional') ||
          n.includes('médico') ||
          n.includes('medico')
        )
      })
      const vetRoleIds = new Set(vetRoles.map((r) => r.id.toLowerCase()))
      const existingVetUserIds = new Set(vets.map((v) => v.userId.toLowerCase()))
      const unlinkedVetUsers = users.filter(
        (u) => u.roleId && vetRoleIds.has(u.roleId.toLowerCase()) && !existingVetUserIds.has(u.id.toLowerCase()),
      )

      if (unlinkedVetUsers.length > 0 && defaultSpecialtyId) {
        for (const u of unlinkedVetUsers) {
          try {
            const createdVet = await createVeterinarian({
              userId: u.id,
              specialtyId: defaultSpecialtyId,
              licenseNumber: 'CMP-PENDIENTE',
            })
            vets.push({
              id: createdVet.id,
              userId: u.id,
              userFullName: u.fullName,
              specialtyId: defaultSpecialtyId,
              specialtyName: defaultSpecialtyName,
              licenseNumber: 'CMP-PENDIENTE',
              createdAt: new Date().toISOString(),
            })
          } catch (err) {
            console.error('Error auto-sincronizando perfil de veterinario:', err)
          }
        }
      }

      setSpecialties(specialtyList.map((s) => ({ id: s.id, name: s.name })))
      const usersById = new Map(users.map((u) => [u.id, u]))
      const clientsById = new Map(clients.map((c) => [c.id, c]))
      const petsById = new Map(pets.map((p) => [p.id, p]))
      const speciesById = new Map(species.map((s) => [s.id, s.name]))
      const racesById = new Map(races.map((r) => [r.id, r.name]))

      const mapped = vets.map((vet) => {
        const user = usersById.get(vet.userId)
        const horario = availabilities
          .filter((a) => a.veterinarianId === vet.id && a.isActive)
          .map((a) => mapAvailabilityToBloque(a, vet.specialtyName ?? undefined))
        return mapVeterinarianToProfesional(vet, user, horario)
      })

      setProfesionales(mapped)
      if (!selectedProfesionalId && mapped[0]) {
        setSelectedProfesionalId(mapped[0].id)
      } else if (selectedProfesionalId && !mapped.some((p) => p.id === selectedProfesionalId) && mapped[0]) {
        setSelectedProfesionalId(mapped[0].id)
      }

      // Catálogo de mascotas / dueños para agendar
      const petOptions: AgendaPetOption[] = clientsPets
        .filter((cp) => cp.isActive)
        .map((cp) => {
          const pet = petsById.get(cp.petId)
          const client = clientsById.get(cp.clientId)
          const user = client ? usersById.get(client.userId) : undefined
          const speciesName = pet ? speciesById.get(pet.speciesId) ?? 'Canino' : 'Canino'
          const raceName = pet ? racesById.get(pet.raceId) ?? 'Sin raza' : 'Sin raza'

          return {
            clientPetId: cp.id,
            petId: cp.petId,
            petName: pet?.name ?? 'Mascota',
            breed: raceName,
            species: speciesName,
            ownerName: user?.fullName ?? 'Dueño',
            clientId: cp.clientId,
          }
        })
      setMascotasOpciones(petOptions)

      // Catálogo de servicios
      const activeServices = services
        .filter((s) => s.isActive)
        .map((s) => ({ id: s.id, name: s.name }))
      setServiciosOpciones(activeServices)

      // Catálogo de estados
      setStatusCatalog(statuses.map((s) => ({ id: s.id, name: s.name })))

      // Mapeo de citas existentes para sincronización y detección de colisiones
      const vetsById = new Map(vets.map((v) => [v.id, v]))
      const mappedCitas: CitaSuperAdmin[] = apiAppointments.map((apt) => {
        const clientPet = clientsPets.find((cp) => cp.id === apt.clientPetId)
        const pet = clientPet ? petsById.get(clientPet.petId) : undefined
        const client = clientPet ? clientsById.get(clientPet.clientId) : undefined
        const ownerUser = client ? usersById.get(client.userId) : undefined
        const vet = vetsById.get(apt.veterinarianId)
        const vetUser = vet ? usersById.get(vet.userId) : undefined

        return mapAppointmentToCita(apt, {
          petName: pet?.name,
          petBreed: pet ? racesById.get(pet.raceId) : undefined,
          species: pet ? speciesById.get(pet.speciesId) : undefined,
          ownerName: ownerUser?.fullName,
          professionalName: vet?.userFullName ?? vetUser?.fullName,
        })
      })
      setCitas(mappedCitas)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar los datos de profesionales.'
      showToast(message)
    } finally {
      setIsLoading(false)
    }
  }, [selectedProfesionalId, showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedProfesional = useMemo(
    () => profesionales.find((p) => p.id === selectedProfesionalId) || profesionales[0],
    [profesionales, selectedProfesionalId]
  )

  const profesionalesOpciones = useMemo(
    () => profesionales.map((p) => ({ id: p.id, name: p.name })),
    [profesionales]
  )

  const filteredProfesionales = useMemo(() => {
    return profesionales.filter((prof) => {
      const matchSearch =
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.cmp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchEsp =
        selectedEspecialidad === 'all' ||
        prof.especialidad.toLowerCase() === selectedEspecialidad.toLowerCase()

      return matchSearch && matchEsp
    })
  }, [profesionales, searchQuery, selectedEspecialidad])

  const findSpecialtyId = (name: string): string => {
    const match = specialties.find((s) => s.name.toLowerCase() === name.toLowerCase())
    return match?.id ?? specialties[0]?.id ?? ''
  }

  const resolveAvailabilityId = async (
    vetId: string,
    dateKey: string,
    startTime: string,
    endTime: string,
  ): Promise<string> => {
    try {
      const availabilities = await fetchAvailabilitiesByVeterinarian(vetId)
      const dayOfWeek = dayOfWeekFromDateKey(dateKey)
      const matching = availabilities.find(
        (a) => a.dayOfWeek === dayOfWeek && a.isActive,
      )
      if (matching) return matching.id
      const created = await createAvailability({
        veterinarianId: vetId,
        dayOfWeek: String(dayOfWeek),
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        isActive: true,
      })
      return created.id
    } catch {
      return ''
    }
  }

  const handleCreateCita = async (data: CitaFormData) => {
    if (!data.clientPetId) {
      showToast('Selecciona una mascota del catálogo.')
      return
    }
    if (!data.serviceId) {
      showToast('Selecciona un servicio del catálogo.')
      return
    }
    if (!data.professionalId) {
      showToast('Selecciona un profesional.')
      return
    }

    const agendadaId = findStatusId(statusCatalog, 'agendada')
    if (!agendadaId) {
      showToast('No hay estado AGENDADA en el catálogo de citas.')
      return
    }

    const start = new Date(`${data.dateKey}T${data.startTime}:00`)
    const end = new Date(`${data.dateKey}T${data.endTime}:00`)

    try {
      const availabilityId = await resolveAvailabilityId(
        data.professionalId,
        data.dateKey,
        data.startTime,
        data.endTime,
      )

      const formattedNotes = formatNotesWithConsultorio(data.consultorio, data.notes)

      await createAppointment({
        clientPetId: data.clientPetId,
        veterinarianId: data.professionalId,
        serviceId: data.serviceId,
        statusId: agendadaId,
        availabilityId,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        notes: formattedNotes,
      })

      showToast(`¡Cita para ${data.petName} agendada en ${data.consultorio} exitosamente!`)
      setIsCitaDrawerOpen(false)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo agendar la cita.'
      showToast(message)
    }
  }

  const handleSaveProfesional = async (data: ProfesionalFormData) => {
    const specialtyId = findSpecialtyId(data.especialidad)
    if (!specialtyId) {
      showToast('No hay especialidades configuradas en el sistema.')
      return
    }

    try {
      let targetVetId = ''

      if (editingProfesional?.userId) {
        targetVetId = editingProfesional.id
        await updateVeterinarian(editingProfesional.id, {
          userId: editingProfesional.userId,
          specialtyId,
          licenseNumber: data.cmp,
        })
        showToast(`Profesional "${data.name}" actualizado correctamente.`)
      } else {
        const roles = await fetchRoles()
        const vetRole = roles.find((r) => {
          const n = r.name.toLowerCase()
          return n.includes('vet') || n.includes('veterin')
        })
        if (!vetRole) {
          showToast('No se encontró el rol de veterinario.')
          return
        }

        const tempPassword = `Tmp${Date.now().toString(36)}!`
        const { userId } = await createFullUser({
          fullName: data.name.trim(),
          email: data.email.trim(),
          password: tempPassword,
          roleId: vetRole.id,
        })

        const created = await createVeterinarian({
          userId,
          specialtyId,
          licenseNumber: data.cmp.trim(),
        })

        targetVetId = created.id
        setSelectedProfesionalId(created.id)
        showToast(`Profesional "${data.name}" agregado con éxito.`)
      }

      // Sincronizar Horario configurado
      if (data.horarioConfig?.enabled && targetVetId) {
        const { dias, horaInicio, horaFin } = data.horarioConfig
        const existingAvailabilities = await fetchAvailabilitiesByVeterinarian(targetVetId)

        for (const dia of dias) {
          const dayNum = Number(mapDiaToDayOfWeek(dia))
          const existing = existingAvailabilities.find((a) => {
            const dow = typeof a.dayOfWeek === 'string' ? Number(a.dayOfWeek) : a.dayOfWeek
            return Number(dow) === dayNum
          })

          if (existing) {
            await updateAvailability(existing.id, {
              veterinarianId: targetVetId,
              dayOfWeek: dayNum,
              startTime: `${horaInicio}:00`,
              endTime: `${horaFin}:00`,
              isActive: true,
            })
          } else {
            await createAvailability({
              veterinarianId: targetVetId,
              dayOfWeek: dayNum,
              startTime: `${horaInicio}:00`,
              endTime: `${horaFin}:00`,
              isActive: true,
            })
          }
        }

        // Eliminar disponibilidades de días que fueron deseleccionados
        const selectedDayNums = new Set(dias.map((d) => Number(mapDiaToDayOfWeek(d))))
        for (const existing of existingAvailabilities) {
          const dow = typeof existing.dayOfWeek === 'string' ? Number(existing.dayOfWeek) : existing.dayOfWeek
          if (!selectedDayNums.has(Number(dow))) {
            try {
              await deleteAvailability(existing.id)
            } catch {
              // ignore
            }
          }
        }
      }

      setIsProfModalOpen(false)
      setEditingProfesional(null)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar el profesional.'
      showToast(message)
    }
  }

  const handleSaveBloque = async (
    dia: DiaSemana,
    horaInicio: string,
    horaFin: string,
    _tipoAtencion: string
  ) => {
    if (!selectedProfesional) return

    try {
      const payload = {
        veterinarianId: selectedProfesional.id,
        dayOfWeek: mapDiaToDayOfWeek(dia),
        startTime: `${horaInicio}:00`,
        endTime: `${horaFin}:00`,
        isActive: true,
      }

      if (editingBlock) {
        await updateAvailability(editingBlock.id, payload)
        showToast('Bloque de horario actualizado.')
      } else {
        await createAvailability(payload)
        showToast(`Turno agregado para el ${dia}.`)
      }

      setIsBlockModalOpen(false)
      setEditingBlock(null)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar el bloque horario.'
      showToast(message)
    }
  }

  const handleDeleteBloque = async (blockId: string) => {
    if (!selectedProfesional) return
    try {
      await deleteAvailability(blockId)
      showToast('Bloque de horario eliminado.')
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar el bloque.'
      showToast(message)
    }
  }

  const handleSaveChanges = () => {
    if (!selectedProfesional) return
    showToast(`Horario sincronizado para ${selectedProfesional.name}.`)
  }

  return {
    profesionales,
    isLoading,
    specialties,
    searchQuery,
    setSearchQuery,
    selectedEspecialidad,
    setSelectedEspecialidad,
    selectedProfesionalId,
    setSelectedProfesionalId,
    selectedProfesional,
    profesionalesOpciones,
    mascotasOpciones,
    serviciosOpciones,
    citas,
    filteredProfesionales,
    activeNotification,
    showToast,
    isProfModalOpen,
    setIsProfModalOpen,
    editingProfesional,
    setEditingProfesional,
    isBlockModalOpen,
    setIsBlockModalOpen,
    editingBlock,
    setEditingBlock,
    isCitaDrawerOpen,
    setIsCitaDrawerOpen,
    handleCreateCita,
    handleSaveProfesional,
    handleSaveBloque,
    handleDeleteBloque,
    handleSaveChanges,
    reload: loadData,
  }
}
