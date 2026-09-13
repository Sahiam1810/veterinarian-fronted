import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  AuxDayAppointment,
  AuxStatSummary,
  AuxAppointmentStatus,
  ApiAppointmentResponse,
  ApiPetResponse,
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
} from '../services'

function formatTime(isoString: string): string {
  if (!isoString) return '09:00 AM'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase()
}

function mapStatus(statusName?: string | null): AuxAppointmentStatus {
  if (!statusName) return 'Agendada'
  const norm = statusName.trim().toLowerCase()
  if (norm.includes('aten') || norm.includes('complet')) return 'Atendida'
  if (norm.includes('canc')) return 'Cancelada'
  if (norm.includes('no') || norm.includes('inasist') || norm.includes('asist')) return 'No asistió'
  if (norm.includes('espera')) return 'En espera'
  return 'Agendada'
}

// Dashboard de solo lectura para Auxiliar: consulta las citas del día para
// que el auxiliar sepa qué preparar físicamente en el consultorio.
export function useAuxDashboard() {
  const [appointments, setAppointments] = useState<AuxDayAppointment[]>([])
  const [rawAppointments, setRawAppointments] = useState<ApiAppointmentResponse[]>([])
  const [rawPets, setRawPets] = useState<ApiPetResponse[]>([])
  const [rawClients, setRawClients] = useState<ApiClientResponse[]>([])
  const [rawUsers, setRawUsers] = useState<ApiUserResponse[]>([])
  const [rawSpecies, setRawSpecies] = useState<ApiSpeciesResponse[]>([])
  const [rawRaces, setRawRaces] = useState<ApiRaceResponse[]>([])
  const [rawServices, setRawServices] = useState<ApiServiceResponse[]>([])
  const [rawVets, setRawVets] = useState<ApiVeterinarianResponse[]>([])
  const [rawStatuses, setRawStatuses] = useState<ApiStatusAppointmentResponse[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((curr) => (curr === message ? null : curr))
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
      ])

      const fetchedApts = aptsRes.status === 'fulfilled' ? aptsRes.value : []
      const fetchedPets = petsRes.status === 'fulfilled' ? petsRes.value : []
      const fetchedCP = cpRes.status === 'fulfilled' ? cpRes.value : []
      const fetchedClients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
      const fetchedUsers = usersRes.status === 'fulfilled' ? usersRes.value : []
      const fetchedSpecies = speciesRes.status === 'fulfilled' ? speciesRes.value : []
      const fetchedRaces = racesRes.status === 'fulfilled' ? racesRes.value : []
      const fetchedServices = servicesRes.status === 'fulfilled' ? servicesRes.value : []
      const fetchedVets = vetsRes.status === 'fulfilled' ? vetsRes.value : []
      const fetchedStatuses = statusRes.status === 'fulfilled' ? statusRes.value : []

      setRawAppointments(fetchedApts)
      setRawPets(fetchedPets)
      setRawClients(fetchedClients)
      setRawUsers(fetchedUsers)
      setRawSpecies(fetchedSpecies)
      setRawRaces(fetchedRaces)
      setRawServices(fetchedServices)
      setRawVets(fetchedVets)
      setRawStatuses(fetchedStatuses)

      // Map references
      const petsMap = new Map(fetchedPets.map((p) => [p.id.toLowerCase(), p]))
      const cpMap = new Map(fetchedCP.map((cp) => [cp.id.toLowerCase(), cp]))
      const clientsMap = new Map(fetchedClients.map((c) => [c.id.toLowerCase(), c]))
      const usersMap = new Map(fetchedUsers.map((u) => [u.id.toLowerCase(), u]))
      const speciesMap = new Map(fetchedSpecies.map((s) => [s.id.toLowerCase(), s.name]))
      const racesMap = new Map(fetchedRaces.map((r) => [r.id.toLowerCase(), r.name]))
      const servicesMap = new Map(fetchedServices.map((s) => [s.id.toLowerCase(), s.name]))
      const vetsMap = new Map(fetchedVets.map((v) => [v.id.toLowerCase(), v.userFullName || 'Veterinario']))
      const statusesMap = new Map(fetchedStatuses.map((st) => [st.id.toLowerCase(), st.name]))

      const mappedAppointments: AuxDayAppointment[] = fetchedApts.map((apt) => {
        const cp = cpMap.get(apt.clientPetId?.toLowerCase())
        const pet = cp ? petsMap.get(cp.petId.toLowerCase()) : undefined
        const client = cp ? clientsMap.get(cp.clientId.toLowerCase()) : undefined
        const ownerUser = client ? usersMap.get(client.userId.toLowerCase()) : undefined

        const petName = pet?.name || 'Paciente'
        const speciesName = pet ? speciesMap.get(pet.speciesId?.toLowerCase()) || 'Mascota' : 'Mascota'
        const raceName = pet ? racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo' : 'Mestizo'
        const serviceName = apt.serviceName || servicesMap.get(apt.serviceId?.toLowerCase()) || 'Consulta General'
        const vetName = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Veterinario'
        const statusName = apt.statusName || statusesMap.get(apt.statusId?.toLowerCase())
        const status = mapStatus(statusName)

        const isCat = speciesName.toLowerCase().includes('gato') || speciesName.toLowerCase().includes('felin')
        const avatarColor = isCat ? 'brand' : 'peach'

        return {
          id: apt.id,
          rawAppointmentId: apt.id,
          time: formatTime(apt.scheduledStart),
          petName,
          petInitial: petName.charAt(0).toUpperCase(),
          avatarColor,
          speciesBreed: `${speciesName} / ${raceName}`,
          service: serviceName,
          professional: vetName,
          status,
          ownerName: ownerUser?.fullName || 'Propietario',
          notes: apt.notes || undefined,
          statusId: apt.statusId,
          clientPetId: apt.clientPetId,
          petId: pet?.id,
          veterinarianId: apt.veterinarianId,
          serviceId: apt.serviceId,
        }
      })

      setAppointments(mappedAppointments)
    } catch (err) {
      console.error('Error al cargar datos del dashboard auxiliar', err)
      showToast('Error al conectar con la base de datos de citas.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Estadísticas calculadas a partir del estado real de las citas
  const stats = useMemo((): AuxStatSummary => {
    const total = appointments.length
    const atendidas = appointments.filter((a) => a.status === 'Atendida').length
    const proximas = appointments.filter((a) => a.status === 'Agendada' || a.status === 'En espera').length

    return {
      citasDelDia: total,
      atendidas,
      proximas,
    }
  }, [appointments])

  return {
    appointments,
    rawAppointments,
    rawPets,
    rawVets,
    rawServices,
    rawClients,
    rawUsers,
    rawSpecies,
    rawRaces,
    rawStatuses,
    stats,
    isLoading,
    activeNotification,
    showToast,
    loadData,
  }
}
