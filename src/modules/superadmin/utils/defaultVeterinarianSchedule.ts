import type { ApiCreateAvailabilityRequest } from '../services/superAdminAvailabilitiesService.ts'
import type { DiaSemana } from '../types/profesionalesSuperAdmin.types.ts'
import { mapDiaToDayOfWeek } from './superAdminApiMappers.ts'

// Horario por defecto al crear un veterinario (S35): solo en el alta, no al editar.
export const DEFAULT_VET_SCHEDULE_DIAS: readonly DiaSemana[] = [
  'LUNES',
  'MARTES',
  'MIÉRCOLES',
  'JUEVES',
  'VIERNES',
] as const

export const DEFAULT_VET_SCHEDULE_START = '07:00'
export const DEFAULT_VET_SCHEDULE_END = '17:00'

export const DEFAULT_VET_SCHEDULE_NOTICE =
  'Se creará un horario por defecto Lunes-Viernes 7:00 AM - 5:00 PM. Podrás editarlo después desde Profesionales.'

// Arma los 5 payloads Lunes-Viernes 07:00-17:00 para POST /api/Availabilities.
export function buildDefaultVeterinarianAvailabilityPayloads(
  veterinarianId: string,
): ApiCreateAvailabilityRequest[] {
  return DEFAULT_VET_SCHEDULE_DIAS.map((dia) => ({
    veterinarianId,
    dayOfWeek: mapDiaToDayOfWeek(dia),
    startTime: `${DEFAULT_VET_SCHEDULE_START}:00`,
    endTime: `${DEFAULT_VET_SCHEDULE_END}:00`,
    isActive: true,
    slotDurationMinutes: 30,
    maxConcurrentAppointments: 1,
  }))
}

export type CreateAvailabilityFn = (
  data: ApiCreateAvailabilityRequest,
) => Promise<{ id: string }>

// Crea una sola vez los bloques por defecto del veterinario recién dado de alta.
export async function createDefaultVeterinarianSchedule(
  veterinarianId: string,
  createAvailabilityFn: CreateAvailabilityFn,
): Promise<void> {
  const payloads = buildDefaultVeterinarianAvailabilityPayloads(veterinarianId)
  for (const payload of payloads) {
    await createAvailabilityFn(payload)
  }
}

// Payload del drawer "Editar Profesional": solo perfil, sin tocar horario (S35).
export function buildProfesionalEditSavePayload(fields: {
  name: string
  cmp: string
  especialidad: string
  email: string
  phone?: string
  status: 'Activo' | 'Inactivo'
  avatarUrl?: string
}) {
  return {
    name: fields.name.trim(),
    cmp: fields.cmp.trim(),
    especialidad: fields.especialidad,
    email: fields.email.trim(),
    phone: fields.phone?.trim() || undefined,
    status: fields.status,
    avatarUrl: fields.avatarUrl?.trim() || undefined,
  }
}
