// Tipos alineados al ERD Oracle/API (.NET). Fuente de verdad para integración backend.

export interface DbUser {
  user_id: number
  role_id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface DbClient {
  client_id: number
  user_id: number
  identification_number: string
  address: string | null
  registration_date: string
}

export interface DbSpecies {
  species_id: number
  name: string
}

export interface DbRace {
  race_id: number
  species_id: number
  name: string
}

export interface DbClientPet {
  client_pet_id: number
  client_id: number
  pet_id: number
  is_primary_owner: boolean
}

export interface DbPet {
  pet_id: number
  name: string
  species_id: number
  race_id: number
  age: number | null
  gender: string | null
  weight_kg: number | null
  observations: string | null
  species?: DbSpecies
  race?: DbRace
}

export interface DbStatusAppointment {
  status_id: number
  name: string
}

export interface DbService {
  service_id: number
  name: string
  description?: string | null
}

export interface DbVeterinarian {
  veterinarian_id: number
  user_id: number
  license_number?: string | null
  user?: Pick<DbUser, 'first_name' | 'last_name'>
}

export interface DbAppointment {
  appointment_id: number
  client_pet_id: number
  veterinarian_id: number
  service_id: number
  status_id: number
  scheduled_start: string
  scheduled_end: string
  notes: string | null
  status?: DbStatusAppointment
  service?: DbService
  veterinarian?: DbVeterinarian
  client_pet?: DbClientPet & { pet?: DbPet }
}

export interface DbMedicalRecord {
  medical_record_id: number
  appointment_id: number | null
  client_pet_id: number
  symptoms: string | null
  diagnosis: string | null
  treatment: string | null
  weight_at_visit: number | null
  temperature: number | null
  created_at: string
  appointment?: DbAppointment
}

export interface DbVaccination {
  vaccination_id: number
  client_pet_id: number
  vaccine_name: string
  dose_number: number | null
  application_date: string
  next_dose_date: string | null
}

export interface DbAccountStatement {
  account_statement_id: number
  client_id: number
  balance_amount: number
  status_label: string
  processed_at: string
}

export interface DbClientPortalProfile {
  user: DbUser
  client: DbClient
  account_statement: DbAccountStatement | null
  password_updated_at: string | null
}
