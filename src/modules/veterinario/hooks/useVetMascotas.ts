import { useEffect, useMemo, useState, useCallback } from 'react'
import type {
  HistoriaClinicaPayload,
  MascotaDetail,
  MascotasDirectoryPayload,
} from '../types'
import {
  fetchHistoriaClinica,
  fetchVetMascotasDirectory,
} from '../services'
import { vetApiFetch } from '../api/vetHttp'
import type { ApiAppointment, ApiClientPet } from '../api/apiTypes'
import type { AvailableAppointmentOption } from '../components'

const PAGE_SIZE = 8

export interface MascotasRegistrarTarget {
  petId: string
  petName: string
  speciesBreed?: string
  clientPetId: string
  appointmentId: string
  serviceName?: string
  scheduledStart?: string
  availableAppointments?: AvailableAppointmentOption[]
}

export function useVetMascotas(enabled: boolean) {
  const [directory, setDirectory] = useState<MascotasDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [historia, setHistoria] = useState<HistoriaClinicaPayload | null>(null)
  const [isHistoriaOpen, setIsHistoriaOpen] = useState(false)
  const [isHistoriaLoading, setIsHistoriaLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Modal registrar atención
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false)
  const [registrarTarget, setRegistrarTarget] = useState<MascotasRegistrarTarget | null>(null)

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }, [])

  const loadDirectory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchVetMascotasDirectory()
      setDirectory(data)
      setPage(1)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo cargar el directorio de mascotas'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void loadDirectory()
  }, [enabled, loadDirectory])

  useEffect(() => {
    if (!enabled) {
      setSelectedId(null)
      setIsHistoriaOpen(false)
      setHistoria(null)
      setIsRegistrarOpen(false)
      setRegistrarTarget(null)
    }
  }, [enabled])

  const filteredItems = useMemo(() => {
    if (!directory) return []
    const query = search.trim().toLowerCase()

    return directory.items.filter((pet) => {
      const matchesSpecies = !speciesFilter || pet.species === speciesFilter
      const matchesQuery =
        !query ||
        pet.name.toLowerCase().includes(query) ||
        pet.ownerName.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query)
      return matchesSpecies && matchesQuery
    })
  }, [directory, search, speciesFilter])

  useEffect(() => {
    setPage(1)
  }, [search, speciesFilter])

  const totalFiltered = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStartIndex = (safePage - 1) * PAGE_SIZE
  const pagedItems = filteredItems.slice(pageStartIndex, pageStartIndex + PAGE_SIZE)
  const pageStart = totalFiltered === 0 ? 0 : pageStartIndex + 1
  const pageEnd = Math.min(pageStartIndex + PAGE_SIZE, totalFiltered)

  const selectedDetail: MascotaDetail | null =
    directory && selectedId ? directory.detailsById[selectedId] ?? null : null

  const handleSelect = (petId: string) => {
    setSelectedId(petId)
  }

  const handleCloseDetail = () => {
    setSelectedId(null)
  }

  const handleOpenFilters = () => {
    showNotice('Usa la búsqueda y el filtro de especie de la barra superior')
  }

  const handleViewClinicalHistory = async (targetPetId?: string) => {
    const petId = targetPetId || selectedId
    const detail = targetPetId && directory ? directory.detailsById[targetPetId] : selectedDetail
    if (!petId) return

    setIsHistoriaLoading(true)
    try {
      const data = await fetchHistoriaClinica(petId, detail)
      if (!data) {
        showNotice('No hay historia clínica para esta mascota')
        return
      }
      setHistoria(data)
      setIsHistoriaOpen(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar la historia clínica'
      showNotice(msg)
    } finally {
      setIsHistoriaLoading(false)
    }
  }

  const handleCloseHistoria = () => {
    setIsHistoriaOpen(false)
  }

  const handleOpenRegistrar = async (targetPetId?: string) => {
    const petId = targetPetId || selectedId || historia?.petId
    const detail = petId && directory ? directory.detailsById[petId] : selectedDetail
    if (!petId) {
      showNotice('Selecciona una mascota primero.')
      return
    }

    try {
      // Buscar el clientPetId y citas asociadas a este paciente
      const [clientPets, allAppointments] = await Promise.all([
        vetApiFetch<ApiClientPet[]>('/api/clientspets').catch(() => []),
        vetApiFetch<ApiAppointment[]>('/api/appointments').catch(() => []),
      ])

      const matchedClientPets = clientPets.filter(
        (cp) => cp.petId.toLowerCase() === petId.toLowerCase(),
      )

      if (matchedClientPets.length === 0) {
        showNotice('No se encontró el registro de propiedad de la mascota.')
        return
      }

      const clientPetId = matchedClientPets[0].id
      const clientPetIds = new Set(matchedClientPets.map((cp) => cp.id.toLowerCase()))

      const petAppointments = allAppointments.filter((apt) =>
        clientPetIds.has(apt.clientPetId.toLowerCase()),
      )

      if (petAppointments.length === 0) {
        showNotice(
          'Esta mascota no tiene citas registradas. Se requiere una cita para asociar la atención.',
        )
        return
      }

      // Ordenar citas por fecha descendente
      const sortedAppointments = [...petAppointments].sort(
        (a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime(),
      )

      const activeAppointment = sortedAppointments[0]

      setRegistrarTarget({
        petId,
        petName: detail?.name || historia?.displayName || 'Mascota',
        speciesBreed: detail ? `${detail.species} / ${detail.breed}` : historia?.breed,
        clientPetId: activeAppointment.clientPetId || clientPetId,
        appointmentId: activeAppointment.id,
        serviceName: activeAppointment.serviceName || undefined,
        scheduledStart: activeAppointment.scheduledStart,
        availableAppointments: sortedAppointments.map((apt) => ({
          id: apt.id,
          serviceName: apt.serviceName,
          scheduledStart: apt.scheduledStart,
          statusName: apt.statusName,
        })),
      })

      setIsRegistrarOpen(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al preparar el registro de atención'
      showNotice(msg)
    }
  }

  const handleCloseRegistrar = () => {
    setIsRegistrarOpen(false)
    setRegistrarTarget(null)
  }

  const handleRegistrationSuccess = async (result: {
    recordId: string
    petId: string
    appointmentId: string
  }) => {
    setIsRegistrarOpen(false)
    setRegistrarTarget(null)
    showNotice('¡Consulta médica registrada con éxito!')

    // Recargar historia clínica inmediatamente y mostrar el nuevo registro
    if (result.petId) {
      const detail = directory?.detailsById[result.petId] || selectedDetail
      try {
        const data = await fetchHistoriaClinica(result.petId, detail)
        if (data) {
          setHistoria(data)
          setIsHistoriaOpen(true)
        }
      } catch {
        // Silently ignore if auto-refresh fails
      }
    }
  }

  const handlePrevPage = () => {
    setPage((current) => Math.max(1, current - 1))
  }

  const handleNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1))
  }

  return {
    directory,
    filteredItems: pagedItems,
    selectedDetail,
    search,
    setSearch,
    speciesFilter,
    setSpeciesFilter,
    pageStart,
    pageEnd,
    totalCount: totalFiltered,
    isLoading,
    error,
    notice,
    historia,
    isHistoriaOpen,
    isHistoriaLoading,
    isRegistrarOpen,
    registrarTarget,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleViewClinicalHistory,
    handleCloseHistoria,
    handleOpenRegistrar,
    handleCloseRegistrar,
    handleRegistrationSuccess,
    handlePrevPage,
    handleNextPage,
  }
}

