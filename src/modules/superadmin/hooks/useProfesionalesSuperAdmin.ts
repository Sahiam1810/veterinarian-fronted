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
  deleteVeterinarian,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  createFullUser,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
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

// Solo el rol Veterinario (no Auxiliar ni otros)
function isVeterinarioRoleName(name: string): boolean {
  const n = name.trim().toLowerCase()
  return n.includes('veterinar')
}

function normId(id: string): string {
  return id.trim().toLowerCase()
}

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback
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
      const results = await Promise.allSettled([
        fetchVeterinarians(),
        fetchAvailabilities(),
        fetchSpecialties(),
        fetchUsers(),
        fetchRoles(),
        fetchPets(),
        fetchClientsPets(),
        fetchClients(),
        fetchSpecies(),
        fetchRaces(),
        fetchServices(),
        fetchStatusAppointments(),
        fetchAppointments(),
      ])

      let vets = settledValue(results[0], [] as Awaited<ReturnType<typeof fetchVeterinarians>>)
      const availabilities = settledValue(results[1], [] as Awaited<ReturnType<typeof fetchAvailabilities>>)
      const specialtyList = settledValue(results[2], [] as Awaited<ReturnType<typeof fetchSpecialties>>)
      const users = settledValue(results[3], [] as Awaited<ReturnType<typeof fetchUsers>>)
      const roles = settledValue(results[4], [] as Awaited<ReturnType<typeof fetchRoles>>)
      const pets = settledValue(results[5], [] as Awaited<ReturnType<typeof fetchPets>>)
      const clientsPets = settledValue(results[6], [] as Awaited<ReturnType<typeof fetchClientsPets>>)
      const clients = settledValue(results[7], [] as Awaited<ReturnType<typeof fetchClients>>)
      const species = settledValue(results[8], [] as Awaited<ReturnType<typeof fetchSpecies>>)
      const races = settledValue(results[9], [] as Awaited<ReturnType<typeof fetchRaces>>)
      const services = settledValue(results[10], [] as Awaited<ReturnType<typeof fetchServices>>)
      const statuses = settledValue(results[11], [] as Awaited<ReturnType<typeof fetchStatusAppointments>>)
      const apiAppointments = settledValue(results[12], [] as Awaited<ReturnType<typeof fetchAppointments>>)

      if (results[0].status === 'rejected') {
        const reason = results[0].reason
        const message =
          reason instanceof ApiError
            ? reason.message
            : 'No se pudieron cargar los veterinarios.'
        showToast(message)
      }

      setSpecialties(specialtyList.map((s) => ({ id: s.id, name: s.name })))

      const usersById = new Map(users.map((u) => [normId(u.id), u]))
      const rolesById = new Map(roles.map((r) => [normId(r.id), r.name]))
      const defaultSpecialtyId = specialtyList[0]?.id || ''

      // Usuarios con rol Veterinario sin fila en VETERINARIANS → crear perfil (no reaparece si se borró el usuario)
      if (defaultSpecialtyId) {
        const vetUserIdsWithProfile = new Set(vets.map((v) => normId(v.userId)))
        const missingVetUsers = users.filter((u) => {
          const roleName = rolesById.get(normId(u.roleId)) || ''
          return isVeterinarioRoleName(roleName) && !vetUserIdsWithProfile.has(normId(u.id))
        })

        if (missingVetUsers.length > 0) {
          let createdCount = 0
          for (const u of missingVetUsers) {
            try {
              const short = u.id.replace(/-/g, '').slice(0, 8).toUpperCase()
              await createVeterinarian({
                userId: u.id,
                specialtyId: defaultSpecialtyId,
                licenseNumber: `LIC-${short}`,
              })
              createdCount += 1
            } catch {
              // Conflicto de licencia/usuario: se omite y se sigue
            }
          }
          if (createdCount > 0) {
            try {
              vets = await fetchVeterinarians()
            } catch {
              // Se mantienen los ya cargados
            }
          }
        }
      }

      const clientsById = new Map(clients.map((c) => [normId(c.id), c]))
      const petsById = new Map(pets.map((p) => [normId(p.id), p]))
      const speciesById = new Map(species.map((s) => [normId(s.id), s.name]))
      const racesById = new Map(races.map((r) => [normId(r.id), r.name]))

      const mapped = vets.map((vet) => {
        const user = usersById.get(normId(vet.userId))
        const horario = availabilities
          .filter((a) => normId(a.veterinarianId) === normId(vet.id) && a.isActive)
          .map((a) => mapAvailabilityToBloque(a, vet.specialtyName ?? undefined))
        return mapVeterinarianToProfesional(vet, user, horario)
      })

      setProfesionales(mapped)
      if (!selectedProfesionalId && mapped[0]) {
        setSelectedProfesionalId(mapped[0].id)
      } else if (
        selectedProfesionalId &&
        !mapped.some((p) => p.id === selectedProfesionalId) &&
        mapped[0]
      ) {
        setSelectedProfesionalId(mapped[0].id)
      }

      // Catálogo de mascotas / dueños para agendar
      const petOptions: AgendaPetOption[] = clientsPets
        .filter((cp) => Boolean(cp))
        .map((cp) => {
          const pet = petsById.get(normId(cp.petId))
          const client = clientsById.get(normId(cp.clientId))
          const user = client ? usersById.get(normId(client.userId)) : undefined
          const speciesName = pet ? speciesById.get(normId(pet.speciesId)) ?? 'Canino' : 'Canino'
          const raceName = pet ? racesById.get(normId(pet.raceId)) ?? 'Sin raza' : 'Sin raza'

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
      const vetsById = new Map(vets.map((v) => [normId(v.id), v]))
      const mappedCitas: CitaSuperAdmin[] = apiAppointments.map((apt) => {
        const clientPet = clientsPets.find((cp) => normId(cp.id) === normId(apt.clientPetId))
        const pet = clientPet ? petsById.get(normId(clientPet.petId)) : undefined
        const client = clientPet ? clientsById.get(normId(clientPet.clientId)) : undefined
        const ownerUser = client ? usersById.get(normId(client.userId)) : undefined
        const vet = vetsById.get(normId(apt.veterinarianId))
        const vetUser = vet ? usersById.get(normId(vet.userId)) : undefined

        return mapAppointmentToCita(apt, {
          petName: pet?.name,
          petBreed: pet ? racesById.get(normId(pet.raceId)) : undefined,
          species: pet ? speciesById.get(normId(pet.speciesId)) : undefined,
          ownerName: ownerUser?.fullName,
          professionalName: vet?.userFullName ?? vetUser?.fullName,
        })
      })
      setCitas(mappedCitas)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudieron cargar los datos de profesionales.'
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
        // Actualiza perfil veterinario (CMP / especialidad)
        await updateVeterinarian(editingProfesional.id, {
          userId: editingProfesional.userId,
          specialtyId,
          licenseNumber: data.cmp.trim(),
        })

        // Sincroniza nombre, correo y estado del usuario vinculado
        let roleId = editingProfesional.roleId
        if (!roleId) {
          const linkedUser = await fetchUsers().then((list) =>
            list.find((u) => u.id === editingProfesional.userId),
          )
          roleId = linkedUser?.roleId
        }
        if (roleId) {
          await updateUser(editingProfesional.userId, {
            fullName: data.name.trim(),
            email: data.email.trim(),
            roleId,
          })
          if (data.status === 'Activo' && editingProfesional.status !== 'Activo') {
            await activateUser(editingProfesional.userId)
          } else if (data.status === 'Inactivo' && editingProfesional.status !== 'Inactivo') {
            await deactivateUser(editingProfesional.userId)
          }
        }

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

  // Elimina veterinario y su usuario para que no reaparezca en Usuarios/Profesionales
  const handleDeleteProfesional = async (profesional: ProfesionalSuperAdmin) => {
    try {
      if (profesional.userId) {
        if (profesional.status === 'Activo') {
          await deactivateUser(profesional.userId)
        }
        // DELETE /api/Users también borra el perfil de veterinario si no hay citas
        await deleteUser(profesional.userId)
      } else {
        await deleteVeterinarian(profesional.id)
      }

      if (selectedProfesionalId === profesional.id) {
        setSelectedProfesionalId('')
      }
      showToast(`Profesional "${profesional.name}" eliminado.`)
      await loadData()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo eliminar el profesional. Puede tener citas u horarios asociados.'
      showToast(message)
      throw err
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
    handleDeleteProfesional,
    handleSaveBloque,
    handleDeleteBloque,
    handleSaveChanges,
    reload: loadData,
  }
}
