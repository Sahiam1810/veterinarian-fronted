import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  AuxDayAppointment,
  AuxStatSummary,
  AuxAppointmentStatus,
  AuxPretriajeStatus,
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
  updatePet,
  fetchClientsPets,
  fetchMedicalRecords,
  createMedicalRecord,
  fetchDiagnostics,
  type ApiMedicalRecordResponse,
} from '../services'
import {
  fetchClients,
  fetchUsers,
  fetchSpecies,
  fetchRaces,
  fetchServices,
  fetchVeterinarians,
  fetchStatusAppointments,
  fetchAvailabilities,
} from '../services/auxCatalogosService'

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
        fetchAvailabilities(),
        fetchMedicalRecords(),
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
      const fetchedRecords: ApiMedicalRecordResponse[] = recordsRes.status === 'fulfilled' ? recordsRes.value : []

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

      const recordsByApt = new Map<string, ApiMedicalRecordResponse>()
      for (const rec of fetchedRecords) {
        if (rec.appointmentId) {
          recordsByApt.set(rec.appointmentId.toLowerCase(), rec)
        }
      }

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

        const medRecord = recordsByApt.get(apt.id.toLowerCase())
        const hasMedRecord = Boolean(medRecord)
        const notes = (apt.notes || '').toLowerCase()
        const hasTriageNote = notes.includes('pre-triaje') || notes.includes('triaje') || notes.includes('peso:') || notes.includes('temp:')
        const pretriajeStatus: AuxPretriajeStatus = (hasMedRecord || hasTriageNote) ? 'Realizado' : 'Pendiente'

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
          pretriajeStatus,
          weightAtVisit: medRecord?.weightAtVisit != null ? medRecord.weightAtVisit : pet?.weight,
          temperature: medRecord?.temperature,
          symptoms: medRecord?.symptoms,
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

  // Estadísticas calculadas basadas en estado real de la cita y pre-triaje
  const stats = useMemo((): AuxStatSummary => {
    const total = appointments.length
    const pendientesPretriaje = appointments.filter(
      (a) => a.pretriajeStatus === 'Pendiente' && a.status !== 'Cancelada' && a.status !== 'No asistió'
    ).length
    const pretriajesRealizados = appointments.filter((a) => a.pretriajeStatus === 'Realizado').length
    const atendidas = appointments.filter((a) => a.status === 'Atendida').length
    const proximas = appointments.filter((a) => a.status === 'Agendada' || a.status === 'En espera').length

    return {
      citasDelDia: total,
      pendientesPretriaje,
      pretriajesRealizados,
      atendidas,
      // Compatibility aliases
      pendientesPrep: pendientesPretriaje,
      proximas,
      preparadas: pretriajesRealizados,
    }
  }, [appointments])

  // Guardar pre-triaje de una cita en backend (MedicalRecords + Pet weight + appointment notes)
  const savePreparation = async (
    appointmentId: string,
    data: { weight: string; temp: string; notes?: string }
  ) => {
    try {
      const targetApt = rawAppointments.find((a) => a.id.toLowerCase() === appointmentId.toLowerCase())
      if (!targetApt) {
        throw new Error('No se encontró la cita especificada en el sistema.')
      }

      const targetCP = rawClientsPets.find((cp) => cp.id.toLowerCase() === targetApt.clientPetId?.toLowerCase())
      const targetPet = targetCP ? rawPets.find((p) => p.id.toLowerCase() === targetCP.petId.toLowerCase()) : undefined

      const numWeight = data.weight ? parseFloat(data.weight) : null
      const numTemp = data.temp ? parseFloat(data.temp) : null

      // Guardar en MedicalRecords
      const diagnostics = await fetchDiagnostics(false)
      const validDiagId = diagnostics[0]?.id || '00000000-0000-0000-0000-000000000000'

      if (targetApt.clientPetId && validDiagId && validDiagId !== '00000000-0000-0000-0000-000000000000') {
        try {
          await createMedicalRecord({
            clientPetId: targetApt.clientPetId,
            appointmentId: targetApt.id,
            diagnosticId: validDiagId,
            symptoms: data.notes || 'Pre-triaje realizado por auxiliar',
            weightAtVisit: numWeight,
            temperature: numTemp,
          })
        } catch (recErr) {
          console.warn('No se pudo guardar MedicalRecord directamente', recErr)
        }
      }

      // Actualizar peso de la mascota si aplica
      if (targetPet && numWeight && numWeight > 0) {
        try {
          await updatePet(targetPet.id, {
            name: targetPet.name,
            age: targetPet.age,
            gender: targetPet.gender,
            weight: numWeight,
            observations: targetPet.observations,
            speciesId: targetPet.speciesId,
            raceId: targetPet.raceId,
          })
        } catch (petErr) {
          console.warn('No se pudo actualizar peso de mascota', petErr)
        }
      }

      // Actualizar notas de la cita preservando el statusId oficial
      const updatedNotes = [
        targetApt.notes,
        `[Pre-triaje] Peso: ${data.weight || '-'}kg, Temp: ${data.temp || '-'}°C`,
        data.notes ? `Detalles: ${data.notes}` : null,
      ]
        .filter(Boolean)
        .join(' | ')

      await apiUpdateAppointment(targetApt.id, {
        clientPetId: targetApt.clientPetId,
        veterinarianId: targetApt.veterinarianId,
        serviceId: targetApt.serviceId,
        statusId: targetApt.statusId, // Preserva status oficial
        availabilityId: targetApt.availabilityId || undefined,
        scheduledStart: targetApt.scheduledStart,
        scheduledEnd: targetApt.scheduledEnd,
        notes: updatedNotes,
      })

      showToast('¡Pre-triaje del paciente guardado exitosamente en historia clínica!')
      await loadData()
    } catch (err) {
      console.error('Error al guardar pre-triaje', err)
      const msg = err instanceof Error ? err.message : 'Error al guardar pre-triaje'
      showToast(msg)
    }
  }

  // Crear nueva cita en backend
  const createNewAppointment = async (newApt: AuxDayAppointment) => {
    try {
      // Usar los IDs proporcionados por el formulario
      let clientPetId = newApt.clientPetId

      // Si no se proporciona clientPetId, buscarlo basado en petId y clientId
      if (!clientPetId && newApt.petId && newApt.clientId) {
        const matchingCP = rawClientsPets.find(
          (cp) => cp.petId.toLowerCase() === newApt.petId?.toLowerCase() &&
                  cp.clientId.toLowerCase() === newApt.clientId?.toLowerCase()
        )
        clientPetId = matchingCP?.id
      }

      // Fallback al primer clientPet disponible
      if (!clientPetId) {
        clientPetId = rawClientsPets[0]?.id
      }

      const veterinarianId = newApt.veterinarianId || rawVets[0]?.id
      const serviceId = newApt.serviceId || rawServices[0]?.id

      // Preferir status 'AGENDADA'
      const agendadaStatus = rawStatuses.find((s) => s.name.toLowerCase().includes('agend')) || rawStatuses[0]
      const statusId = newApt.statusId || agendadaStatus?.id

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
    rawClientsPets,
    stats,
    isLoading,
    activeNotification,
    showToast,
    loadData,
    savePreparation,
    createNewAppointment,
  }
}

