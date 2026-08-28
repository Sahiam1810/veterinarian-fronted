import type { ClienteAppointmentStatus } from '../types'
import type {
  DbAccountStatement,
  DbAppointment,
  DbClientPortalProfile,
  DbMedicalRecord,
  DbPet,
  DbVaccination,
} from '../types/db.types'

// IDs de status_appointments (ajustar cuando el backend confirme catálogo)
export const DB_APPOINTMENT_STATUS = {
  AGENDADO: 1,
  CONFIRMADO: 2,
  ATENDIDO: 3,
  CANCELADO: 4,
} as const

const STATUS_BY_ID: Record<number, ClienteAppointmentStatus> = {
  [DB_APPOINTMENT_STATUS.AGENDADO]: 'AGENDADO',
  [DB_APPOINTMENT_STATUS.CONFIRMADO]: 'CONFIRMADO',
  [DB_APPOINTMENT_STATUS.ATENDIDO]: 'ATENDIDO',
  [DB_APPOINTMENT_STATUS.CANCELADO]: 'CANCELADO',
}

const STATUS_LABEL: Record<ClienteAppointmentStatus, string> = {
  AGENDADO: 'Agendada',
  CONFIRMADO: 'Confirmada',
  ATENDIDO: 'Atendida',
  CANCELADO: 'Cancelada',
}

export function mapDbAppointmentStatus(statusId: number): ClienteAppointmentStatus {
  return STATUS_BY_ID[statusId] ?? 'AGENDADO'
}

export function mapDbAppointmentStatusLabel(status: ClienteAppointmentStatus): string {
  return STATUS_LABEL[status]
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTimeLabel(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateTimeLabel(isoDate: string): string {
  return `${formatDateLabel(isoDate)}, ${formatTimeLabel(isoDate)}`
}

function formatFullName(firstName?: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim()
}

function formatSpeciesBreed(pet?: DbPet): string {
  if (!pet) return ''
  const species = pet.species?.name ?? 'Mascota'
  const race = pet.race?.name ?? ''
  return race ? `${species} • ${race}` : species
}

function formatGender(gender: string | null | undefined): string {
  if (!gender) return 'No registrado'
  const normalized = gender.toLowerCase()
  if (normalized.startsWith('m')) return 'Macho'
  if (normalized.startsWith('f')) return 'Hembra'
  return gender
}

export function mapDbProfileToUi(profile: DbClientPortalProfile) {
  const { user, client, account_statement, password_updated_at } = profile

  return {
    userId: user.user_id,
    clientId: client.client_id,
    firstName: user.first_name,
    lastName: user.last_name,
    displayName: formatFullName(user.first_name, user.last_name),
    email: user.email,
    phone: user.phone ?? 'No registrado',
    documentId: client.identification_number,
    address: client.address ?? 'No registrada',
    avatarUrl: user.avatar_url,
    registeredAtLabel: formatDateLabel(client.registration_date),
    passwordUpdatedLabel: password_updated_at
      ? `Última actualización ${formatDateLabel(password_updated_at)}`
      : 'Última actualización hace 3 meses',
    accountStatus: mapDbAccountStatement(account_statement),
  }
}

function mapDbAccountStatement(statement: DbAccountStatement | null) {
  if (!statement) {
    return {
      statusLabel: 'Sin Deuda',
      balanceLabel: 'Saldo a favor',
      balanceAmount: '$0.00',
      lastProcessedLabel: 'Último estado de cuenta procesado exitosamente.',
    }
  }

  return {
    statusLabel: statement.status_label,
    balanceLabel: 'Saldo a favor',
    balanceAmount: `$${statement.balance_amount.toFixed(2)}`,
    lastProcessedLabel: `Último estado de cuenta procesado ${formatDateLabel(statement.processed_at)}.`,
  }
}

export function mapDbPetToUi(
  pet: DbPet,
  records: DbMedicalRecord[] = [],
  vaccinations: DbVaccination[] = [],
  nextAppointment: DbAppointment | null = null,
) {
  const latestVaccination = vaccinations
    .slice()
    .sort((a, b) => b.application_date.localeCompare(a.application_date))[0]

  return {
    id: String(pet.pet_id),
    petId: pet.pet_id,
    name: pet.name,
    species: pet.species?.name ?? 'Mascota',
    breed: pet.race?.name ?? 'Sin raza',
    ageLabel: pet.age != null ? `${pet.age} Años` : 'Sin edad',
    weightLabel: pet.weight_kg != null ? `${pet.weight_kg} kg` : 'Sin peso',
    sexLabel: formatGender(pet.gender),
    status: 'ACTIVO' as const,
    photoUrl: null,
    observations: pet.observations ?? 'Sin observaciones registradas.',
    lastDewormingLabel: latestVaccination
      ? formatDateLabel(latestVaccination.application_date)
      : 'Sin registro',
    dewormingStatusLabel: latestVaccination?.next_dose_date ? 'Al día' : 'Pendiente',
    recentHistory: records.map((record) => ({
      id: String(record.medical_record_id),
      dateLabel: formatDateLabel(record.created_at),
      diagnosis: record.diagnosis ?? 'Sin diagnóstico',
      symptoms: record.symptoms ?? 'Sin síntomas registrados',
      treatment: record.treatment ?? 'Sin tratamiento',
    })),
    upcomingAppointment: nextAppointment
      ? {
          service: nextAppointment.service?.name ?? 'Consulta',
          dateLabel: formatDateLabel(nextAppointment.scheduled_start),
          timeLabel: formatTimeLabel(nextAppointment.scheduled_start),
          status: mapDbAppointmentStatus(nextAppointment.status_id),
        }
      : null,
  }
}

export function mapDbAppointmentToCita(appointment: DbAppointment) {
  const status = mapDbAppointmentStatus(appointment.status_id)
  const pet = appointment.client_pet?.pet

  return {
    id: String(appointment.appointment_id),
    appointmentId: appointment.appointment_id,
    dateLabel: formatDateLabel(appointment.scheduled_start),
    timeLabel: formatTimeLabel(appointment.scheduled_start),
    petName: pet?.name ?? 'Mascota',
    petSpeciesBreed: formatSpeciesBreed(pet),
    petPhotoUrl: null,
    service: appointment.service?.name ?? 'Consulta',
    professionalName: formatFullName(
      appointment.veterinarian?.user?.first_name,
      appointment.veterinarian?.user?.last_name,
    ),
    status,
    statusLabel: mapDbAppointmentStatusLabel(status),
    notes: appointment.notes,
  }
}

export function mapDbMedicalRecordToConsultation(record: DbMedicalRecord) {
  return {
    id: String(record.medical_record_id),
    medicalRecordId: record.medical_record_id,
    dateLabel: formatDateLabel(record.created_at).toUpperCase(),
    serviceName: record.appointment?.service?.name ?? 'Consulta clínica',
    professionalName: formatFullName(
      record.appointment?.veterinarian?.user?.first_name,
      record.appointment?.veterinarian?.user?.last_name,
    ),
    symptoms: record.symptoms ?? 'Sin síntomas registrados',
    diagnosis: record.diagnosis ?? 'Sin diagnóstico',
    treatment: record.treatment ?? 'Sin tratamiento',
    weightAtVisit: record.weight_at_visit,
    temperature: record.temperature,
  }
}

export function mapDbVaccinationToUi(vaccination: DbVaccination) {
  const today = new Date()
  const nextDose = vaccination.next_dose_date ? new Date(vaccination.next_dose_date) : null

  let status: 'proxima' | 'vencida' | 'al_dia' = 'al_dia'
  let statusLabel = 'Al día'

  if (nextDose && !Number.isNaN(nextDose.getTime())) {
    if (nextDose.getTime() < today.getTime()) {
      status = 'vencida'
      statusLabel = 'Vencida'
    } else {
      status = 'proxima'
      statusLabel = `Próxima: ${formatDateLabel(vaccination.next_dose_date!)}`
    }
  }

  return {
    id: String(vaccination.vaccination_id),
    vaccinationId: vaccination.vaccination_id,
    name: vaccination.vaccine_name,
    doseLabel: vaccination.dose_number != null ? `Dosis ${vaccination.dose_number}` : 'Única',
    appliedDateLabel: formatDateLabel(vaccination.application_date),
    status,
    statusLabel,
  }
}

export function mapDbNextAppointmentToHome(appointment: DbAppointment | null) {
  if (!appointment) return null

  const status = mapDbAppointmentStatus(appointment.status_id)
  const pet = appointment.client_pet?.pet

  return {
    id: String(appointment.appointment_id),
    appointmentId: appointment.appointment_id,
    service: appointment.service?.name ?? 'Consulta',
    petName: pet?.name ?? 'Mascota',
    dateTimeLabel: formatDateTimeLabel(appointment.scheduled_start),
    professionalName: formatFullName(
      appointment.veterinarian?.user?.first_name,
      appointment.veterinarian?.user?.last_name,
    ),
    locationLabel: appointment.notes ?? 'Consultorio',
    status,
    statusLabel: mapDbAppointmentStatusLabel(status),
  }
}
