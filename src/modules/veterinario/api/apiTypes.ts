// Contratos de respuesta del backend usados por el módulo veterinario.

export interface ApiCurrentProfile {
  personId: string
  userAccountId: string
  fullName: string
  initials: string
  userName: string
  email: string
  role: string
  accountStatus: string
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
}

export interface ApiClient {
  id: string
  userId: string
  identificationNumber: string
  address?: string | null
  registrationDate: string
  createdAt: string
  updatedAt?: string | null
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
