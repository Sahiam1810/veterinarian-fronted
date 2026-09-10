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
  ApiStatusAppointmentResponse,
  AuxAppointmentStatus,
  AuxPretriajeStatus,
} from '../types'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'
import {
  fetchAppointments,
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
} from '../services/auxCatalogosService'

export interface PreparacionCitaItem {
  id: string
  time: string
  petName: string
  petBreed: string
  petAge: string
  petId?: string
  clientPetId?: string
  ownerName: string
  service: string
  vetName: string
  appointmentStatus: AuxAppointmentStatus
  pretriajeStatus: AuxPretriajeStatus
  /** Alias for backward compatibility */
  status: 'Pendiente' | 'Realizado'
  lastWeight: string
  lastTemp: string
  avatarUrl?: string
  notes?: string
}

function mapAppointmentStatus(statusName?: string | null): AuxAppointmentStatus {
  if (!statusName) return 'Agendada'
  const norm = statusName.trim().toLowerCase()
  if (norm.includes('aten') || norm.includes('complet')) return 'Atendida'
  if (norm.includes('canc')) return 'Cancelada'
  if (norm.includes('no') || norm.includes('inasist') || norm.includes('asist')) return 'No asistió'
  if (norm.includes('espera')) return 'En espera'
  return 'Agendada'
}

export function useAuxPreparacion() {
  const [citas, setCitas] = useState<PreparacionCitaItem[]>([])
  const [rawAppointments, setRawAppointments] = useState<ApiAppointmentResponse[]>([])
  const [rawPets, setRawPets] = useState<ApiPetResponse[]>([])
  const [rawCP, setRawCP] = useState<ApiClientPetResponse[]>([])
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

      setRawAppointments(fetchedApts)
      setRawPets(fetchedPets)
      setRawCP(fetchedCP)

      const petsMap = new Map(fetchedPets.map((p) => [p.id.toLowerCase(), p]))
      const cpMap = new Map(fetchedCP.map((cp) => [cp.id.toLowerCase(), cp]))
      const clientsMap = new Map(fetchedClients.map((c) => [c.id.toLowerCase(), c]))
      const usersMap = new Map(fetchedUsers.map((u) => [u.id.toLowerCase(), u]))
      const speciesMap = new Map(fetchedSpecies.map((s) => [s.id.toLowerCase(), s.name]))
      const racesMap = new Map(fetchedRaces.map((r) => [r.id.toLowerCase(), r.name]))
      const servicesMap = new Map(fetchedServices.map((s) => [s.id.toLowerCase(), s.name]))
      const vetsMap = new Map(fetchedVets.map((v) => [v.id.toLowerCase(), v.userFullName || 'Veterinario']))
      const statusesMap = new Map(fetchedStatuses.map((st) => [st.id.toLowerCase(), st.name]))

      // Map medical records by appointmentId
      const recordsByApt = new Map<string, ApiMedicalRecordResponse>()
      for (const rec of fetchedRecords) {
        if (rec.appointmentId) {
          recordsByApt.set(rec.appointmentId.toLowerCase(), rec)
        }
      }

      const mapped: PreparacionCitaItem[] = fetchedApts.map((apt) => {
        const cp = cpMap.get(apt.clientPetId?.toLowerCase())
        const pet = cp ? petsMap.get(cp.petId.toLowerCase()) : undefined
        const client = cp ? clientsMap.get(cp.clientId.toLowerCase()) : undefined
        const ownerUser = client ? usersMap.get(client.userId.toLowerCase()) : undefined

        const petName = pet?.name || 'Mascota'
        const species = pet ? speciesMap.get(pet.speciesId?.toLowerCase()) || 'Canino' : 'Canino'
        const race = pet ? racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo' : 'Mestizo'
        const service = apt.serviceName || servicesMap.get(apt.serviceId?.toLowerCase()) || 'Consulta General'
        const vetName = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Veterinario'
        const rawStatusName = apt.statusName || statusesMap.get(apt.statusId?.toLowerCase())
        const appointmentStatus = mapAppointmentStatus(rawStatusName)

        const startDate = new Date(apt.scheduledStart)
        const time = !Number.isNaN(startDate.getTime())
          ? startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : '09:00 AM'

        const medRecord = recordsByApt.get(apt.id.toLowerCase())
        const hasMedRecord = Boolean(medRecord)
        const notes = (apt.notes || '').toLowerCase()
        const hasTriageNote = notes.includes('pre-triaje') || notes.includes('triaje') || notes.includes('peso:') || notes.includes('temp:')

        const isPretriajeDone = hasMedRecord || hasTriageNote
        const pretriajeStatus: AuxPretriajeStatus = isPretriajeDone ? 'Realizado' : 'Pendiente'

        const isCat = species.toLowerCase().includes('gato') || species.toLowerCase().includes('felin')

        const lastWeight = medRecord?.weightAtVisit != null
          ? String(medRecord.weightAtVisit)
          : pet?.weight != null
            ? String(pet.weight)
            : '15.0'

        const lastTemp = medRecord?.temperature != null
          ? String(medRecord.temperature)
          : '38.5'

        return {
          id: apt.id,
          time,
          petName,
          petBreed: race,
          petAge: pet ? `${pet.age} años` : '2 años',
          petId: pet?.id,
          clientPetId: apt.clientPetId,
          ownerName: ownerUser?.fullName || 'Propietario',
          service,
          vetName,
          appointmentStatus,
          pretriajeStatus,
          status: pretriajeStatus, // backward compatible
          lastWeight,
          lastTemp,
          notes: apt.notes || undefined,
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

  const savePretriaje = async (
    citaId: string,
    data: { weight: string; temp: string; obs?: string; vetNotes?: string }
  ) => {
    try {
      const targetApt = rawAppointments.find((a) => a.id.toLowerCase() === citaId.toLowerCase())
      if (!targetApt) {
        throw new Error('No se encontró la cita especificada.')
      }

      // Buscar mascota relacionada
      const targetCP = rawCP.find((cp) => cp.id.toLowerCase() === targetApt.clientPetId?.toLowerCase())
      const targetPet = targetCP ? rawPets.find((p) => p.id.toLowerCase() === targetCP.petId.toLowerCase()) : undefined

      const numWeight = data.weight ? parseFloat(data.weight) : null
      const numTemp = data.temp ? parseFloat(data.temp) : null

      // Obtener o seleccionar un diagnóstico válido para triaje
      const diagnostics = await fetchDiagnostics(false)
      const validDiagId = diagnostics[0]?.id || '00000000-0000-0000-0000-000000000000'

      const symptomsSummary = [
        data.obs ? `Pre-triaje: ${data.obs}` : 'Pre-triaje realizado por auxiliar',
        data.vetNotes ? `Nota para profesional: ${data.vetNotes}` : null,
      ]
        .filter(Boolean)
        .join(' | ')

      // 1. Guardar registro en MedicalRecords (fuente de verdad clínica)
      if (targetApt.clientPetId && validDiagId && validDiagId !== '00000000-0000-0000-0000-000000000000') {
        try {
          await createMedicalRecord({
            clientPetId: targetApt.clientPetId,
            appointmentId: targetApt.id,
            diagnosticId: validDiagId,
            symptoms: symptomsSummary,
            weightAtVisit: numWeight,
            temperature: numTemp,
          })
        } catch (recErr) {
          console.warn('No se pudo crear MedicalRecord directamente, continuando...', recErr)
        }
      }

      // 2. Actualizar peso actual de la mascota si se registró
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
          console.warn('No se pudo actualizar el peso en mascota, continuando...', petErr)
        }
      }

      // 3. Registrar notas de pre-triaje en la cita sin alterar su estado oficial
      const updatedNotes = [
        targetApt.notes,
        `[Pre-triaje] Peso: ${data.weight || '-'}kg, Temp: ${data.temp || '-'}°C`,
        data.obs ? `Obs: ${data.obs}` : null,
        data.vetNotes ? `Para Dr(a): ${data.vetNotes}` : null,
      ]
        .filter(Boolean)
        .join(' | ')

      await apiUpdateAppointment(targetApt.id, {
        clientPetId: targetApt.clientPetId,
        veterinarianId: targetApt.veterinarianId,
        serviceId: targetApt.serviceId,
        statusId: targetApt.statusId, // Preserva el estado oficial de la cita
        availabilityId: targetApt.availabilityId || undefined,
        scheduledStart: targetApt.scheduledStart,
        scheduledEnd: targetApt.scheduledEnd,
        notes: updatedNotes,
      })

      showToast('¡Pre-triaje guardado exitosamente en historia clínica!')
      await loadData()
    } catch (err) {
      console.error('Error al guardar pre-triaje', err)
      const msg = err instanceof Error ? err.message : 'Error al guardar pre-triaje'
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
    savePretriaje,
    savePreparada: savePretriaje, // Backward compatibility alias
  }
}

