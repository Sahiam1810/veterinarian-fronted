import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  ApiAppointmentResponse,
  ApiPetResponse,
  ApiClientPetResponse,
  ApiClientResponse,
  ApiServiceResponse,
  ApiVeterinarianResponse,
  ApiSpeciesResponse,
  ApiRaceResponse,
} from '../types'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'
import {
  fetchAppointments,
  updateAppointment as apiUpdateAppointment,
  fetchPets,
  fetchClientsPets,
  fetchClients,
  fetchUsers,
  fetchSpecies,
  fetchRaces,
  fetchServices,
  fetchVeterinarians,
} from '../services'

export interface PreparacionCitaItem {
  id: string
  time: string
  petName: string
  petBreed: string
  petAge: string
  ownerName: string
  service: string
  vetName: string
  status: 'Pendiente' | 'En preparación' | 'Preparada'
  lastWeight: string
  lastTemp: string
  avatarUrl?: string
}

export function useAuxPreparacion() {
  const [citas, setCitas] = useState<PreparacionCitaItem[]>([])
  const [rawAppointments, setRawAppointments] = useState<ApiAppointmentResponse[]>([])
  const [selectedCitaId, setSelectedCitaId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
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
        aptsRes,
        petsRes,
        cpRes,
        clientsRes,
        usersRes,
        speciesRes,
        racesRes,
        servicesRes,
        vetsRes,
      ] = await Promise.allSettled([
        fetchAppointments(),
        fetchPets(),
        fetchClientsPets(),
        fetchClients(),
        fetchUsers(),
        fetchSpecies(),
        fetchRaces(),
        fetchServices(),
        fetchVeterinarians(),
      ])

      const fetchedApts: ApiAppointmentResponse[] = aptsRes.status === 'fulfilled' ? aptsRes.value : []
      const fetchedPets: ApiPetResponse[] = petsRes.status === 'fulfilled' ? petsRes.value : []
      const fetchedCP: ApiClientPetResponse[] = cpRes.status === 'fulfilled' ? cpRes.value : []
      const fetchedClients: ApiClientResponse[] = clientsRes.status === 'fulfilled' ? clientsRes.value : []
      const fetchedUsers: ApiUserResponse[] = usersRes.status === 'fulfilled' ? usersRes.value : []
      const fetchedSpecies: ApiSpeciesResponse[] = speciesRes.status === 'fulfilled' ? speciesRes.value : []
      const fetchedRaces: ApiRaceResponse[] = racesRes.status === 'fulfilled' ? racesRes.value : []
      const fetchedServices: ApiServiceResponse[] = servicesRes.status === 'fulfilled' ? servicesRes.value : []
      const fetchedVets: ApiVeterinarianResponse[] = vetsRes.status === 'fulfilled' ? vetsRes.value : []

      setRawAppointments(fetchedApts)

      const petsMap = new Map(fetchedPets.map((p) => [p.id.toLowerCase(), p]))
      const cpMap = new Map(fetchedCP.map((cp) => [cp.id.toLowerCase(), cp]))
      const clientsMap = new Map(fetchedClients.map((c) => [c.id.toLowerCase(), c]))
      const usersMap = new Map(fetchedUsers.map((u) => [u.id.toLowerCase(), u]))
      const speciesMap = new Map(fetchedSpecies.map((s) => [s.id.toLowerCase(), s.name]))
      const racesMap = new Map(fetchedRaces.map((r) => [r.id.toLowerCase(), r.name]))
      const servicesMap = new Map(fetchedServices.map((s) => [s.id.toLowerCase(), s.name]))
      const vetsMap = new Map(fetchedVets.map((v) => [v.id.toLowerCase(), v.userFullName || 'Veterinario']))

      const mapped: PreparacionCitaItem[] = fetchedApts.map((apt) => {
        const cp = cpMap.get(apt.clientPetId?.toLowerCase())
        const pet = cp ? petsMap.get(cp.petId.toLowerCase()) : undefined
        const client = cp ? clientsMap.get(cp.clientId.toLowerCase()) : undefined
        const ownerUser = client ? usersMap.get(client.userId.toLowerCase()) : undefined

        const petName = pet?.name || 'Mascota'
        const species = pet ? speciesMap.get(pet.speciesId?.toLowerCase()) || 'Canino' : 'Canino'
        const race = pet ? racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo' : 'Mestizo'
        const service = apt.serviceName || servicesMap.get(apt.serviceId?.toLowerCase()) || 'Consulta General'
        const vetName = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Dra. Silva'

        const startDate = new Date(apt.scheduledStart)
        const time = !Number.isNaN(startDate.getTime())
          ? startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : '09:00 AM'

        const notes = (apt.notes || '').toLowerCase()
        let status: PreparacionCitaItem['status'] = 'Pendiente'
        if (notes.includes('preparada') || notes.includes('peso ingreso')) {
          status = 'Preparada'
        } else if (notes.includes('en prep')) {
          status = 'En preparación'
        }

        const isCat = species.toLowerCase().includes('gato') || species.toLowerCase().includes('felin')

        return {
          id: apt.id,
          time,
          petName,
          petBreed: race,
          petAge: pet ? `${pet.age} años` : '2 años',
          ownerName: ownerUser?.fullName || 'Propietario',
          service,
          vetName,
          status,
          lastWeight: pet ? String(pet.weight) : '15.0',
          lastTemp: '38.2',
          avatarUrl: isCat
            ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=120&h=120'
            : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=120&h=120',
        }
      })

      setCitas(mapped)
      if (mapped.length > 0 && !selectedCitaId) {
        setSelectedCitaId(mapped[0].id)
      }
    } catch (err) {
      console.error('Error al cargar preparación auxiliar', err)
      showToast('Error al conectar con la base de datos de atención.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast, selectedCitaId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedCita = useMemo(() => {
    return citas.find((c) => c.id === selectedCitaId) || citas[0] || null
  }, [citas, selectedCitaId])

  const filteredCitas = useMemo(() => {
    return citas.filter((c) => {
      const search = searchTerm.toLowerCase()
      return (
        c.petName.toLowerCase().includes(search) ||
        c.ownerName.toLowerCase().includes(search) ||
        c.service.toLowerCase().includes(search) ||
        c.vetName.toLowerCase().includes(search)
      )
    })
  }, [citas, searchTerm])

  const savePreparada = async (
    citaId: string,
    data: { weight: string; temp: string; obs?: string; vetNotes?: string }
  ) => {
    try {
      const targetApt = rawAppointments.find((a) => a.id.toLowerCase() === citaId.toLowerCase())
      if (!targetApt) {
        throw new Error('No se encontró la cita especificada.')
      }

      const prepNotes = [
        targetApt.notes,
        'Preparada',
        data.weight ? `Peso actual: ${data.weight}kg` : null,
        data.temp ? `Temp: ${data.temp}°C` : null,
        data.obs ? `Obs: ${data.obs}` : null,
        data.vetNotes ? `Para profesional: ${data.vetNotes}` : null,
      ]
        .filter(Boolean)
        .join(' | ')

      await apiUpdateAppointment(targetApt.id, {
        clientPetId: targetApt.clientPetId,
        veterinarianId: targetApt.veterinarianId,
        serviceId: targetApt.serviceId,
        statusId: targetApt.statusId,
        availabilityId: targetApt.availabilityId || undefined,
        scheduledStart: targetApt.scheduledStart,
        scheduledEnd: targetApt.scheduledEnd,
        notes: prepNotes,
      })

      showToast('¡Paciente marcado como preparado exitosamente en la base de datos!')
      await loadData()
    } catch (err) {
      console.error('Error al guardar preparación de paciente', err)
      const msg = err instanceof Error ? err.message : 'Error al guardar preparación'
      showToast(msg)
    }
  }

  return {
    citas: filteredCitas,
    selectedCita,
    selectedCitaId,
    setSelectedCitaId,
    searchTerm,
    setSearchTerm,
    isLoading,
    activeNotification,
    showToast,
    loadData,
    savePreparada,
  }
}
