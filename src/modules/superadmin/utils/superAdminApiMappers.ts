import type {
  EspecieMascota,
  SexoMascota,
  SuperAdminDueno,
  SuperAdminMascota,
  EstadoMascota,
} from '../types/mascotasSuperAdmin.types'
import type { ServicioSuperAdmin, EstadoServicio } from '../types/serviciosSuperAdmin.types'
import type { ProfesionalSuperAdmin, BloqueHorario, DiaSemana, EstadoProfesional } from '../types/profesionalesSuperAdmin.types'
import type { CitaSuperAdmin, EstadoCita } from '../types/agendaSuperAdmin.types'
import type { Appointment, AppointmentStatus, DashboardStats, PetType } from '../types/dashboardSuperAdmin.types'
import type { ApiSpeciesResponse, ApiRaceResponse } from '../services/superAdminCatalogService'
import type { ApiClientResponse } from '../services/superAdminClientsService'
import type { ApiPetResponse } from '../services/superAdminPetsService'
import type { ApiClientPetResponse } from '../services/superAdminClientsPetsService'
import type { ApiUserResponse } from '../services/superAdminUserService'
import type { ApiServiceResponse } from '../services/superAdminVetServicesService'
import type { ApiVeterinarianResponse } from '../services/superAdminVeterinariansService'
import type { ApiAvailabilityResponse } from '../services/superAdminAvailabilitiesService'
import type { ApiAppointmentResponse } from '../services/superAdminAppointmentsService'

const SPECIES_KEYWORDS: Record<string, string[]> = {
  Canino: ['canin', 'perro', 'dog'],
  Felino: ['felin', 'gato', 'cat'],
  Ave: ['ave', 'bird', 'loro'],
  Roedor: ['roed', 'hamster', 'cobay'],
  Exótico: ['exot', 'pez', 'reptil'],
  Otro: [],
}

const DAY_NAMES: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']

const DAY_TO_DOTNET: Record<DiaSemana, string> = {
  DOMINGO: 'Sunday',
  LUNES: 'Monday',
  MARTES: 'Tuesday',
  'MIÉRCOLES': 'Wednesday',
  JUEVES: 'Thursday',
  VIERNES: 'Friday',
  'SÁBADO': 'Saturday',
}

// Formatea fechas ISO a texto corto en español
export function formatDateEs(isoString?: string | null): string {
  if (!isoString) return 'Reciente'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Convierte género API (M/F) a etiqueta UI
export function mapGenderToSexo(gender: string): SexoMascota {
  return gender?.toUpperCase() === 'F' ? 'Hembra' : 'Macho'
}

export function mapSexoToGender(sexo: SexoMascota): string {
  return sexo === 'Hembra' ? 'F' : 'M'
}

// Mapea nombre de especie del catálogo a etiqueta UI (conserva el nombre real si ya viene de API)
export function mapSpeciesNameToEspecie(name: string): EspecieMascota {
  if (!name?.trim()) return 'Otro'
  const n = name.toLowerCase()
  if (n.includes('canin') || n.includes('perro')) return 'Canino'
  if (n.includes('felin') || n.includes('gato')) return 'Felino'
  if (n.includes('ave')) return 'Ave'
  if (n.includes('roed')) return 'Roedor'
  if (n.includes('exot') || n.includes('pez')) return 'Exótico'
  return name.trim()
}

// Busca ID de especie por nombre exacto o por palabras clave del formulario
export function findSpeciesId(especie: string, species: ApiSpeciesResponse[]): string {
  const normalized = especie.trim().toLowerCase()
  const exact = species.find((s) => s.name.toLowerCase() === normalized)
  if (exact) return exact.id

  const keywords = SPECIES_KEYWORDS[especie as EspecieMascota] ?? []
  const match = species.find((s) => keywords.some((k) => s.name.toLowerCase().includes(k)))
  return match?.id ?? species[0]?.id ?? ''
}

// Busca raza por nombre o devuelve la primera disponible
export function findRaceId(breed: string, races: ApiRaceResponse[]): string {
  const normalized = breed.trim().toLowerCase()
  const match = races.find((r) => r.name.toLowerCase() === normalized)
    ?? races.find((r) => r.name.toLowerCase().includes(normalized) || normalized.includes(r.name.toLowerCase()))
  return match?.id ?? races[0]?.id ?? ''
}

// Extrae edad numérica del texto del formulario
export function parseAgeToInt(age: string): number {
  const match = age.match(/\d+/)
  const value = match ? Number.parseInt(match[0], 10) : 1
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 150) : 1
}

// Extrae peso numérico del texto del formulario
export function parseWeightToDecimal(weight: string): number {
  const match = weight.replace(',', '.').match(/[\d.]+/)
  const value = match ? Number.parseFloat(match[0]) : 1
  return Number.isFinite(value) && value > 0 ? value : 1
}

// Mapea cliente + usuario a dueño para la UI
export function mapClientToDueno(
  client: ApiClientResponse,
  user: ApiUserResponse | undefined,
  mascotasSummary: string[] = []
): SuperAdminDueno {
  const status: EstadoMascota = user?.isActive === false ? 'Inactivo' : 'Activo'
  return {
    id: client.id,
    name: user?.fullName ?? 'Sin nombre',
    documentId: client.identificationNumber,
    email: user?.email ?? '',
    phone: '',
    address: client.address ?? '',
    city: '',
    status,
    registrationDate: formatDateEs(client.registrationDate),
    mascotasSummary,
  }
}

// Mapea mascota API con relaciones a modelo UI
export function mapPetToMascota(params: {
  pet: ApiPetResponse
  clientPet?: ApiClientPetResponse
  owner?: SuperAdminDueno
  speciesName?: string
  raceName?: string
}): SuperAdminMascota {
  const { pet, clientPet, owner, speciesName = '', raceName = '' } = params
  return {
    id: pet.id,
    name: pet.name,
    species: mapSpeciesNameToEspecie(speciesName),
    breed: raceName || 'Sin raza',
    age: `${pet.age} año${pet.age === 1 ? '' : 's'}`,
    sex: mapGenderToSexo(pet.gender),
    weight: `${pet.weight} kg`,
    ownerId: clientPet?.clientId ?? owner?.id ?? '',
    ownerName: owner?.name ?? 'Sin dueño',
    ownerPhone: owner?.phone ?? '',
    status: 'Activo',
    registrationDate: 'Reciente',
    notes: pet.observations ?? undefined,
    speciesId: pet.speciesId,
    raceId: pet.raceId,
    clientPetId: clientPet?.id,
  }
}

// Mapea servicio API a tarjeta UI
export function mapServiceToServicio(service: ApiServiceResponse): ServicioSuperAdmin {
  const status: EstadoServicio = service.isActive ? 'Activo' : 'Inactivo'
  return {
    id: service.id,
    name: service.name,
    description: service.typeServiceName ?? '',
    duration: service.durationMinutes,
    price: service.price,
    status,
    typeServiceId: service.typeServiceId,
  }
}

// Mapea veterinario API a profesional UI
export function mapVeterinarianToProfesional(
  vet: ApiVeterinarianResponse,
  user?: ApiUserResponse,
  horario: BloqueHorario[] = []
): ProfesionalSuperAdmin {
  const status: EstadoProfesional = user?.isActive === false ? 'Inactivo' : 'Activo'
  return {
    id: vet.id,
    name: vet.userFullName ?? user?.fullName ?? 'Profesional',
    cmp: vet.licenseNumber,
    especialidad: vet.specialtyName ?? 'General',
    email: user?.email ?? '',
    phone: '',
    status,
    horario,
    userId: vet.userId,
    specialtyId: vet.specialtyId,
  }
}

// Convierte día .NET (número o nombre) a etiqueta UI
export function mapDayOfWeekToDia(dow: number | string): DiaSemana {
  if (typeof dow === 'string') {
    const key = dow.toLowerCase()
    if (key.includes('monday')) return 'LUNES'
    if (key.includes('tuesday')) return 'MARTES'
    if (key.includes('wednesday')) return 'MIÉRCOLES'
    if (key.includes('thursday')) return 'JUEVES'
    if (key.includes('friday')) return 'VIERNES'
    if (key.includes('saturday')) return 'SÁBADO'
    return 'DOMINGO'
  }
  return DAY_NAMES[dow] ?? 'LUNES'
}

export function mapDiaToDayOfWeek(dia: DiaSemana): string {
  return DAY_TO_DOTNET[dia]
}

// Mapea disponibilidad API a bloque horario UI
export function mapAvailabilityToBloque(av: ApiAvailabilityResponse, specialtyLabel?: string): BloqueHorario {
  return {
    id: av.id,
    dia: mapDayOfWeekToDia(av.dayOfWeek),
    horaInicio: av.startTime.slice(0, 5),
    horaFin: av.endTime.slice(0, 5),
    tipoAtencion: specialtyLabel ?? 'Consulta General',
  }
}

// Mapea estado de cita API a enum de agenda
export function mapStatusToEstadoCita(statusName?: string | null): EstadoCita {
  const n = (statusName ?? '').toLowerCase()
  if (n.includes('espera') || n.includes('sala') || n.includes('curso')) return 'EN_ESPERA'
  if (n.includes('atend') || n.includes('complet')) return 'ATENDIDA'
  if (n.includes('cancel')) return 'CANCELADA'
  if (n.includes('no_asist') || n.includes('no asist') || n.includes('ausent')) return 'NO_ASISTIO'
  if (n.includes('bloq')) return 'BLOQUEO'
  return 'AGENDADA'
}

// Mapea estado de cita API a dashboard
export function mapStatusToAppointmentStatus(statusName?: string | null): AppointmentStatus {
  const n = (statusName ?? '').toLowerCase()
  if (n.includes('espera') || n.includes('sala')) return 'En sala'
  if (n.includes('atend') || n.includes('complet')) return 'Atendido'
  if (n.includes('cancel')) return 'Cancelado'
  return 'Agendado'
}

function toDateKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toTimeLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function toTime24(iso: string): string {
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

// Mapea cita API con datos enriquecidos a modelo de agenda
export function mapAppointmentToCita(
  apt: ApiAppointmentResponse,
  context: {
    petName?: string
    petBreed?: string
    species?: string
    ownerName?: string
    professionalName?: string
  } = {}
): CitaSuperAdmin {
  return {
    id: apt.id,
    dateKey: toDateKey(apt.scheduledStart),
    startTime: toTime24(apt.scheduledStart),
    endTime: toTime24(apt.scheduledEnd),
    status: mapStatusToEstadoCita(apt.statusName),
    petName: context.petName,
    petBreed: context.petBreed,
    species: context.species,
    ownerName: context.ownerName,
    professionalId: apt.veterinarianId,
    professionalName: context.professionalName,
    service: apt.serviceName ?? undefined,
    notes: apt.notes ?? undefined,
    clientPetId: apt.clientPetId,
    serviceId: apt.serviceId,
    statusId: apt.statusId,
    availabilityId: apt.availabilityId,
  }
}

// Mapea cita API a tarjeta del dashboard de inicio
export function mapAppointmentToDashboard(
  apt: ApiAppointmentResponse,
  context: { petName?: string; species?: string; professionalName?: string } = {}
): Appointment {
  const species = context.species ?? 'Otro'
  const petType: PetType | string =
    species.toLowerCase().includes('gato') || species.toLowerCase().includes('felin')
      ? 'Gato'
      : species.toLowerCase().includes('perro') || species.toLowerCase().includes('canin')
        ? 'Perro'
        : species.toLowerCase().includes('ave')
          ? 'Ave'
          : 'Otro'

  return {
    id: apt.id,
    time: toTimeLabel(apt.scheduledStart),
    petName: context.petName ?? 'Mascota',
    petType,
    service: apt.serviceName ?? 'Servicio',
    professional: context.professionalName ?? 'Profesional',
    status: mapStatusToAppointmentStatus(apt.statusName),
  }
}

// Calcula KPIs del dashboard a partir de citas y profesionales
export function buildDashboardStats(
  appointments: ApiAppointmentResponse[],
  activeProfessionals: number
): DashboardStats {
  const total = appointments.length
  const attended = appointments.filter((a) => mapStatusToAppointmentStatus(a.statusName) === 'Atendido').length
  const cancelled = appointments.filter((a) => mapStatusToAppointmentStatus(a.statusName) === 'Cancelado').length
  const attendedPercentage = total > 0 ? Math.round((attended / total) * 100) : 0

  return {
    totalAppointments: total,
    attendedAppointments: attended,
    attendedPercentage,
    cancelledAppointments: cancelled,
    activeProfessionals,
    formattedDate: new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  }
}

// Genera los 7 días de la semana actual para la vista de agenda
export function buildCurrentWeekDays(): { label: string; dateKey: string; num: number }[] {
  const today = new Date()
  const day = today.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return labels.map((label, index) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + index)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const num = d.getDate()
    const dateKey = `${y}-${m}-${String(num).padStart(2, '0')}`
    return { label, dateKey, num }
  })
}
