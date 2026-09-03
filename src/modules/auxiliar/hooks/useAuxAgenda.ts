import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  ApiAppointmentResponse,
  ApiPetResponse,
  ApiClientPetResponse,
  ApiClientResponse,
  ApiVeterinarianResponse,
  ApiServiceResponse,
  ApiSpeciesResponse,
  ApiRaceResponse,
} from '../types'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'
import {
  fetchAppointments,
  fetchPets,
  fetchClientsPets,
  fetchClients,
  fetchUsers,
  fetchSpecies,
  fetchRaces,
  fetchServices,
  fetchVeterinarians,
} from '../services'

export interface AgendaAppointmentItem {
  id: string
  dateKey: string // YYYY-MM-DD
  startTime: string
  endTime: string
  status: 'Agendado' | 'Atendido' | 'Cancelado' | 'Preparada' | 'Pendiente'
  petName: string
  petBreed: string
  species: string
  ownerName: string
  professional: string
  service: string
  notes?: string
}

export function useAuxAgenda() {
  const [appointments, setAppointments] = useState<AgendaAppointmentItem[]>([])
  const [vetsList, setVetsList] = useState<string[]>(['Todos los profesionales'])
  const [selectedProfessional, setSelectedProfessional] = useState<string>('Todos los profesionales')
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

      const petsMap = new Map(fetchedPets.map((p) => [p.id.toLowerCase(), p]))
      const cpMap = new Map(fetchedCP.map((cp) => [cp.id.toLowerCase(), cp]))
      const clientsMap = new Map(fetchedClients.map((c) => [c.id.toLowerCase(), c]))
      const usersMap = new Map(fetchedUsers.map((u) => [u.id.toLowerCase(), u]))
      const speciesMap = new Map(fetchedSpecies.map((s) => [s.id.toLowerCase(), s.name]))
      const racesMap = new Map(fetchedRaces.map((r) => [r.id.toLowerCase(), r.name]))
      const servicesMap = new Map(fetchedServices.map((s) => [s.id.toLowerCase(), s.name]))
      const vetsMap = new Map(fetchedVets.map((v) => [v.id.toLowerCase(), v.userFullName || 'Veterinario']))

      // Profesionales para filtro
      const vetNames = Array.from(new Set(fetchedVets.map((v) => v.userFullName).filter(Boolean) as string[]))
      setVetsList(['Todos los profesionales', ...vetNames])

      const mapped: AgendaAppointmentItem[] = fetchedApts.map((apt) => {
        const cp = cpMap.get(apt.clientPetId?.toLowerCase())
        const pet = cp ? petsMap.get(cp.petId.toLowerCase()) : undefined
        const client = cp ? clientsMap.get(cp.clientId.toLowerCase()) : undefined
        const ownerUser = client ? usersMap.get(client.userId.toLowerCase()) : undefined

        const petName = pet?.name || 'Mascota'
        const species = pet ? speciesMap.get(pet.speciesId?.toLowerCase()) || 'Perro' : 'Perro'
        const petBreed = pet ? racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo' : 'Mestizo'
        const service = apt.serviceName || servicesMap.get(apt.serviceId?.toLowerCase()) || 'Consulta General'
        const professional = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Dra. Martínez'

        const startDate = new Date(apt.scheduledStart)
        const dateKey = !Number.isNaN(startDate.getTime())
          ? startDate.toISOString().split('T')[0]
          : '2023-10-17'

        const startTime = !Number.isNaN(startDate.getTime())
          ? startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : '09:00'

        const endDate = new Date(apt.scheduledEnd)
        const endTime = !Number.isNaN(endDate.getTime())
          ? endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : '09:30'

        let status: AgendaAppointmentItem['status'] = 'Agendado'
        const normNotes = (apt.notes || '').toLowerCase()
        if (normNotes.includes('preparada') || normNotes.includes('peso')) status = 'Preparada'

        return {
          id: apt.id,
          dateKey,
          startTime,
          endTime,
          status,
          petName,
          petBreed,
          species,
          ownerName: ownerUser?.fullName || 'Propietario',
          professional,
          service,
          notes: apt.notes || undefined,
        }
      })

      setAppointments(mapped)
    } catch (err) {
      console.error('Error al cargar agenda auxiliar', err)
      showToast('Error al conectar con la agenda del servidor.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (
        selectedProfessional !== 'Todos los profesionales' &&
        apt.professional !== selectedProfessional
      ) {
        return false
      }
      return true
    })
  }, [appointments, selectedProfessional])

  return {
    appointments: filteredAppointments,
    allAppointments: appointments,
    professionals: vetsList,
    selectedProfessional,
    setSelectedProfessional,
    isLoading,
    activeNotification,
    showToast,
    loadData,
  }
}
