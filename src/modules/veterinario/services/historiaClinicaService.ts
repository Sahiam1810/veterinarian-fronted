import { vetApiFetch } from '../api/vetHttp'
import type { ApiClientPet, ApiMedicalRecord, ApiVaccination } from '../api/apiTypes'
import type { HistoriaClinicaPayload, MascotaDetail } from '../types'
import { buildHistoriaClinica } from '../utils/buildHistoriaClinica'
import { fetchVetMascotasBundle } from './vetMascotasService'

// Obtiene historia clínica real (medical records + vacunas) de una mascota.
export async function fetchHistoriaClinica(
  petId: string,
  detailHint?: MascotaDetail | null,
): Promise<HistoriaClinicaPayload | null> {
  const [medicalRecords, vaccinations, clientPets, detail] = await Promise.all([
    vetApiFetch<ApiMedicalRecord[]>('/api/medicalrecords'),
    vetApiFetch<ApiVaccination[]>('/api/vaccinations'),
    vetApiFetch<ApiClientPet[]>('/api/clientspets'),
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

  return buildHistoriaClinica({
    detail,
    clientPetIds,
    medicalRecords,
    vaccinations,
  })
}
