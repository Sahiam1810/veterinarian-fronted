// Tipos de Mascotas y Dueños para el módulo de Administración

export type EspecieMascota = 'Canino' | 'Felino' | 'Ave' | 'Roedor' | 'Exótico' | 'Otro'
export type SexoMascota = 'Macho' | 'Hembra'
export type EstadoMascota = 'Activo' | 'Inactivo'

export interface AdminMascota {
  id: string
  name: string
  photoUrl?: string
  species: EspecieMascota
  breed: string
  age: string
  sex: SexoMascota
  weight: string
  ownerId: string
  ownerName: string
  ownerPhone: string
  status: EstadoMascota
  registrationDate: string
  notes?: string
}

export interface AdminDueno {
  id: string
  name: string
  documentId: string
  email: string
  phone: string
  address: string
  city: string
  status: EstadoMascota
  registrationDate: string
  mascotasSummary?: string[]
}

export interface MascotaFormData {
  name: string
  species: EspecieMascota
  breed: string
  age: string
  sex: SexoMascota
  weight: string
  ownerId: string
  status: EstadoMascota
  photoUrl?: string
  notes?: string
}

export interface DuenoFormData {
  name: string
  documentId: string
  email: string
  phone: string
  address: string
  city: string
  status: EstadoMascota
}

export interface MascotaFilters {
  searchQuery: string
  speciesFilter: string
  statusFilter: string
}

export interface DuenoFilters {
  searchQuery: string
  statusFilter: string
}
