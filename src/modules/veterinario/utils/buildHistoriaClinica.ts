import type {
  ApiMedicalRecord,
  ApiVaccination,
} from '../api/apiTypes'
import type { HistoriaClinicaPayload, MascotaDetail } from '../types'

function formatDateLabel(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatShortDate(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function splitTreatment(treatment?: string | null): string[] {
  if (!treatment?.trim()) return ['Sin indicaciones registradas.']
  return treatment
    .split(/\n|;|\|/)
    .map((item) => item.trim())
    .filter(Boolean)
}

// Arma la historia clínica con medical records + vacunas del backend.
export function buildHistoriaClinica(input: {
  detail: MascotaDetail
  clientPetIds: string[]
  medicalRecords: ApiMedicalRecord[]
  vaccinations: ApiVaccination[]
}): HistoriaClinicaPayload {
  const idSet = new Set(input.clientPetIds.map((id) => id.toLowerCase()))

  const records = input.medicalRecords
    .filter((item) => idSet.has(item.clientPetId.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const vacunas = input.vaccinations
    .filter((item) => idSet.has(item.clientPetId.toLowerCase()))
    .sort(
      (a, b) =>
        new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime(),
    )
    .map((item) => ({
      id: item.id,
      name: item.vaccineName,
      appliedLabel: formatShortDate(item.applicationDate),
      nextLabel: formatShortDate(item.nextDoseDate),
    }))

  const latest = records[0]
  const consultas = records.map((record) => ({
    id: record.id,
    dateLabel: formatDateLabel(record.createdAt),
    typeLabel: record.diagnosticCode || 'Consulta',
    motivo: record.symptoms?.trim() || 'Sin motivo registrado.',
    diagnostico: record.diagnosticCode || undefined,
    tratamientoIndicaciones: splitTreatment(record.treatment),
  }))

  return {
    petId: input.detail.id,
    displayName: input.detail.name,
    patientCode: input.detail.patientCode,
    sexLabel: input.detail.sexLabel,
    breed: input.detail.breed,
    ageLabel: input.detail.ageLabel,
    weightLabel: latest?.weightAtVisit
      ? `${latest.weightAtVisit} kg`
      : input.detail.weightLabel,
    ownerName: input.detail.ownerName,
    ownerPhone: input.detail.ownerPhone,
    photoUrl: input.detail.photoUrl,
    consultas,
    vacunas,
    signosVitales: {
      temperatura: latest?.temperature != null ? `${latest.temperature} °C` : 'Sin dato',
      frecuenciaCardiaca: 'Sin dato',
      frecuenciaRespiratoria: 'Sin dato',
      mucosas: 'Sin dato',
    },
  }
}
