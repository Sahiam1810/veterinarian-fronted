// Mock centralizado con forma del ERD (sustituir por respuestas API .NET)
import type {
  DbAccountStatement,
  DbAppointment,
  DbClient,
  DbClientPet,
  DbClientPortalProfile,
  DbMedicalRecord,
  DbPet,
  DbRace,
  DbService,
  DbSpecies,
  DbUser,
  DbVaccination,
  DbVeterinarian,
} from '../types/db.types'
import { DB_APPOINTMENT_STATUS } from '../utils/dbMappers'

const SPECIES: DbSpecies[] = [
  { species_id: 1, name: 'Perro' },
  { species_id: 2, name: 'Gato' },
]

const RACES: DbRace[] = [
  { race_id: 1, species_id: 1, name: 'Golden Retriever' },
  { race_id: 2, species_id: 2, name: 'Siamés' },
]

const USER: DbUser = {
  user_id: 101,
  role_id: 5,
  first_name: 'Mariana',
  last_name: 'Ruiz',
  email: 'cliente@huellitas.com',
  phone: '+57 300 123 4567',
  avatar_url: null,
  created_at: '2024-03-15T10:00:00',
  updated_at: '2026-08-01T10:00:00',
}

const CLIENT: DbClient = {
  client_id: 501,
  user_id: 101,
  identification_number: 'CC 52.345.678',
  address: 'Calle 45 #12-34, Bogotá',
  registration_date: '2024-03-15',
}

const ACCOUNT: DbAccountStatement = {
  account_statement_id: 9001,
  client_id: 501,
  balance_amount: 0,
  status_label: 'Sin Deuda',
  processed_at: '2026-08-20T08:00:00',
}

export const CLIENT_PETS: DbClientPet[] = [
  { client_pet_id: 1001, client_id: 501, pet_id: 201, is_primary_owner: true },
  { client_pet_id: 1002, client_id: 501, pet_id: 202, is_primary_owner: true },
]

export const PETS: DbPet[] = [
  {
    pet_id: 201,
    name: 'Max',
    species_id: 1,
    race_id: 1,
    age: 4,
    gender: 'M',
    weight_kg: 32.5,
    observations:
      'Max es un poco ansioso en la sala de espera. Le gustan mucho los premios de pollo. Presentó una leve alergia cutánea en verano pasado.',
    species: SPECIES[0],
    race: RACES[0],
  },
  {
    pet_id: 202,
    name: 'Luna',
    species_id: 2,
    race_id: 2,
    age: 2,
    gender: 'F',
    weight_kg: 4.2,
    observations:
      'Luna es tranquila en consulta. Requiere dieta hipoalergénica por alergia leve al pollo.',
    species: SPECIES[1],
    race: RACES[1],
  },
]

const SERVICES: DbService[] = [
  { service_id: 1, name: 'Consulta General' },
  { service_id: 2, name: 'Vacunación Anual (Séxtuple + Rabia)' },
  { service_id: 3, name: 'Revisión General' },
  { service_id: 4, name: 'Control felino' },
]

const VETS: DbVeterinarian[] = [
  {
    veterinarian_id: 301,
    user_id: 201,
    license_number: 'MV-12345',
    user: { first_name: 'Carlos', last_name: 'Mendoza' },
  },
  {
    veterinarian_id: 302,
    user_id: 202,
    license_number: 'MV-54321',
    user: { first_name: 'Ana', last_name: 'López' },
  },
  {
    veterinarian_id: 303,
    user_id: 203,
    license_number: 'MV-99887',
    user: { first_name: 'Roberto', last_name: 'Sánchez' },
  },
]

export const MOCK_APPOINTMENTS: DbAppointment[] = [
  {
    appointment_id: 4001,
    client_pet_id: 1001,
    veterinarian_id: 301,
    service_id: 2,
    status_id: DB_APPOINTMENT_STATUS.ATENDIDO,
    scheduled_start: '2023-12-20T16:30:00',
    scheduled_end: '2023-12-20T17:00:00',
    notes: 'Consultorio 3',
    service: SERVICES[1],
    veterinarian: VETS[0],
    client_pet: { ...CLIENT_PETS[0], pet: PETS[0] },
  },
  {
    appointment_id: 4002,
    client_pet_id: 1002,
    veterinarian_id: 302,
    service_id: 4,
    status_id: DB_APPOINTMENT_STATUS.AGENDADO,
    scheduled_start: '2026-09-02T09:00:00',
    scheduled_end: '2026-09-02T09:30:00',
    notes: 'Consultorio 1',
    service: SERVICES[3],
    veterinarian: VETS[1],
    client_pet: { ...CLIENT_PETS[1], pet: PETS[1] },
  },
  {
    appointment_id: 4003,
    client_pet_id: 1001,
    veterinarian_id: 301,
    service_id: 1,
    status_id: DB_APPOINTMENT_STATUS.AGENDADO,
    scheduled_start: '2023-10-24T10:30:00',
    scheduled_end: '2023-10-24T11:00:00',
    notes: 'Consultorio 2',
    service: SERVICES[0],
    veterinarian: VETS[0],
    client_pet: { ...CLIENT_PETS[0], pet: PETS[0] },
  },
  {
    appointment_id: 4004,
    client_pet_id: 1002,
    veterinarian_id: 301,
    service_id: 2,
    status_id: DB_APPOINTMENT_STATUS.AGENDADO,
    scheduled_start: '2023-10-24T16:00:00',
    scheduled_end: '2023-10-24T16:30:00',
    notes: 'Consultorio 2',
    service: SERVICES[1],
    veterinarian: VETS[0],
    client_pet: { ...CLIENT_PETS[1], pet: PETS[1] },
  },
  {
    appointment_id: 4005,
    client_pet_id: 1001,
    veterinarian_id: 303,
    service_id: 3,
    status_id: DB_APPOINTMENT_STATUS.ATENDIDO,
    scheduled_start: '2023-11-10T11:00:00',
    scheduled_end: '2023-11-10T11:30:00',
    notes: 'Consultorio 1',
    service: SERVICES[2],
    veterinarian: VETS[2],
    client_pet: { ...CLIENT_PETS[0], pet: PETS[0] },
  },
]

export const MOCK_MEDICAL_RECORDS: DbMedicalRecord[] = [
  {
    medical_record_id: 5001,
    appointment_id: 4005,
    client_pet_id: 1001,
    symptoms: 'Rascado excesivo de orejas',
    diagnosis: 'Otitis externa',
    treatment: 'Gotas óticas (7 días)',
    weight_at_visit: 32.1,
    temperature: 38.4,
    created_at: '2023-11-10T11:30:00',
    appointment: MOCK_APPOINTMENTS[4],
  },
  {
    medical_record_id: 5002,
    appointment_id: 4001,
    client_pet_id: 1001,
    symptoms: 'Chequeo anual y prevención de pulgas',
    diagnosis: 'Excelente estado de salud',
    treatment: 'Control en 6 meses',
    weight_at_visit: 32.5,
    temperature: 38.2,
    created_at: '2023-10-12T10:00:00',
  },
  {
    medical_record_id: 5003,
    appointment_id: null,
    client_pet_id: 1001,
    symptoms: 'Vómito esporádico',
    diagnosis: 'Gastroenteritis leve',
    treatment: 'Dieta blanda (5 días)',
    weight_at_visit: 31.8,
    temperature: 38.6,
    created_at: '2023-08-03T09:00:00',
  },
  {
    medical_record_id: 5004,
    appointment_id: null,
    client_pet_id: 1002,
    symptoms: 'Rascado frecuente y enrojecimiento en orejas',
    diagnosis: 'Alergia leve a pollo',
    treatment: 'Dieta hipoalergénica',
    weight_at_visit: 4.2,
    temperature: 38.1,
    created_at: '2023-09-20T15:00:00',
  },
]

export const MOCK_VACCINATIONS: DbVaccination[] = [
  {
    vaccination_id: 6001,
    client_pet_id: 1001,
    vaccine_name: 'Rabia',
    dose_number: 2,
    application_date: '2022-10-12',
    next_dose_date: '2024-10-12',
  },
  {
    vaccination_id: 6002,
    client_pet_id: 1001,
    vaccine_name: 'Parvovirus',
    dose_number: 1,
    application_date: '2023-03-05',
    next_dose_date: '2023-03-05',
  },
  {
    vaccination_id: 6003,
    client_pet_id: 1001,
    vaccine_name: 'Moquillo',
    dose_number: 2,
    application_date: '2024-01-18',
    next_dose_date: '2025-01-18',
  },
  {
    vaccination_id: 6004,
    client_pet_id: 1002,
    vaccine_name: 'Triple Felina',
    dose_number: 2,
    application_date: '2023-06-10',
    next_dose_date: '2024-06-10',
  },
]

export const MOCK_CLIENT_PROFILE: DbClientPortalProfile = {
  user: USER,
  client: CLIENT,
  account_statement: ACCOUNT,
  password_updated_at: '2026-05-15T10:00:00',
}

export function getDbPetById(petId: number): DbPet | undefined {
  return PETS.find((pet) => pet.pet_id === petId)
}

export function getDbClientPetByPetId(petId: number): DbClientPet | undefined {
  return CLIENT_PETS.find((link) => link.pet_id === petId)
}

export function getDbAppointmentsByClientPet(clientPetId: number): DbAppointment[] {
  return MOCK_APPOINTMENTS.filter((apt) => apt.client_pet_id === clientPetId)
}

export function getDbRecordsByClientPet(clientPetId: number): DbMedicalRecord[] {
  return MOCK_MEDICAL_RECORDS.filter((record) => record.client_pet_id === clientPetId)
}

export function getDbVaccinationsByClientPet(clientPetId: number): DbVaccination[] {
  return MOCK_VACCINATIONS.filter((vac) => vac.client_pet_id === clientPetId)
}

export function getDbNextUpcomingAppointment(): DbAppointment | null {
  const upcoming = MOCK_APPOINTMENTS.filter(
    (apt) =>
      apt.status_id === DB_APPOINTMENT_STATUS.AGENDADO ||
      apt.status_id === DB_APPOINTMENT_STATUS.CONFIRMADO,
  )
  upcoming.sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start))
  return upcoming[0] ?? null
}
