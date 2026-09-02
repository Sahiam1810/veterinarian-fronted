// ===== Tipos UI Auxiliar =====
export type AuxAppointmentStatus = 'Pendiente' | 'Preparada' | 'En Espera' | 'Atendida' | 'Cancelado' | 'Agendado'

export interface AuxStatSummary {
  citasDelDia: number
  pendientesPrep: number
  proximas: number
  preparadas: number
}

export interface AuxDayAppointment {
  id: string
  time: string
  petName: string
  petInitial?: string
  avatarColor?: 'peach' | 'brand' | 'sage' | 'terracotta'
  speciesBreed: string
  service: string
  professional: string
  status: AuxAppointmentStatus
  ownerName?: string
  notes?: string
  rawAppointmentId?: string
  statusId?: string
  clientPetId?: string
  veterinarianId?: string
  serviceId?: string
}

export interface AuxHomeDashboard {
  greeting: string
  formattedDate: string
  stats: AuxStatSummary
  appointments: AuxDayAppointment[]
}

// ===== DTOs Backend (API Contracts) =====

export interface ApiAppointmentResponse {
  id: string
  clientPetId: string
  veterinarianId: string
  serviceId: string
  serviceName?: string | null
  statusId: string
  statusName?: string | null
  availabilityId?: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string | null
  createdAt: string
}

export interface ApiCreateAppointmentRequest {
  clientPetId: string
  veterinarianId: string
  serviceId: string
  statusId: string
  availabilityId?: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string | null
}

export interface ApiUpdateAppointmentRequest {
  clientPetId: string
  veterinarianId: string
  serviceId: string
  statusId: string
  availabilityId?: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string | null
}

export interface ApiPetResponse {
  id: string
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
}

export interface ApiCreatePetRequest {
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
}

export interface ApiUpdatePetRequest {
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
}

export interface ApiClientPetResponse {
  id: string
  clientId: string
  petId: string
  isPrimaryOwner: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface ApiCreateClientPetRequest {
  clientId: string
  petId: string
  isPrimaryOwner: boolean
}

export interface ApiClientResponse {
  id: string
  userId: string
  identificationNumber: string
  address?: string | null
  registrationDate: string
  createdAt: string
  updatedAt?: string | null
}

export interface ApiVeterinarianResponse {
  id: string
  userId: string
  userFullName?: string | null
  specialtyId: string
  specialtyName?: string | null
  licenseNumber: string
  createdAt: string
}

export interface ApiServiceResponse {
  id: string
  typeServiceId: string
  typeServiceName?: string | null
  name: string
  durationMinutes: number
  price: number
  isActive: boolean
  createdAt: string
}

export interface ApiSpeciesResponse {
  id: string
  name: string
}

export interface ApiRaceResponse {
  id: string
  name: string
}

export interface ApiStatusAppointmentResponse {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export interface ApiAvailabilityResponse {
  id: string
  veterinarianId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

