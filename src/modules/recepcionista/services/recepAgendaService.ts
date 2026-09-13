import { apiClient } from '../../../services/apiClient.ts'
import type {
  RecepAgendaCatalogPayload,
  RecepAgendaDayAppointment,
  RecepAgendaFormState,
  RecepAgendaOwnerOption,
  RecepAgendaPetOption,
  RecepAgendaProfessionalOption,
  RecepAgendaServiceOption,
  RecepAgendaTimeSlot,
} from '../types'
import { mapRecepAgendaStatus } from '../types/agenda.types.ts'
import type { ApiClientResponse } from '@/modules/superadmin/services/superAdminClientsService'

import type { ApiClientPetResponse } from '@/modules/superadmin/services/superAdminClientsPetsService'
import type { ApiPetResponse } from '@/modules/superadmin/services/superAdminPetsService'
import type { ApiServiceResponse } from '@/modules/superadmin/services/superAdminVetServicesService'
import type { ApiVeterinarianResponse } from '@/modules/superadmin/services/superAdminVeterinariansService'
import type { ApiStatusAppointmentResponse, ApiRaceResponse } from '@/modules/superadmin/services/superAdminCatalogService'
import type { ApiAppointmentResponse, ApiCreateAppointmentRequest, ApiCreateAppointmentResponse } from '@/modules/superadmin/services/superAdminAppointmentsService'
import { fetchAvailabilitiesByVeterinarian, type ApiAvailabilityResponse } from '../../superadmin/services/superAdminAvailabilitiesService.ts'
import { dayOfWeekFromDateKey, findMatchingAvailabilityId, NO_VET_AVAILABILITY_MESSAGE } from '../../superadmin/utils/resolveAvailabilityId.ts'
import { isAppointmentDateInThePast } from '../../superadmin/utils/appointmentDateGuard.ts'

const SLOT_DURATION_MINUTES = 30

function toMinutes(hm: string): number {
  const [h, m] = hm.trim().slice(0, 5).split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function minutesToHm(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function toDisplayLabel(hm: string): string {
  const [h, m] = hm.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

// S56: genera las franjas horarias a partir de la disponibilidad real
// configurada del veterinario para ese día de la semana, en vez de una lista
// fija -- y excluye del todo (no solo deshabilita) las horas que ya pasaron
// si la fecha elegida es hoy.
export async function fetchRecepAvailableTimeSlots(
  veterinarianId: string,
  dateKey: string,
): Promise<RecepAgendaTimeSlot[]> {
  if (!veterinarianId || !dateKey) return []

  const availabilities = await fetchAvailabilitiesByVeterinarian(veterinarianId).catch(
    () => [] as ApiAvailabilityResponse[],
  )
  const day = dayOfWeekFromDateKey(dateKey)

  const blocks = availabilities.filter((item) => {
    const dow = typeof item.dayOfWeek === 'string' ? Number(item.dayOfWeek) : item.dayOfWeek
    return item.isActive && Number(dow) === day
  })

  const seen = new Set<string>()
  const slots: RecepAgendaTimeSlot[] = []

  for (const block of blocks) {
    const start = toMinutes(block.startTime)
    const end = toMinutes(block.endTime)
    for (let mins = start; mins + SLOT_DURATION_MINUTES <= end; mins += SLOT_DURATION_MINUTES) {
      const hm = minutesToHm(mins)
      if (seen.has(hm) || isAppointmentDateInThePast(dateKey, hm)) continue
      seen.add(hm)
      slots.push({ id: hm, label: hm, displayLabel: toDisplayLabel(hm), available: true })
    }
  }

  return slots.sort((a, b) => a.id.localeCompare(b.id))
}

function formatTimeString(isoString: string): string {
  try {
    const d = new Date(isoString)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return '09:00'
  }
}

export async function fetchRecepAgendaCatalog(): Promise<RecepAgendaCatalogPayload> {
  const [clientsRes, cpRes, petsRes, racesRes, servicesRes, vetsRes] = await Promise.allSettled([
    apiClient.get<ApiClientResponse[]>('/api/Clients'),
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<ApiPetResponse[]>('/api/Pets'),
    apiClient.get<ApiRaceResponse[]>('/api/Races'),
    apiClient.get<ApiServiceResponse[]>('/api/Services'),
    apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians'),
  ])

  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const clientPets = cpRes.status === 'fulfilled' ? cpRes.value : []
  const pets = petsRes.status === 'fulfilled' ? petsRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []
  const services = servicesRes.status === 'fulfilled' ? servicesRes.value : []
  const vets = vetsRes.status === 'fulfilled' ? vetsRes.value : []

  const petsMap = new Map(pets.map((p) => [p.id.toLowerCase(), p]))
  const racesMap = new Map(races.map((r) => [r.id.toLowerCase(), r.name]))

  // Dueños disponibles — nombre resuelto desde client.fullName (sin cruce /api/Users)
  const owners: RecepAgendaOwnerOption[] = clients.map((client) => {
    return {
      id: client.id,
      name: client.fullName || 'Cliente Sin Nombre',
      documentLabel: `CC ${client.identificationNumber || 'N/A'}`,
      phone: client.phoneNumber || '',
      identificationNumber: client.identificationNumber || '',
    }
  })


  // Mascotas por dueño
  const petsOptions: RecepAgendaPetOption[] = clientPets
    .map((cp) => {
      const pet = petsMap.get(cp.petId?.toLowerCase())
      if (!pet) return null
      return {
        id: pet.id,
        ownerId: cp.clientId,
        name: pet.name,
        breed: racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo',
      }
    })
    .filter((p): p is RecepAgendaPetOption => p !== null)

  // Servicios
  const servicesOptions: RecepAgendaServiceOption[] = services.map((s) => ({
    id: s.id,
    label: s.name,
  }))

  // Profesionales / Veterinarios
  const professionals: RecepAgendaProfessionalOption[] = vets.map((v) => ({
    id: v.id,
    name: v.userFullName || 'Veterinario Asignado',
    roleLabel: 'Veterinario',
  }))

  return {
    owners,
    pets: petsOptions,
    services: servicesOptions.length > 0 ? servicesOptions : [{ id: 'srv-general', label: 'Consulta General' }],
    professionals: professionals.length > 0 ? professionals : [{ id: 'pro-default', name: 'Dr. Roberto Silva', roleLabel: 'Veterinario' }],
  }
}

// Carga las citas registradas en una fecha dada
export async function fetchRecepDayAppointments(
  dateValue: string,
): Promise<RecepAgendaDayAppointment[]> {
  const [aptsRes, cpRes, petsRes, clientsRes, servicesRes, vetsRes, statusesRes, racesRes] =
    await Promise.allSettled([
      apiClient.get<ApiAppointmentResponse[]>('/api/Appointments'),
      apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
      apiClient.get<ApiPetResponse[]>('/api/Pets'),
      apiClient.get<ApiClientResponse[]>('/api/Clients'),
      apiClient.get<ApiServiceResponse[]>('/api/Services'),
      apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians'),
      apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments'),
      apiClient.get<ApiRaceResponse[]>('/api/Races'),
    ])

  const appointments = aptsRes.status === 'fulfilled' ? aptsRes.value : []
  const clientPets = cpRes.status === 'fulfilled' ? cpRes.value : []
  const pets = petsRes.status === 'fulfilled' ? petsRes.value : []
  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const services = servicesRes.status === 'fulfilled' ? servicesRes.value : []
  const vets = vetsRes.status === 'fulfilled' ? vetsRes.value : []
  const statuses = statusesRes.status === 'fulfilled' ? statusesRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []

  const cpMap = new Map(clientPets.map((cp) => [cp.id.toLowerCase(), cp]))
  const petsMap = new Map(pets.map((p) => [p.id.toLowerCase(), p]))
  const clientsMap = new Map(clients.map((c) => [c.id.toLowerCase(), c]))
  const servicesMap = new Map(services.map((s) => [s.id.toLowerCase(), s.name]))
  const vetsMap = new Map(vets.map((v) => [v.id.toLowerCase(), v.userFullName || 'Veterinario']))
  const statusesMap = new Map(statuses.map((st) => [st.id.toLowerCase(), st.name]))
  const racesMap = new Map(races.map((r) => [r.id.toLowerCase(), r.name]))

  // Filtrar por la fecha indicada
  const targetPrefix = dateValue.trim().slice(0, 10)

  const dayList = appointments.filter((apt) => {
    if (!apt.scheduledStart) return false
    return apt.scheduledStart.startsWith(targetPrefix)
  })

  return dayList.map((apt) => {
    const cp = cpMap.get(apt.clientPetId?.toLowerCase())
    const pet = cp ? petsMap.get(cp.petId?.toLowerCase()) : undefined
    const client = cp ? clientsMap.get(cp.clientId?.toLowerCase()) : undefined

    const petName = pet?.name || 'Paciente'
    const breed = pet ? racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo' : 'Mestizo'
    const ownerName = client?.fullName || 'Propietario'
    const professionalName = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Dr. Roberto Silva'
    const service = apt.serviceName || servicesMap.get(apt.serviceId?.toLowerCase()) || 'Consulta General'
    const statusName = apt.statusName || statusesMap.get(apt.statusId?.toLowerCase())
    const status = mapRecepAgendaStatus(statusName)

    return {
      id: apt.id,
      time: formatTimeString(apt.scheduledStart),
      endTime: formatTimeString(apt.scheduledEnd),
      petName,
      breed,
      ownerName,
      ownerPhone: client?.phoneNumber || '',
      professionalName,
      service,
      notes: apt.notes || undefined,
      status,
    }
  })
}

// Crear una cita nueva en el backend
export async function createRecepAppointment(
  form: RecepAgendaFormState,
): Promise<ApiCreateAppointmentResponse> {
  const [cpRes, statusRes, availabilities] = await Promise.all([
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments').catch(() => []),
    fetchAvailabilitiesByVeterinarian(form.professionalId).catch(() => [] as ApiAvailabilityResponse[]),
  ])

  // Buscar o resolver el clientPetId correspondiente al cliente y la mascota
  const matchingCp = cpRes.find(
    (cp) =>
      cp.clientId?.toLowerCase() === form.ownerId.toLowerCase() &&
      cp.petId?.toLowerCase() === form.petId.toLowerCase(),
  )

  const clientPetId = matchingCp ? matchingCp.id : cpRes[0]?.id
  if (!clientPetId) {
    throw new Error('No se encontró el vínculo entre el dueño y la mascota seleccionados.')
  }

  const agendadoStatus = statusRes.find((s) => s.name?.toLowerCase().includes('agend')) || statusRes[0]
  const statusId = agendadoStatus?.id || '22222222-2222-2222-2222-222222222222'

  const startTime = form.timeSlotId || '09:00'
  const endTime = minutesToHm(toMinutes(startTime) + SLOT_DURATION_MINUTES)

  // S56: resuelve el bloque de disponibilidad real del veterinario para ese
  // día/horario (ya no se toma "el primero que exista" en todo el sistema).
  const availabilityId = findMatchingAvailabilityId(availabilities, form.dateValue, startTime, endTime)
  if (!availabilityId) {
    throw new Error(NO_VET_AVAILABILITY_MESSAGE)
  }

  // "YYYY-MM-DD" con new Date(string) se interpreta como medianoche UTC (desfasa el día
  // en zonas UTC negativas como Bogotá); se arma con año/mes/día locales, como ya hacen
  // useRecepAgenda.ts y RecepDayCalendarPanel.tsx en este mismo módulo.
  const [hours, minutes] = startTime.split(':').map(Number)
  const dateObj = form.dateValue
    ? (() => {
        const [year, month, day] = form.dateValue.split('-').map(Number)
        return new Date(year, month - 1, day)
      })()
    : new Date()
  dateObj.setHours(hours || 9, minutes || 0, 0, 0)
  const startIso = dateObj.toISOString()

  const endDateObj = new Date(dateObj.getTime() + SLOT_DURATION_MINUTES * 60 * 1000)
  const endIso = endDateObj.toISOString()

  const payload: ApiCreateAppointmentRequest = {
    clientPetId,
    veterinarianId: form.professionalId,
    serviceId: form.serviceId,
    statusId,
    availabilityId,
    scheduledStart: startIso,
    scheduledEnd: endIso,
    notes: form.notes || 'Cita agendada por recepción',
  }

  return apiClient.post<ApiCreateAppointmentResponse>('/api/Appointments', payload)
}

// Actualizar el estado de una cita
export async function updateRecepAppointmentStatus(
  appointmentId: string,
  targetStatus: RecepAgendaDayAppointment['status'],
): Promise<void> {
  const statuses = await apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments')
  let statusName = 'Agendado'
  if (targetStatus === 'EN CONSULTORIO') statusName = 'En Espera'
  if (targetStatus === 'ATENDIDO') statusName = 'Atendido'
  if (targetStatus === 'CANCELADO') statusName = 'Cancelado'
  if (targetStatus === 'NO ASISTIÓ') statusName = 'NO_ASISTIO'

  const matching = statuses.find((st) => st.name.toLowerCase().includes(statusName.toLowerCase()))
  const statusId = matching ? matching.id : statuses[0]?.id

  if (!statusId) throw new Error('No se pudo resolver el estado de la cita.')

  return apiClient.patch<void>(`/api/Appointments/${appointmentId}/status`, {
    statusId,
    comment: `Estado actualizado a ${targetStatus} desde recepción`,
  })
}

// AGENDADA → NO_ASISTIO con comentario obligatorio (mismo endpoint que veterinario).
export async function markRecepAppointmentNoAsistio(appointmentId: string): Promise<void> {
  const statuses = await apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments')
  const matching = statuses.find((st) => {
    const name = st.name.toLowerCase()
    return name.includes('no_asist') || name.includes('no asist')
  })
  const statusId = matching?.id
  if (!statusId) throw new Error('No hay estado NO_ASISTIO en el catálogo.')

  return apiClient.patch<void>(`/api/Appointments/${appointmentId}/status`, {
    statusId,
    comment: 'Marcada como No asistió desde agenda de recepción',
  })
}
