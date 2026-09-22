// ===== Tipos UI Auxiliar =====
export type AuxAppointmentStatus = 'Agendada' | 'Atendida' | 'Cancelada' | 'No asistió' | 'En espera'

export interface AuxStatSummary {
  citasDelDia: number
  atendidas: number
  proximas?: number
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
  petId?: string
  veterinarianId?: string
  serviceId?: string
  weightKg?: number | null
  temperature?: number | null
  heartRate?: number | null
  respiratoryRate?: number | null
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
  weightKg?: number | null
  temperature?: number | null
  heartRate?: number | null
  respiratoryRate?: number | null
  createdAt: string
}

export interface ApiAppointmentVitalsRequest {
  weightKg?: number | null
  temperature?: number | null
  heartRate?: number | null
  respiratoryRate?: number | null
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
  requesterPhoneNumber?: string | null
  consultingRoom?: string | null
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
  photoUrl?: string | null
}

export interface ApiCreatePetRequest {
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
  photoUrl?: string | null
}

export interface ApiUpdatePetRequest {
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
  photoUrl?: string | null
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
  identificationNumber: string
  fullName: string
  email: string
  isActive: boolean
  phoneNumber: string
  address?: string | null
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
  // FK a especie
  speciesId: string
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

export interface ApiAvailableSlotResponse {
  availabilityId: string
  scheduledStartUtc: string
  scheduledEndUtc: string
  consultingRoom?: string | null
  shiftName?: string | null
}


