import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  AuxDayAppointment,
  AuxStatSummary,
  AuxAppointmentStatus,
  ApiAppointmentResponse,
  ApiPetResponse,
  ApiClientPetResponse,
  ApiClientResponse,
  ApiVeterinarianResponse,
  ApiServiceResponse,
  ApiSpeciesResponse,
  ApiRaceResponse,
  ApiStatusAppointmentResponse,
  ApiAvailabilityResponse,
} from '../types'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'
import {
  fetchAppointments,
  createAppointment as apiCreateAppointment,
  updateAppointment as apiUpdateAppointment,
  fetchPets,
  fetchClientsPets,
  fetchClients,
  fetchUsers,
  fetchSpecies,
  fetchRaces,
  fetchServices,
  fetchVeterinarians,
  fetchStatusAppointments,
  fetchAvailabilities,
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
  if (!statusName) return 'Pendiente'
  const norm = statusName.trim().toLowerCase()
  if (norm.includes('prep') || norm.includes('listo')) return 'Preparada'
  if (norm.includes('aten') || norm.includes('complet')) return 'Atendida'
  if (norm.includes('canc')) return 'Cancelado'
  if (norm.includes('espera')) return 'En Espera'
  if (norm.includes('agend')) return 'Agendado'
  return 'Pendiente'
}

export function useAuxDashboard() {
  const [appointments, setAppointments] = useState<AuxDayAppointment[]>([])
  const [rawAppointments, setRawAppointments] = useState<ApiAppointmentResponse[]>([])
  const [rawPets, setRawPets] = useState<ApiPetResponse[]>([])
  const [rawClientsPets, setRawClientsPets] = useState<ApiClientPetResponse[]>([])
  const [rawClients, setRawClients] = useState<ApiClientResponse[]>([])
  const [rawUsers, setRawUsers] = useState<ApiUserResponse[]>([])
  const [rawSpecies, setRawSpecies] = useState<ApiSpeciesResponse[]>([])
  const [rawRaces, setRawRaces] = useState<ApiRaceResponse[]>([])
  const [rawServices, setRawServices] = useState<ApiServiceResponse[]>([])
  const [rawVets, setRawVets] = useState<ApiVeterinarianResponse[]>([])
  const [rawStatuses, setRawStatuses] = useState<ApiStatusAppointmentResponse[]>([])
  const [rawAvailabilities, setRawAvailabilities] = useState<ApiAvailabilityResponse[]>([])

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
        availRes,
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
        fetchAvailabilities(),
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
      const fetchedAvail = availRes.status === 'fulfilled' ? availRes.value : []

      setRawAppointments(fetchedApts)
      setRawPets(fetchedPets)
      setRawClientsPets(fetchedCP)
      setRawClients(fetchedClients)
      setRawUsers(fetchedUsers)
      setRawSpecies(fetchedSpecies)
      setRawRaces(fetchedRaces)
      setRawServices(fetchedServices)
      setRawVets(fetchedVets)
      setRawStatuses(fetchedStatuses)
      setRawAvailabilities(fetchedAvail)

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
        const vetName = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Dra. Martínez'
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

  // Estadísticas calculadas
  const stats = useMemo((): AuxStatSummary => {
    const total = appointments.length
    const pendientes = appointments.filter((a) => a.status === 'Pendiente' || a.status === 'Agendado').length
    const preparadas = appointments.filter((a) => a.status === 'Preparada').length
    const proximas = appointments.filter((a) => a.status === 'Pendiente' || a.status === 'En Espera' || a.status === 'Agendado').length

    return {
      citasDelDia: total,
      pendientesPrep: pendientes,
      proximas,
      preparadas,
    }
  }, [appointments])

  // Guardar preparación de una cita en backend
  const savePreparation = async (
    appointmentId: string,
    data: { weight: string; temp: string; notes?: string }
  ) => {
    try {
      const targetApt = rawAppointments.find((a) => a.id.toLowerCase() === appointmentId.toLowerCase())
      if (!targetApt) {
        throw new Error('No se encontró la cita especificada en el sistema.')
      }

      // Buscar el statusId para "Preparada" o "Confirmada"
      const prepStatus = rawStatuses.find((s) => s.name.toLowerCase().includes('prep') || s.name.toLowerCase().includes('confir'))
      const statusId = prepStatus?.id || targetApt.statusId

      const updatedNotes = [
        targetApt.notes,
        data.notes,
        data.weight ? `Peso ingreso: ${data.weight}kg` : null,
        data.temp ? `Temp: ${data.temp}°C` : null,
      ]
        .filter(Boolean)
        .join(' | ')

      await apiUpdateAppointment(targetApt.id, {
        clientPetId: targetApt.clientPetId,
        veterinarianId: targetApt.veterinarianId,
        serviceId: targetApt.serviceId,
        statusId,
        availabilityId: targetApt.availabilityId || undefined,
        scheduledStart: targetApt.scheduledStart,
        scheduledEnd: targetApt.scheduledEnd,
        notes: updatedNotes,
      })

      showToast('¡Paciente preparado y guardado en la base de datos!')
      await loadData()
    } catch (err) {
      console.error('Error al guardar preparación', err)
      const msg = err instanceof Error ? err.message : 'Error al guardar preparación'
      showToast(msg)
    }
  }

  // Crear nueva cita en backend
  const createNewAppointment = async (newApt: AuxDayAppointment) => {
    try {
      // Tomar primer clientPetId, veterinarianId, serviceId, statusId si no vienen especificados
      const clientPetId = newApt.clientPetId || rawClientsPets[0]?.id
      const veterinarianId = newApt.veterinarianId || rawVets[0]?.id
      const serviceId = newApt.serviceId || rawServices[0]?.id
      const statusId = newApt.statusId || rawStatuses[0]?.id
      const availabilityId = rawAvailabilities[0]?.id

      if (!clientPetId || !veterinarianId || !serviceId || !statusId) {
        throw new Error('Faltan catálogos requeridos (Mascota, Veterinario, Servicio o Estado).')
      }

      const now = new Date()
      const startIso = new Date(now.setHours(9, 0, 0, 0)).toISOString()
      const endIso = new Date(now.setHours(9, 30, 0, 0)).toISOString()

      await apiCreateAppointment({
        clientPetId,
        veterinarianId,
        serviceId,
        statusId,
        availabilityId,
        scheduledStart: startIso,
        scheduledEnd: endIso,
        notes: newApt.notes || 'Cita agendada desde el panel auxiliar',
      })

      showToast(`¡Cita agendada para ${newApt.petName} exitosamente en la base de datos!`)
      await loadData()
    } catch (err) {
      console.error('Error al agendar cita', err)
      const msg = err instanceof Error ? err.message : 'Error al agendar cita'
      showToast(msg)
    }
  }

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
    savePreparation,
    createNewAppointment,
  }
}
