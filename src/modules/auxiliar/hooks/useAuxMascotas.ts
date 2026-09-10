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
  fetchAppointments,
} from '../services'
import {
  fetchClients,
  fetchUsers,
  fetchSpecies,
  fetchRaces,
} from '../services/auxCatalogosService'

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

      const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value : [])
      const fetchedPets = asArray<ApiPetResponse>(petsRes.status === 'fulfilled' ? petsRes.value : [])
      const fetchedSpecies = asArray<ApiSpeciesResponse>(speciesRes.status === 'fulfilled' ? speciesRes.value : [])
      const fetchedRaces = asArray<ApiRaceResponse>(racesRes.status === 'fulfilled' ? racesRes.value : [])
      const fetchedCP = asArray<ApiClientPetResponse>(cpRes.status === 'fulfilled' ? cpRes.value : [])
      const fetchedClients = asArray<ApiClientResponse>(clientsRes.status === 'fulfilled' ? clientsRes.value : [])
      const fetchedUsers = asArray<ApiUserResponse>(usersRes.status === 'fulfilled' ? usersRes.value : [])
      const fetchedApts = asArray<ApiAppointmentResponse>(aptsRes.status === 'fulfilled' ? aptsRes.value : [])

      setSpeciesList(fetchedSpecies)
      setRacesList(fetchedRaces)
      setClientsList(fetchedClients)
      setUsersList(fetchedUsers)

      const speciesMap = new Map(
        fetchedSpecies.filter((s) => s.id).map((s) => [s.id.toLowerCase(), s.name]),
      )
      const racesMap = new Map(
        fetchedRaces.filter((r) => r.id).map((r) => [r.id.toLowerCase(), r.name]),
      )
      const clientsMap = new Map(
        fetchedClients.filter((c) => c.id).map((c) => [c.id.toLowerCase(), c]),
      )
      const usersMap = new Map(
        fetchedUsers.filter((u) => u.id).map((u) => [u.id.toLowerCase(), u]),
      )

      // Relaciones mascota -> cliente (nombre desde el cliente o el usuario vinculado)
      const petOwnerMap = new Map<string, { name: string; phone?: string }>()
      fetchedCP.forEach((cp) => {
        const petKey = cp.petId?.toLowerCase()
        const client = clientsMap.get(cp.clientId?.toLowerCase() ?? '')
        if (!petKey || !client) return
        const user = client.userId ? usersMap.get(client.userId.toLowerCase()) : undefined
        const ownerName = user?.fullName || client.fullName || 'Propietario'
        petOwnerMap.set(petKey, {
          name: ownerName,
          phone: client.phoneNumber || undefined,
        })
      })

      // Citas próximas por clientPetId
      const cpToPetMap = new Map(
        fetchedCP
          .filter((cp) => cp.id && cp.petId)
          .map((cp) => [cp.id.toLowerCase(), cp.petId.toLowerCase()]),
      )
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
        const owner = petOwnerMap.get(p.id?.toLowerCase() ?? '')
        const ownerName = owner?.name || 'Propietario'
        const nextApt = petNextAptMap.get(p.id?.toLowerCase() ?? '')

        const genderFormatted = p.gender === 'F' ? 'Hembra' : 'Macho'

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

        const petId = p.id || ''
        return {
          id: petId,
          petId: `#M-${petId.slice(0, 4).toUpperCase()}`,
          name: p.name || 'Mascota',
          specie: specieName,
          breed: raceName,
          age: `${p.age ?? 0} Años`,
          gender: genderFormatted,
          weight: String(p.weight ?? 0),
          ownerName,
          ownerPhone: owner?.phone,
          nextAppointment: nextAppointmentText,
          sterilized: p.observations?.toLowerCase().includes('esteril') ? 'Sí' : 'No',
          avatarUrl: p.photoUrl || undefined,
          citaActual: citaActualObj,
        }
      })

      setMascotas(mapped)
      setSelectedPetId((current) => (current && mapped.some((m) => m.id === current) ? current : mapped[0]?.id ?? ''))
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
    clientId?: string
  }) => {
    try {
      // 1. Resolver o tomar ID de especie
      const matchingSpecies = speciesList.find((s) =>
        s.name.toLowerCase().includes(data.specie.toLowerCase())
      ) || speciesList[0]

      // 2. Raza solo dentro de esa especie
      const racesForSpecies = racesList.filter(
        (r) => (r.speciesId ?? '').toLowerCase() === (matchingSpecies?.id ?? '').toLowerCase(),
      )
      const matchingRace =
        racesForSpecies.find((r) => r.name.toLowerCase().includes(data.breed.toLowerCase()))
        || racesForSpecies[0]

      if (!matchingSpecies || !matchingRace) {
        throw new Error('No hay especies o razas registradas para esa combinación.')
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

      // 4. Vincular con el cliente seleccionado en POST /api/ClientsPets
      const targetClientId = data.clientId || (clientsList.length > 0 ? clientsList[0].id : null)
      if (targetClientId) {
        await apiCreateClientPet({
          clientId: targetClientId,
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
