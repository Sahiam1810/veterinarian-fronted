import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  ApiPetResponse,
  ApiClientPetResponse,
  ApiClientResponse,
  ApiSpeciesResponse,
  ApiRaceResponse,
  ApiAppointmentResponse,
  ApiVeterinarianResponse,
} from '../types'
import {
  fetchPets,
  fetchClientsPets,
  fetchClients,
  fetchSpecies,
  fetchRaces,
  fetchAppointments,
  fetchVeterinarians,
} from '../services'

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
  sterilized: 'Sí' | 'No'
  avatarUrl?: string | null
  citaActual?: {
    service: string
    time: string
    vetName: string
  } | null
}

export function useAuxMascotas() {
  const [mascotas, setMascotas] = useState<MascotaAuxItem[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

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
        vetsRes,
      ] = await Promise.allSettled([
        fetchPets(),
        fetchSpecies(),
        fetchRaces(),
        fetchClientsPets(),
        fetchClients(),
        fetchAppointments(),
        fetchVeterinarians(),
      ])

      const fetchedPets: ApiPetResponse[] = petsRes.status === 'fulfilled' ? petsRes.value : []
      const fetchedSpecies: ApiSpeciesResponse[] = speciesRes.status === 'fulfilled' ? speciesRes.value : []
      const fetchedRaces: ApiRaceResponse[] = racesRes.status === 'fulfilled' ? racesRes.value : []
      const fetchedCP: ApiClientPetResponse[] = cpRes.status === 'fulfilled' ? cpRes.value : []
      const fetchedClients: ApiClientResponse[] = clientsRes.status === 'fulfilled' ? clientsRes.value : []
      const fetchedApts: ApiAppointmentResponse[] = aptsRes.status === 'fulfilled' ? aptsRes.value : []
      const fetchedVets: ApiVeterinarianResponse[] = vetsRes.status === 'fulfilled' ? vetsRes.value : []

      const speciesMap = new Map(fetchedSpecies.map((s) => [s.id.toLowerCase(), s.name]))
      const racesMap = new Map(fetchedRaces.map((r) => [r.id.toLowerCase(), r.name]))
      const clientsMap = new Map(fetchedClients.map((c) => [c.id.toLowerCase(), c]))
      const vetsMap = new Map(fetchedVets.map((v) => [v.id.toLowerCase(), v.userFullName || 'Veterinario']))

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
        let citaActualObj: MascotaAuxItem['citaActual'] = null

        if (nextApt) {
          const start = new Date(nextApt.scheduledStart)
          const timeStr = Number.isNaN(start.getTime())
            ? '--:--'
            : start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          nextAppointmentText = `Hoy, ${timeStr}`
          citaActualObj = {
            service: nextApt.serviceName || 'Control General',
            time: nextAppointmentText,
            vetName: vetsMap.get(nextApt.veterinarianId?.toLowerCase()) || 'Veterinario',
          }
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
          sterilized: p.observations?.toLowerCase().includes('esteril') ? 'Sí' : 'No',
          // Sin foto real de mascota en ningún rol del sistema (photoUrl no se
          // expone en ningún formulario) -- sin avatarUrl, la UI ya cae en la
          // inicial del nombre en vez de fingir una foto de stock.
          avatarUrl: null,
          citaActual: citaActualObj,
        }
      })

      setMascotas(mapped)
      if (mapped.length > 0 && !selectedPetId) {
        setSelectedPetId(mapped[0].id)
      }
    } catch (err) {
      console.error('Error al cargar mascotas en módulo auxiliar', err)
      showToast('Error al conectar con la base de datos de mascotas.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast, selectedPetId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedPet = useMemo(() => {
    return mascotas.find((p) => p.id === selectedPetId) || mascotas[0] || null
  }, [mascotas, selectedPetId])

  return {
    mascotas,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    isLoading,
    activeNotification,
    showToast,
    loadData,
  }
}
