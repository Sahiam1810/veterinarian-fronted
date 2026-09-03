import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  ApiPetResponse,
  ApiClientPetResponse,
  ApiClientResponse,
  ApiSpeciesResponse,
  ApiRaceResponse,
  ApiAppointmentResponse,
} from '../types'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'
import {
  fetchPets,
  createPet as apiCreatePet,
  fetchClientsPets,
  createClientPet as apiCreateClientPet,
  fetchClients,
  fetchUsers,
  fetchSpecies,
  fetchRaces,
  fetchAppointments,
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
  avatarUrl?: string
  citaActual?: {
    service: string
    time: string
    vetName: string
  } | null
}

export function useAuxMascotas() {
  const [mascotas, setMascotas] = useState<MascotaAuxItem[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [speciesList, setSpeciesList] = useState<ApiSpeciesResponse[]>([])
  const [racesList, setRacesList] = useState<ApiRaceResponse[]>([])
  const [clientsList, setClientsList] = useState<ApiClientResponse[]>([])
  const [usersList, setUsersList] = useState<ApiUserResponse[]>([])
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
        usersRes,
        aptsRes,
      ] = await Promise.allSettled([
        fetchPets(),
        fetchSpecies(),
        fetchRaces(),
        fetchClientsPets(),
        fetchClients(),
        fetchUsers(),
        fetchAppointments(),
      ])

      const fetchedPets: ApiPetResponse[] = petsRes.status === 'fulfilled' ? petsRes.value : []
      const fetchedSpecies: ApiSpeciesResponse[] = speciesRes.status === 'fulfilled' ? speciesRes.value : []
      const fetchedRaces: ApiRaceResponse[] = racesRes.status === 'fulfilled' ? racesRes.value : []
      const fetchedCP: ApiClientPetResponse[] = cpRes.status === 'fulfilled' ? cpRes.value : []
      const fetchedClients: ApiClientResponse[] = clientsRes.status === 'fulfilled' ? clientsRes.value : []
      const fetchedUsers: ApiUserResponse[] = usersRes.status === 'fulfilled' ? usersRes.value : []
      const fetchedApts: ApiAppointmentResponse[] = aptsRes.status === 'fulfilled' ? aptsRes.value : []

      setSpeciesList(fetchedSpecies)
      setRacesList(fetchedRaces)
      setClientsList(fetchedClients)
      setUsersList(fetchedUsers)

      const speciesMap = new Map(fetchedSpecies.map((s) => [s.id.toLowerCase(), s.name]))
      const racesMap = new Map(fetchedRaces.map((r) => [r.id.toLowerCase(), r.name]))
      const clientsMap = new Map(fetchedClients.map((c) => [c.id.toLowerCase(), c]))
      const usersMap = new Map(fetchedUsers.map((u) => [u.id.toLowerCase(), u]))

      // Relaciones mascota -> cliente
      const petOwnerMap = new Map<string, string>()
      fetchedCP.forEach((cp) => {
        const client = clientsMap.get(cp.clientId.toLowerCase())
        if (client) {
          const user = usersMap.get(client.userId.toLowerCase())
          if (user) {
            petOwnerMap.set(cp.petId.toLowerCase(), user.fullName)
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
        const ownerName = petOwnerMap.get(p.id.toLowerCase()) || 'Carlos Mendoza'
        const nextApt = petNextAptMap.get(p.id.toLowerCase())

        const genderFormatted = p.gender === 'F' ? 'Hembra' : 'Macho'
        const isCat = specieName.toLowerCase().includes('gato') || specieName.toLowerCase().includes('felin')

        let nextAppointmentText = 'Sin citas'
        let citaActualObj: MascotaAuxItem['citaActual'] = null

        if (nextApt) {
          const start = new Date(nextApt.scheduledStart)
          const timeStr = Number.isNaN(start.getTime())
            ? 'Hoy, 14:30'
            : start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          nextAppointmentText = `Hoy, ${timeStr}`
          citaActualObj = {
            service: nextApt.serviceName || 'Control General',
            time: nextAppointmentText,
            vetName: 'Dr. Silva',
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
          ownerPhone: '+57 300 123 4567',
          nextAppointment: nextAppointmentText,
          sterilized: p.observations?.toLowerCase().includes('esteril') ? 'Sí' : 'No',
          avatarUrl: isCat
            ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=120&h=120'
            : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=120&h=120',
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

  const addPet = async (data: {
    name: string
    specie: string
    breed: string
    age: string
    gender: string
    weight: string
    ownerName: string
    ownerPhone?: string
    sterilized: 'Sí' | 'No'
  }) => {
    try {
      // 1. Resolver o tomar ID de especie
      const matchingSpecies = speciesList.find((s) =>
        s.name.toLowerCase().includes(data.specie.toLowerCase())
      ) || speciesList[0]

      // 2. Resolver o tomar ID de raza
      const matchingRace = racesList.find((r) =>
        r.name.toLowerCase().includes(data.breed.toLowerCase())
      ) || racesList[0]

      if (!matchingSpecies || !matchingRace) {
        throw new Error('No hay especies o razas registradas en el catálogo.')
      }

      const parsedAge = parseInt(data.age.replace(/\D/g, ''), 10) || 1
      const parsedWeight = parseFloat(data.weight) || 5.0
      const genderCode = data.gender.toLowerCase().startsWith('h') ? 'F' : 'M'
      const obs = data.sterilized === 'Sí' ? 'Esterilizado' : 'Sin observaciones'

      // 3. Crear mascota en POST /api/Pets
      const createdPet = await apiCreatePet({
        name: data.name,
        age: parsedAge,
        gender: genderCode,
        weight: parsedWeight,
        observations: obs,
        speciesId: matchingSpecies.id,
        raceId: matchingRace.id,
      })

      // 4. Vincular con un cliente en POST /api/ClientsPets si hay clientes disponibles
      if (clientsList.length > 0) {
        await apiCreateClientPet({
          clientId: clientsList[0].id,
          petId: createdPet.id,
          isPrimaryOwner: true,
        })
      }

      showToast(`¡Mascota ${data.name} registrada con éxito en el sistema!`)
      await loadData()
      setSelectedPetId(createdPet.id)
    } catch (err) {
      console.error('Error al registrar mascota', err)
      const msg = err instanceof Error ? err.message : 'Error al registrar mascota'
      showToast(msg)
    }
  }

  return {
    mascotas,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    speciesList,
    racesList,
    clientsList,
    usersList,
    isLoading,
    activeNotification,
    showToast,
    loadData,
    addPet,
  }
}
