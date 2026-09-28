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
import { NO_VET_AVAILABILITY_MESSAGE } from '../../superadmin/utils/resolveAvailabilityId.ts'
import { isAppointmentDateInThePast } from '../../superadmin/utils/appointmentDateGuard.ts'

interface ApiRecepAvailableSlot {
  availabilityId: string
  scheduledStartUtc: string
  scheduledEndUtc: string
  consultingRoom?: string | null
  shiftName?: string | null
}

function toLocalTimeParts(isoString: string): { id: string; displayLabel: string } {
  const date = new Date(isoString)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const id = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  const period = hours < 12 ? 'AM' : 'PM'
  const displayHour = hours % 12 === 0 ? 12 : hours % 12
  return {
    id,
    displayLabel: `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`,
  }
}

// scheduledStart llega en UTC (una cita de la noche en Bogotá puede caer en la
// fecha UTC del día siguiente); comparar por texto crudo contra la fecha local
// elegida descarta esas citas. Se compara por año/mes/día locales reales,
// mismo criterio que ya usa Veterinario (isScheduledToday/toDateKey).
function isSameLocalDate(iso: string, dateValue: string): boolean {
  const when = new Date(iso)
  if (Number.isNaN(when.getTime())) return false

  const [year, month, day] = dateValue.trim().slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return false

  return (
    when.getFullYear() === year &&
    when.getMonth() === month - 1 &&
    when.getDate() === day
  )
}

// S56: genera las franjas horarias a partir de la disponibilidad real
// configurada del veterinario para ese día de la semana, en vez de una lista
// fija -- y excluye del todo (no solo deshabilita) las horas que ya pasaron
// si la fecha elegida es hoy.
export async function fetchRecepAvailableTimeSlots(
  veterinarianId: string,
  dateKey: string,
  serviceId: string,
): Promise<RecepAgendaTimeSlot[]> {
  if (!veterinarianId || !dateKey || !serviceId) return []

  const query = new URLSearchParams({ veterinarianId, date: dateKey, serviceId })
  const slots = await apiClient.get<ApiRecepAvailableSlot[]>(
    `/api/Availabilities/available-slots?${query.toString()}`,
  )

  return slots
    .map((slot) => {
      const localTime = toLocalTimeParts(slot.scheduledStartUtc)
      return {
        id: localTime.id,
        label: localTime.id,
        displayLabel: localTime.displayLabel,
        available: true,
        availabilityId: slot.availabilityId,
        scheduledStartUtc: slot.scheduledStartUtc,
        scheduledEndUtc: slot.scheduledEndUtc,
      }
    })
    .filter((slot) => !isAppointmentDateInThePast(dateKey, slot.id))
    .sort((a, b) => a.id.localeCompare(b.id))
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
        speciesId: pet.speciesId,
        gender: pet.gender,
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

  // Filtrar por la fecha local indicada (no por texto crudo del UTC almacenado)
  const dayList = appointments.filter((apt) => {
    if (!apt.scheduledStart) return false
    return isSameLocalDate(apt.scheduledStart, dateValue)
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
      weightKg: apt.weight ?? null,
      temperature: apt.temperature ?? null,
      heartRate: apt.heartRate ?? null,
      respiratoryRate: apt.respiratoryRate ?? null,
      isPaid: apt.isPaid ?? false,
    }
  })
}

export { updateAppointmentVitals, type ApiAppointmentVitalsRequest } from '../../superadmin/services/superAdminAppointmentsService.ts'

// Crear una cita nueva en el backend
export async function createRecepAppointment(
  form: RecepAgendaFormState,
): Promise<ApiCreateAppointmentResponse> {
  const [cpRes, statusRes] = await Promise.all([
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments').catch(() => []),
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

  const availableSlots = await fetchRecepAvailableTimeSlots(
    form.professionalId,
    form.dateValue,
    form.serviceId,
  )
  const selectedSlot = availableSlots.find((slot) => slot.id === form.timeSlotId)
  if (!selectedSlot?.availabilityId || !selectedSlot.scheduledStartUtc || !selectedSlot.scheduledEndUtc) {
    throw new Error(NO_VET_AVAILABILITY_MESSAGE)
  }

  // S56: resuelve el bloque de disponibilidad real del veterinario para ese
  // día/horario (ya no se toma "el primero que exista" en todo el sistema).
  const availabilityId = selectedSlot.availabilityId

  // "YYYY-MM-DD" con new Date(string) se interpreta como medianoche UTC (desfasa el día
  // en zonas UTC negativas como Bogotá); se arma con año/mes/día locales, como ya hacen
  // useRecepAgenda.ts y RecepDayCalendarPanel.tsx en este mismo módulo.
  const startIso = selectedSlot.scheduledStartUtc
  const endIso = selectedSlot.scheduledEndUtc

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

// Nombres canónicos del catálogo STATUS_APPOINTMENTS (ver insert_all_seeds.sql).
const RECEP_STATUS_TO_CATALOG_NAME: Record<RecepAgendaDayAppointment['status'], string> = {
  'AGENDADO': 'AGENDADA',
  'EN ESPERA': 'CONFIRMADA',
  'EN CONSULTORIO': 'EN_PROGRESO',
  'ATENDIDO': 'ATENDIDA',
  'CANCELADO': 'CANCELADA',
  'NO ASISTIÓ': 'NO_ASISTIO',
}

// Actualizar el estado de una cita
export async function updateRecepAppointmentStatus(
  appointmentId: string,
  targetStatus: RecepAgendaDayAppointment['status'],
): Promise<void> {
  const statuses = await apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments')
  const catalogName = RECEP_STATUS_TO_CATALOG_NAME[targetStatus]

  const matching = statuses.find((st) => {
    const upper = (st.name || '').toUpperCase()
    if (upper === catalogName) return true
    if (catalogName === 'CONFIRMADA' && (upper.includes('CONFIRM') || upper.includes('ESPERA'))) return true
    return false
  })
  const statusId = matching?.id

  if (!statusId) throw new Error('No se pudo resolver el estado de la cita.')

  return apiClient.patch<void>(`/api/Appointments/${appointmentId}/status`, {
    statusId,
    comment: `Estado actualizado a ${targetStatus} desde recepción`,
  })
}

// AGENDADA → CONFIRMADA: la recepcionista marca que el paciente ya llegó
// (check-in). No requiere comentario, igual que las transiciones no terminales.
export async function checkInRecepAppointment(appointmentId: string): Promise<void> {
  return updateRecepAppointmentStatus(appointmentId, 'EN ESPERA')
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

// Interfaz para el recibo (puede moverse a types.ts si se prefiere)
export interface AppointmentReceiptResponse {
  petName: string
  ownerName: string
  ownerPhone?: string
  serviceName: string
  servicePrice: number
  scheduledStart: string
  isPaid: boolean
}

// Obtener recibo de la cita
export async function fetchAppointmentReceipt(appointmentId: string): Promise<AppointmentReceiptResponse> {
  return apiClient.get<AppointmentReceiptResponse>(`/api/Appointments/${appointmentId}/receipt`)
}

// Registrar pago de la cita
export async function registerRecepAppointmentPayment(appointmentId: string): Promise<void> {
  return apiClient.patch<void>(`/api/Appointments/${appointmentId}/register-payment`, {})
}
