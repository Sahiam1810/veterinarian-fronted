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
  ApiStatusAppointmentResponse,
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
  fetchStatusAppointments,
  fetchMedicalRecords,
  type ApiMedicalRecordResponse,
} from '../services'

export interface AgendaAppointmentItem {
  id: string
  dateKey: string // YYYY-MM-DD
  startTime: string
  endTime: string
  status: 'Agendado' | 'Atendido' | 'Cancelado' | 'No asistió' | 'En espera'
  pretriajeStatus: 'Pendiente' | 'Realizado'
  petName: string
  petBreed: string
  species: string
  ownerName: string
  professional: string
  service: string
  notes?: string
}

function mapAgendaStatus(statusName?: string | null): AgendaAppointmentItem['status'] {
  if (!statusName) return 'Agendado'
  const norm = statusName.trim().toLowerCase()
  if (norm.includes('aten') || norm.includes('complet')) return 'Atendido'
  if (norm.includes('canc')) return 'Cancelado'
  if (norm.includes('no') || norm.includes('inasist') || norm.includes('asist')) return 'No asistió'
  if (norm.includes('espera')) return 'En espera'
  return 'Agendado'
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
        statusRes,
        recordsRes,
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
        fetchStatusAppointments(),
        fetchMedicalRecords(),
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
      const fetchedStatuses: ApiStatusAppointmentResponse[] = statusRes.status === 'fulfilled' ? statusRes.value : []
      const fetchedRecords: ApiMedicalRecordResponse[] = recordsRes.status === 'fulfilled' ? recordsRes.value : []

      const petsMap = new Map(fetchedPets.map((p) => [p.id.toLowerCase(), p]))
      const cpMap = new Map(fetchedCP.map((cp) => [cp.id.toLowerCase(), cp]))
      const clientsMap = new Map(fetchedClients.map((c) => [c.id.toLowerCase(), c]))
      const usersMap = new Map(fetchedUsers.map((u) => [u.id.toLowerCase(), u]))
      const speciesMap = new Map(fetchedSpecies.map((s) => [s.id.toLowerCase(), s.name]))
      const racesMap = new Map(fetchedRaces.map((r) => [r.id.toLowerCase(), r.name]))
      const servicesMap = new Map(fetchedServices.map((s) => [s.id.toLowerCase(), s.name]))
      const vetsMap = new Map(fetchedVets.map((v) => [v.id.toLowerCase(), v.userFullName || 'Veterinario']))
      const statusesMap = new Map(fetchedStatuses.map((st) => [st.id.toLowerCase(), st.name]))

      const recordsByApt = new Map<string, ApiMedicalRecordResponse>()
      for (const rec of fetchedRecords) {
        if (rec.appointmentId) {
          recordsByApt.set(rec.appointmentId.toLowerCase(), rec)
        }
      }

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
        const professional = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Veterinario'

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

        const statusName = apt.statusName || statusesMap.get(apt.statusId?.toLowerCase())
        const status = mapAgendaStatus(statusName)

        const medRecord = recordsByApt.get(apt.id.toLowerCase())
        const hasMedRecord = Boolean(medRecord)
        const normNotes = (apt.notes || '').toLowerCase()
        const hasTriageNote = normNotes.includes('pre-triaje') || normNotes.includes('triaje') || normNotes.includes('peso:') || normNotes.includes('temp:')
        const pretriajeStatus: AgendaAppointmentItem['pretriajeStatus'] = (hasMedRecord || hasTriageNote) ? 'Realizado' : 'Pendiente'

        return {
          id: apt.id,
          dateKey,
          startTime,
          endTime,
          status,
          pretriajeStatus,
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

