import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  ApiPetResponse,
  ApiClientPetResponse,
  ApiClientResponse,
  ApiSpeciesResponse,
  ApiRaceResponse,
  ApiAppointmentResponse,
} from '../types'
import {
  fetchPets,
  fetchClientsPets,
  fetchClients,
  fetchSpecies,
  fetchRaces,
  fetchAppointments,
} from '../services'
import { filterAuxMascotas } from '../utils/auxMascotasFilter'

export interface MascotaAuxItem {
  id: string
  petId: string
  name: string
  specie: string
  breed: string
  age: string
  gender: string
  weight: string
  ownerName: string
  ownerPhone?: string
  nextAppointment: string
  allergyAlert: string | null
  avatarUrl?: string | null
}

const ITEMS_PER_PAGE = 8

export function useAuxMascotas() {
  const [mascotas, setMascotas] = useState<MascotaAuxItem[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const showToast = useCallback((msg: string) => {
    setActiveNotification(msg)
    setTimeout(() => {
      setActiveNotification((curr) => (curr === msg ? null : curr))
    }, 3500)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        petsRes,
        speciesRes,
        racesRes,
        cpRes,
        clientsRes,
        aptsRes,
      ] = await Promise.allSettled([
        fetchPets(),
        fetchSpecies(),
        fetchRaces(),
        fetchClientsPets(),
        fetchClients(),
        fetchAppointments(),
      ])

      const fetchedPets: ApiPetResponse[] = petsRes.status === 'fulfilled' ? petsRes.value : []
      const fetchedSpecies: ApiSpeciesResponse[] = speciesRes.status === 'fulfilled' ? speciesRes.value : []
      const fetchedRaces: ApiRaceResponse[] = racesRes.status === 'fulfilled' ? racesRes.value : []
      const fetchedCP: ApiClientPetResponse[] = cpRes.status === 'fulfilled' ? cpRes.value : []
      const fetchedClients: ApiClientResponse[] = clientsRes.status === 'fulfilled' ? clientsRes.value : []
      const fetchedApts: ApiAppointmentResponse[] = aptsRes.status === 'fulfilled' ? aptsRes.value : []

      const speciesMap = new Map(fetchedSpecies.map((s) => [s.id.toLowerCase(), s.name]))
      const racesMap = new Map(fetchedRaces.map((r) => [r.id.toLowerCase(), r.name]))
      const clientsMap = new Map(fetchedClients.map((c) => [c.id.toLowerCase(), c]))

      // Relaciones mascota -> cliente (nombre + teléfono reales)
      const petOwnerMap = new Map<string, string>()
      const petOwnerPhoneMap = new Map<string, string>()
      fetchedCP.forEach((cp) => {
        const client = clientsMap.get(cp.clientId.toLowerCase())
        if (client) {
          petOwnerMap.set(cp.petId.toLowerCase(), client.fullName || `Cliente ${client.identificationNumber || ''}`.trim())
          if (client.phoneNumber) {
            petOwnerPhoneMap.set(cp.petId.toLowerCase(), client.phoneNumber)
          }
        }
      })

      // Citas próximas por clientPetId
      const cpToPetMap = new Map(fetchedCP.map((cp) => [cp.id.toLowerCase(), cp.petId.toLowerCase()]))
      const petNextAptMap = new Map<string, ApiAppointmentResponse>()
      fetchedApts.forEach((apt) => {
        const petId = cpToPetMap.get(apt.clientPetId?.toLowerCase())
        if (petId && !petNextAptMap.has(petId)) {
          petNextAptMap.set(petId, apt)
        }
      })

      const mapped: MascotaAuxItem[] = fetchedPets.map((p) => {
        const specieName = speciesMap.get(p.speciesId?.toLowerCase()) || 'Canino'
        const raceName = racesMap.get(p.raceId?.toLowerCase()) || 'Mestizo'
        const ownerName = petOwnerMap.get(p.id.toLowerCase()) || 'Dueño no identificado'
        const ownerPhone = petOwnerPhoneMap.get(p.id.toLowerCase()) || 'No disponible'
        const nextApt = petNextAptMap.get(p.id.toLowerCase())

        const genderFormatted = p.gender === 'F' ? 'Hembra' : 'Macho'

        let nextAppointmentText = 'Sin citas'

        if (nextApt) {
          const start = new Date(nextApt.scheduledStart)
          const timeStr = Number.isNaN(start.getTime())
            ? '--:--'
            : start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          nextAppointmentText = `Hoy, ${timeStr}`
        }

        return {
          id: p.id,
          petId: `#M-${p.id.slice(0, 4).toUpperCase()}`,
          name: p.name,
          specie: specieName,
          breed: raceName,
          age: `${p.age} Años`,
          gender: genderFormatted,
          weight: String(p.weight),
          ownerName,
          ownerPhone,
          nextAppointment: nextAppointmentText,
          allergyAlert: p.observations || null,
          // Sin foto real de mascota en ningún rol del sistema (photoUrl no se
          // expone en ningún formulario) -- sin avatarUrl, la UI ya cae en la
          // inicial del nombre en vez de fingir una foto de stock.
          avatarUrl: null,
        }
      })

      setMascotas(mapped)
    } catch (err) {
      console.error('Error al cargar mascotas en módulo auxiliar', err)
      showToast('Error al conectar con la base de datos de mascotas.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  // Ficha en modal: sin selección (id vacío, p.ej. al cerrar) debe significar
  // "modal cerrado", no caer de vuelta a la primera mascota de la lista.
  const selectedPet = useMemo(() => {
    if (!selectedPetId) return null
    return mascotas.find((p) => p.id === selectedPetId) || null
  }, [mascotas, selectedPetId])

  // Búsqueda y paginación: mismo patrón que useRecepMascotas.ts (S54).
  const filteredMascotas = useMemo(
    () => filterAuxMascotas(mascotas, search),
    [mascotas, search],
  )

  const totalCount = filteredMascotas.length
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  const paginatedMascotas = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMascotas.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [filteredMascotas, currentPage])

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handleOpenFilters = () =>
    showToast('Usa el buscador para filtrar rápidamente por nombre, dueño, raza o especie.')

  return {
    mascotas: paginatedMascotas,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    isLoading,
    activeNotification,
    showToast,
    loadData,
    search,
    setSearch,
    pageStart,
    pageEnd,
    totalCount,
    handlePrevPage,
    handleNextPage,
    handleOpenFilters,
  }
}
