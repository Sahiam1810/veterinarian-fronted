import { apiClient } from '@/services'
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
import type { ApiClientResponse } from '@/modules/superadmin/services/superAdminClientsService'
import type { ApiUserResponse } from '@/modules/superadmin/services/superAdminUserService'
import type { ApiClientPetResponse } from '@/modules/superadmin/services/superAdminClientsPetsService'
import type { ApiPetResponse } from '@/modules/superadmin/services/superAdminPetsService'
import type { ApiServiceResponse } from '@/modules/superadmin/services/superAdminVetServicesService'
import type { ApiVeterinarianResponse } from '@/modules/superadmin/services/superAdminVeterinariansService'
import type { ApiStatusAppointmentResponse, ApiRaceResponse } from '@/modules/superadmin/services/superAdminCatalogService'
import type { ApiAppointmentResponse, ApiCreateAppointmentRequest, ApiCreateAppointmentResponse } from '@/modules/superadmin/services/superAdminAppointmentsService'

const DEFAULT_TIME_SLOTS: RecepAgendaTimeSlot[] = [
  { id: '08:00', label: '08:00', displayLabel: '08:00 AM', available: true },
  { id: '08:30', label: '08:30', displayLabel: '08:30 AM', available: true },
  { id: '09:00', label: '09:00', displayLabel: '09:00 AM', available: true },
  { id: '09:30', label: '09:30', displayLabel: '09:30 AM', available: true },
  { id: '10:00', label: '10:00', displayLabel: '10:00 AM', available: true },
  { id: '10:30', label: '10:30', displayLabel: '10:30 AM', available: true },
  { id: '11:00', label: '11:00', displayLabel: '11:00 AM', available: true },
  { id: '11:30', label: '11:30', displayLabel: '11:30 AM', available: true },
  { id: '12:00', label: '12:00', displayLabel: '12:00 PM', available: true },
  { id: '14:00', label: '14:00', displayLabel: '02:00 PM', available: true },
  { id: '14:30', label: '14:30', displayLabel: '02:30 PM', available: true },
  { id: '15:00', label: '15:00', displayLabel: '03:00 PM', available: true },
  { id: '15:30', label: '15:30', displayLabel: '03:30 PM', available: true },
  { id: '16:00', label: '16:00', displayLabel: '04:00 PM', available: true },
  { id: '16:30', label: '16:30', displayLabel: '04:30 PM', available: true },
  { id: '17:00', label: '17:00', displayLabel: '05:00 PM', available: true },
  { id: '17:30', label: '17:30', displayLabel: '05:30 PM', available: true },
]

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

function mapStatus(rawStatus?: string | null): RecepAgendaDayAppointment['status'] {
  if (!rawStatus) return 'AGENDADO'
  const normalized = rawStatus.trim().toUpperCase()
  if (normalized.includes('CONSULT') || normalized.includes('CURSO') || normalized.includes('PROCES')) {
    return 'EN CONSULTORIO'
  }
  if (normalized.includes('ATEND') || normalized.includes('COMPLET') || normalized.includes('FINALIZ')) {
    return 'ATENDIDO'
  }
  if (normalized.includes('CANCEL') || normalized.includes('ANUL')) {
    return 'CANCELADO'
  }
  return 'AGENDADO'
}

// Carga el catálogo necesario para agendar citas desde la API
export async function fetchRecepAgendaCatalog(): Promise<RecepAgendaCatalogPayload> {
  const [clientsRes, usersRes, cpRes, petsRes, racesRes, servicesRes, vetsRes] = await Promise.allSettled([
    apiClient.get<ApiClientResponse[]>('/api/Clients'),
    apiClient.get<ApiUserResponse[]>('/api/Users'),
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<ApiPetResponse[]>('/api/Pets'),
    apiClient.get<ApiRaceResponse[]>('/api/Races'),
    apiClient.get<ApiServiceResponse[]>('/api/Services'),
    apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians'),
  ])

  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const users = usersRes.status === 'fulfilled' ? usersRes.value : []
  const clientPets = cpRes.status === 'fulfilled' ? cpRes.value : []
  const pets = petsRes.status === 'fulfilled' ? petsRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []
  const services = servicesRes.status === 'fulfilled' ? servicesRes.value : []
  const vets = vetsRes.status === 'fulfilled' ? vetsRes.value : []

  const usersMap = new Map(users.map((u) => [u.id.toLowerCase(), u]))
  const petsMap = new Map(pets.map((p) => [p.id.toLowerCase(), p]))
  const racesMap = new Map(races.map((r) => [r.id.toLowerCase(), r.name]))

  // Dueños disponibles
  const owners: RecepAgendaOwnerOption[] = clients.map((client) => {
    const user = usersMap.get(client.userId?.toLowerCase())
    return {
      id: client.id,
      name: user?.fullName || 'Cliente Sin Nombre',
      documentLabel: `CC ${client.identificationNumber || 'N/A'}`,
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
    timeSlots: DEFAULT_TIME_SLOTS,
  }
}

// Carga las citas registradas en una fecha dada
export async function fetchRecepDayAppointments(
  dateValue: string,
): Promise<RecepAgendaDayAppointment[]> {
  const [aptsRes, cpRes, petsRes, clientsRes, usersRes, servicesRes, vetsRes, statusesRes, racesRes] =
    await Promise.allSettled([
      apiClient.get<ApiAppointmentResponse[]>('/api/Appointments'),
      apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
      apiClient.get<ApiPetResponse[]>('/api/Pets'),
      apiClient.get<ApiClientResponse[]>('/api/Clients'),
      apiClient.get<ApiUserResponse[]>('/api/Users'),
      apiClient.get<ApiServiceResponse[]>('/api/Services'),
      apiClient.get<ApiVeterinarianResponse[]>('/api/Veterinarians'),
      apiClient.get<ApiStatusAppointmentResponse[]>('/api/StatusAppointments'),
      apiClient.get<ApiRaceResponse[]>('/api/Races'),
    ])

  const appointments = aptsRes.status === 'fulfilled' ? aptsRes.value : []
  const clientPets = cpRes.status === 'fulfilled' ? cpRes.value : []
  const pets = petsRes.status === 'fulfilled' ? petsRes.value : []
  const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : []
  const users = usersRes.status === 'fulfilled' ? usersRes.value : []
  const services = servicesRes.status === 'fulfilled' ? servicesRes.value : []
  const vets = vetsRes.status === 'fulfilled' ? vetsRes.value : []
  const statuses = statusesRes.status === 'fulfilled' ? statusesRes.value : []
  const races = racesRes.status === 'fulfilled' ? racesRes.value : []

  const cpMap = new Map(clientPets.map((cp) => [cp.id.toLowerCase(), cp]))
  const petsMap = new Map(pets.map((p) => [p.id.toLowerCase(), p]))
  const clientsMap = new Map(clients.map((c) => [c.id.toLowerCase(), c]))
  const usersMap = new Map(users.map((u) => [u.id.toLowerCase(), u]))
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
    const ownerUser = client ? usersMap.get(client.userId?.toLowerCase()) : undefined

    const petName = pet?.name || 'Paciente'
    const breed = pet ? racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo' : 'Mestizo'
    const ownerName = ownerUser?.fullName || 'Propietario'
    const professionalName = vetsMap.get(apt.veterinarianId?.toLowerCase()) || 'Dr. Roberto Silva'
    const service = apt.serviceName || servicesMap.get(apt.serviceId?.toLowerCase()) || 'Consulta General'
    const statusName = apt.statusName || statusesMap.get(apt.statusId?.toLowerCase())
    const status = mapStatus(statusName)

    return {
      id: apt.id,
      time: formatTimeString(apt.scheduledStart),
      endTime: formatTimeString(apt.scheduledEnd),
      petName,
      breed,
      ownerName,
      ownerPhone: '+57 300 000 0000',
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
  const [cpRes, availRes, statusRes] = await Promise.all([
    apiClient.get<ApiClientPetResponse[]>('/api/ClientsPets'),
    apiClient.get<Array<{ id: string }>>('/api/Availabilities').catch(() => []),
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

  const availabilityId = availRes[0]?.id || '11111111-1111-1111-1111-111111111111'
  const agendadoStatus = statusRes.find((s) => s.name?.toLowerCase().includes('agend')) || statusRes[0]
  const statusId = agendadoStatus?.id || '22222222-2222-2222-2222-222222222222'

  const [hours, minutes] = (form.timeSlotId || '09:00').split(':').map(Number)
  const dateObj = form.dateValue ? new Date(form.dateValue) : new Date()
  dateObj.setHours(hours || 9, minutes || 0, 0, 0)
  const startIso = dateObj.toISOString()

  const endDateObj = new Date(dateObj.getTime() + 30 * 60 * 1000)
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

  const matching = statuses.find((st) => st.name.toLowerCase().includes(statusName.toLowerCase()))
  const statusId = matching ? matching.id : statuses[0]?.id

  if (!statusId) throw new Error('No se pudo resolver el estado de la cita.')

  return apiClient.patch<void>(`/api/Appointments/${appointmentId}/status`, {
    statusAppointmentId: statusId,
    notes: `Estado actualizado a ${targetStatus} desde recepción`,
  })
}
