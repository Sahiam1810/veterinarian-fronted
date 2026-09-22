// Contratos de respuesta del backend usados por el módulo veterinario.

export interface ApiCurrentProfile {
  id: string
  fullName: string
  initials: string
  email: string
  role: string
  photoUrl?: string | null
}

export interface ApiAppointment {
  id: string
  clientPetId: string
  veterinarianId: string
  serviceId: string
  serviceName?: string | null
  statusId: string
  statusName?: string | null
  availabilityId: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string | null
  weight?: number | null
  temperature?: number | null
  heartRate?: number | null
  respiratoryRate?: number | null
  createdAt: string
}

export interface ApiVeterinarian {
  id: string
  userId: string
  userFullName?: string | null
  specialtyId: string
  specialtyName?: string | null
  licenseNumber: string
  createdAt: string
}

export interface ApiPet {
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

export interface ApiClient {
  id: string
  identificationNumber: string
  address?: string | null
  createdAt: string
  updatedAt?: string | null
  fullName: string
  email: string
  isActive: boolean
  phoneNumber: string
}

export interface ApiClientPet {
  id: string
  clientId: string
  petId: string
  isPrimaryOwner: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface ApiNamedCatalog {
  id: string
  name: string
}

// Franja recurrente semanal del veterinario.
export interface ApiAvailability {
  id: string
  veterinarianId: string
  veterinarianLicenseNumber?: string | null
  // Número 0-6 o nombre ("Monday") según serialización.
  dayOfWeek: number | string
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
}

export interface ApiNotification {
  id: string
  userId: string
  userFullName?: string | null
  appointmentId: string
  message: string
  sentAt: string
  status: string
  type: string
  createdAt: string
  updatedAt?: string | null
}

// Historia clínica y vacunas (Staff / ClinicalHistory).
export interface ApiMedicalRecord {
  id: string
  clientPetId: string
  appointmentId: string
  diagnosticId: string
  diagnosticCode?: string | null
  symptoms?: string | null
  treatment?: string | null
  weightAtVisit?: number | null
  temperature?: number | null
  createdAt: string
}

export interface ApiVaccination {
  id: string
  clientPetId: string
  recordId: string
  vaccineName: string
  doseNumber: number
  applicationDate: string
  nextDoseDate?: string | null
  createdAt: string
}
