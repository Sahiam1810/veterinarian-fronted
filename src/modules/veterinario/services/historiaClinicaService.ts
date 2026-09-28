import { vetApiFetch } from '../api/vetHttp'
import { ApiError } from '@/services/apiClient'
import type { ApiAppointment, ApiClientPet, ApiMedicalRecord, ApiVaccination } from '../api/apiTypes'
import type { HistoriaClinicaPayload, HistoriaOrden, MascotaDetail } from '../types'
import { buildHistoriaClinica } from '../utils/buildHistoriaClinica'
import { fetchVetMascotasBundle } from './vetMascotasService'
import {
  fetchMedicationOrdersByAppointment,
  fetchProcedureOrdersByAppointment,
  type ApiMedicationOrder,
  type ApiProcedureOrder,
} from './ordenesMedicasService'

function formatHistoryDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export interface ApiDiagnostic {
  id: string
  code?: string | null
  name?: string | null
  description?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface ApiCreateMedicalRecordRequest {
  diagnosticId: string
  symptoms?: string | null
  treatment?: string | null
  weightAtVisit?: number | null
  temperature?: number | null
}

export interface ApiCreateMedicalRecordResponse {
  id: string
}

// Catálogo de diagnósticos reales
export async function fetchDiagnostics(onlyActive = false): Promise<ApiDiagnostic[]> {
  const query = onlyActive ? '?onlyActive=true' : ''
  return vetApiFetch<ApiDiagnostic[]>(`/api/diagnostics${query}`).catch(async () => {
    return vetApiFetch<ApiDiagnostic[]>('/api/Diagnostics').catch(() => [])
  })
}

// Crea la historia clínica de una cita (POST /api/appointments/{appointmentId}/medical-record).
// MedicalRecordsController solo expone GET -- la creación vive en AppointmentsController,
// vinculada a la cita en la URL, no en el body.
export async function createMedicalRecord(
  appointmentId: string,
  data: ApiCreateMedicalRecordRequest,
): Promise<ApiCreateMedicalRecordResponse> {
  try {
    return await vetApiFetch<ApiCreateMedicalRecordResponse>(
      `/api/appointments/${appointmentId}/medical-record`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404) {
      throw err
    }

    return vetApiFetch<ApiCreateMedicalRecordResponse>(
      `/api/Appointments/${appointmentId}/medical-record`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
  }
}

// Obtiene historia clínica real (medical records + vacunas + diagnósticos) de una mascota.
export async function fetchHistoriaClinica(
  petId: string,
  detailHint?: MascotaDetail | null,
): Promise<HistoriaClinicaPayload | null> {
  const [medicalRecords, vaccinations, clientPets, diagnostics, detail] = await Promise.all([
    vetApiFetch<ApiMedicalRecord[]>('/api/medicalrecords').catch(async () => {
      return vetApiFetch<ApiMedicalRecord[]>('/api/MedicalRecords').catch(() => [])
    }),
    vetApiFetch<ApiVaccination[]>('/api/vaccinations').catch(async () => {
      return vetApiFetch<ApiVaccination[]>('/api/Vaccinations').catch(() => [])
    }),
    vetApiFetch<ApiClientPet[]>('/api/clientspets').catch(async () => {
      return vetApiFetch<ApiClientPet[]>('/api/ClientsPets').catch(() => [])
    }),
    fetchDiagnostics(false),
    detailHint
      ? Promise.resolve(detailHint)
      : fetchVetMascotasBundle().then(
          (bundle) => bundle.directory.detailsById[petId] ?? null,
        ),
  ])

  if (!detail) return null

  const clientPetIds = clientPets
    .filter((link) => link.petId.toLowerCase() === petId.toLowerCase())
    .map((link) => link.id)

  // Las órdenes se consultan por cita. Si el usuario no tiene permiso para
  // órdenes médicas, la historia clínica principal debe seguir funcionando.
  const appointments = await vetApiFetch<ApiAppointment[]>('/api/appointments').catch(
    () => [] as ApiAppointment[],
  )
  const petAppointments = appointments.filter((appointment) =>
    clientPetIds.some((clientPetId) => clientPetId.toLowerCase() === appointment.clientPetId.toLowerCase()),
  )

  const ordersByAppointmentId: Record<string, HistoriaOrden[]> = {}
  await Promise.all(
    petAppointments.map(async (appointment) => {
      const [medications, procedures] = await Promise.all([
        fetchMedicationOrdersByAppointment(appointment.id).catch(() => [] as ApiMedicationOrder[]),
        fetchProcedureOrdersByAppointment(appointment.id).catch(() => [] as ApiProcedureOrder[]),
      ])

      const veterinarian = appointment.veterinarianName || null
      ordersByAppointmentId[appointment.id.toLowerCase()] = [
        ...medications.map((order) => ({
          id: order.id,
          type: 'MEDICAMENTO' as const,
          dateLabel: formatHistoryDate(order.createdAt),
          veterinarian,
          status: order.status,
          items: order.items.map((item) => ({
            id: item.id,
            name: item.medicationName || 'Medicamento',
            notes: item.notes,
            unitPrice: item.unitPrice,
          })),
        })),
        ...procedures.map((order) => ({
          id: order.id,
          type: 'PROCEDIMIENTO' as const,
          dateLabel: formatHistoryDate(order.createdAt),
          veterinarian,
          status: order.status,
          resultFileUrl: order.resultFileUrl,
          items: order.items.map((item) => ({
            id: item.id,
            name: item.procedureName || 'Procedimiento',
            notes: item.notes,
            unitPrice: item.unitPrice,
          })),
        })),
      ]
    }),
  )

  return buildHistoriaClinica({
    detail,
    clientPetIds,
    medicalRecords,
    vaccinations,
    diagnostics,
    ordersByAppointmentId,
  })
}

