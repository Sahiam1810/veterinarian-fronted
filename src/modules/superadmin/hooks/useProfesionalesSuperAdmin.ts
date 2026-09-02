import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  ProfesionalSuperAdmin,
  ProfesionalFormData,
  BloqueHorario,
  DiaSemana,
} from '../types'
import {
  fetchVeterinarians,
  fetchAvailabilities,
  fetchSpecialties,
  fetchUsers,
  createVeterinarian,
  updateVeterinarian,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  createFullUser,
  fetchRoles,
} from '../services'
import {
  mapVeterinarianToProfesional,
  mapAvailabilityToBloque,
  mapDiaToDayOfWeek,
} from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

export function useProfesionalesSuperAdmin() {
  const [profesionales, setProfesionales] = useState<ProfesionalSuperAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('all')
  const [selectedProfesionalId, setSelectedProfesionalId] = useState<string>('')

  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [isProfModalOpen, setIsProfModalOpen] = useState(false)
  const [editingProfesional, setEditingProfesional] = useState<ProfesionalSuperAdmin | null>(null)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BloqueHorario | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification(null)
    }, 3200)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [vets, availabilities, specialtyList, users] = await Promise.all([
        fetchVeterinarians(),
        fetchAvailabilities(),
        fetchSpecialties(),
        fetchUsers(),
      ])

      setSpecialties(specialtyList.map((s) => ({ id: s.id, name: s.name })))
      const usersById = new Map(users.map((u) => [u.id, u]))

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
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar los profesionales.'
      showToast(message)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedProfesional = useMemo(
    () => profesionales.find((p) => p.id === selectedProfesionalId) || profesionales[0],
    [profesionales, selectedProfesionalId]
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

  const handleSaveProfesional = async (data: ProfesionalFormData) => {
    const specialtyId = findSpecialtyId(data.especialidad)
    if (!specialtyId) {
      showToast('No hay especialidades configuradas en el sistema.')
      return
    }

    try {
      if (editingProfesional?.userId) {
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

        setSelectedProfesionalId(created.id)
        showToast(`Profesional "${data.name}" agregado con éxito.`)
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
    handleSaveProfesional,
    handleSaveBloque,
    handleDeleteBloque,
    handleSaveChanges,
    reload: loadData,
  }
}
